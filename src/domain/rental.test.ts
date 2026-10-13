import { describe, it, expect, beforeEach, vi } from 'vitest'
import { dateAfter, draftError, quoteRental, type RentalDraft } from './rental'
import { rental, logout } from '../stores/rental'
import { submitReservation, available, saveProfile, profileError } from '../services/mockApi'

const draft = (): RentalDraft => ({
  carId: 'toyota-vios-2026',
  pickup: dateAfter(1),
  returnDate: dateAfter(3),
  pickupTime: '09:00',
  returnTime: '09:00',
  pickupLocation: 'Downtown Manila',
  returnLocation: 'Downtown Manila',
  childSeat: false,
  additionalDriver: false,
})
beforeEach(() => {
  logout()
  rental.draft = draft()
  vi.useRealTimers()
})
describe('rental estimate', () => {
  it('separates the refundable deposit from rental cost', () => {
    expect(quoteRental(draft(), 1850)).toMatchObject({
      days: 2,
      base: 3700,
      total: 3700,
      deposit: 5000,
      due: 8700,
    })
  })
  it('charges each started day and selected extras once', () => {
    const value = {
      ...draft(),
      returnTime: '09:01',
      childSeat: true,
      additionalDriver: true,
      returnLocation: 'BGC Taguig',
    }
    expect(quoteRental(value, 1850)).toMatchObject({
      days: 3,
      base: 5550,
      childSeat: 750,
      additionalDriver: 900,
      relocation: 750,
      total: 7950,
      due: 12950,
    })
  })
  it('rejects reversed dates and invalid branches', () => {
    expect(draftError({ ...draft(), returnDate: dateAfter(0) })).toContain('after pickup')
    expect(draftError({ ...draft(), returnLocation: 'Unknown' })).toContain('branch')
  })
  it('rejects invalid availability ranges', () => {
    expect(available('toyota-vios-2026', dateAfter(2), dateAfter(1))).toBe(false)
  })
})
describe('eligibility enforcement', () => {
  it.each(['Not Started', 'In Progress', 'Pending Review', 'Rejected'] as const)(
    'blocks %s at service submission',
    async (status) => {
      vi.useFakeTimers()
      rental.account = {
        id: 'test',
        profile: {
          name: 'Alex Santos',
          email: 'demo@example.test',
          phone: '09171234567',
          address: 'Makati Metro Manila',
          birthDate: '1995-04-12',
          licenseSince: '2018-01-01',
        },
        profileComplete: true,
      }
      rental.verification.status = status
      const request = submitReservation()
      const assertion = expect(request).rejects.toThrow('verification')
      await vi.runAllTimersAsync()
      await assertion
    },
  )
  it('creates only a pending request, never an automatically confirmed rental', async () => {
    vi.useFakeTimers()
    rental.account = {
      id: 'test',
      profile: {
        name: 'Alex Santos',
        email: 'demo@example.test',
        phone: '09171234567',
        address: 'Makati Metro Manila',
        birthDate: '1995-04-12',
        licenseSince: '2018-01-01',
      },
      profileComplete: true,
    }
    rental.verification.status = 'Verified'
    const request = submitReservation()
    await vi.runAllTimersAsync()
    expect((await request).status).toBe('Pending Approval')
    const duplicate = submitReservation()
    const assertion = expect(duplicate).rejects.toThrow('already')
    await vi.runAllTimersAsync()
    await assertion
  })
  it('requires re-verification when profile details change', async () => {
    vi.useFakeTimers()
    const profile = {
      name: 'Alex Santos',
      email: 'demo@example.test',
      phone: '09171234567',
      address: 'Makati Metro Manila',
      birthDate: '1995-04-12',
      licenseSince: '2018-01-01',
    }
    rental.account = { id: 'test', profile, profileComplete: true }
    rental.verification.status = 'Verified'
    const saved = saveProfile({ ...profile, name: 'Alex Reyes' })
    await vi.runAllTimersAsync()
    await saved
    expect(rental.verification.status).toBe('Not Started')
  })
  it('enforces the demo driver-age policy', () => {
    expect(
      profileError({
        name: 'Alex Santos',
        email: 'demo@example.test',
        phone: '09171234567',
        address: 'Makati Metro Manila',
        birthDate: dateAfter(-365),
        licenseSince: '2018-01-01',
      }),
    ).toContain('21')
  })
})
