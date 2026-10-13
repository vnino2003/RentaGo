import { featuredCars } from '../data/cars'
import { rental, eligible, resetVerification } from '../stores/rental'
import {
  dateAfter,
  draftError,
  quoteRental,
  timestamp,
  type Account,
  type Profile,
  type Reservation,
  type ReservationStatus,
  type VerificationStatus,
} from '../domain/rental'
export const delay = (ms = 500) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const accounts = new Map<string, { account: Account; password: string }>()
export const demoEmail = 'traveler@rentago.demo'
export const demoPassword = 'RentaGo123!'
export async function authenticate(email: string, password: string, name?: string) {
  await delay()
  const normalized = email.trim().toLowerCase()
  if (name) {
    if (accounts.has(normalized) || normalized === demoEmail)
      throw new Error('An account with this email already exists in this demo.')
    const account: Account = {
      id: crypto.randomUUID(),
      profile: {
        name: name.trim(),
        email: normalized,
        phone: '',
        address: '',
        birthDate: '',
        licenseSince: '',
      },
      profileComplete: false,
    }
    accounts.set(normalized, { account, password })
    rental.account = account
    resetVerification()
    return
  }
  if (normalized === demoEmail && password === demoPassword) {
    rental.account = {
      id: 'demo-traveler',
      profile: {
        name: 'Alex Santos',
        email: demoEmail,
        phone: '09171234567',
        address: 'Makati City, Metro Manila',
        birthDate: '1995-04-12',
        licenseSince: '2018-06-10',
      },
      profileComplete: true,
    }
    resetVerification()
    rental.verification.status = 'Verified'
    rental.verification.result = 'Pre-approved sample account. No identity checks performed.'
    rental.reservations = sampleReservations()
    return
  }
  const record = accounts.get(normalized)
  if (!record || record.password !== password)
    throw new Error(
      'Email or password does not match. Use an account created in this session, or the demo account.',
    )
  rental.account = record.account
  resetVerification()
}
export function profileError(profile: Profile) {
  if (profile.name.trim().split(/\s+/).length < 2) return 'Enter your first and last name.'
  if (!/^(\+63|0)9\d{9}$/.test(profile.phone.replace(/[\s-]/g, '')))
    return 'Enter a Philippine mobile number, e.g. 09171234567.'
  if (profile.address.trim().length < 10) return 'Enter your complete residential address.'
  const birth = new Date(profile.birthDate),
    license = new Date(profile.licenseSince),
    now = new Date()
  const ageCutoff = new Date()
  ageCutoff.setFullYear(now.getFullYear() - 21)
  const licenseCutoff = new Date()
  licenseCutoff.setFullYear(now.getFullYear() - 1)
  if (!profile.birthDate || !Number.isFinite(birth.getTime()) || birth > ageCutoff)
    return 'This demo rental policy requires drivers to be at least 21.'
  if (
    !profile.licenseSince ||
    !Number.isFinite(license.getTime()) ||
    license > licenseCutoff ||
    license < birth
  )
    return 'This demo policy requires a license held for at least one year.'
  return ''
}
export async function saveProfile(profile: Profile) {
  await delay()
  if (!rental.account) throw new Error('Please sign in.')
  const error = profileError(profile)
  if (error) throw new Error(error)
  rental.account.profile = { ...profile }
  rental.account.profileComplete = true
  resetVerification()
}
export async function getVehicles(fail = false) {
  await delay(650)
  if (fail) throw new Error('The collection could not be loaded. Please try again.')
  return featuredCars
}
export function available(
  carId: string,
  pickup: string,
  returnDate: string,
  pickupTime = '09:00',
  returnTime = '09:00',
) {
  if (carId === 'hyundai-staria-van') return false
  const start = timestamp(pickup, pickupTime),
    end = timestamp(returnDate, returnTime)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return false
  return !rental.reservations.some(
    (r) =>
      r.draft.carId === carId &&
      ['Confirmed', 'Active Rental'].includes(r.status) &&
      start < timestamp(r.draft.returnDate, r.draft.returnTime) &&
      end > timestamp(r.draft.pickup, r.draft.pickupTime),
  )
}
export async function simulateVerification(
  outcome: VerificationStatus,
  onProgress: (value: number) => void,
) {
  const v = rental.verification
  if (!rental.account?.profileComplete || !v.consent || !v.license || !v.identity || !v.selfie)
    throw new Error('Complete your profile, document previews, selfie and consent first.')
  v.status = 'In Progress'
  for (let value = 1; value <= 5; value++) {
    await delay(650)
    onProgress(value)
  }
  v.status = outcome
  v.result =
    outcome === 'Verified'
      ? 'Demo approved. All results were scripted; no identity or biometric check was performed.'
      : outcome === 'Rejected'
        ? 'Demo rejected: the sample document details did not match. Replace your previews and try again.'
        : 'Demo pending: an administrator must review this sample application before booking.'
}
export async function submitReservation(): Promise<Reservation> {
  await delay(800)
  if (!eligible.value || !rental.account)
    throw new Error('Complete verification before submitting a reservation.')
  const error = draftError(rental.draft)
  if (error) throw new Error(error)
  const car = featuredCars.find((c) => c.id === rental.draft.carId)
  if (!car) throw new Error('Choose a vehicle.')
  if (
    !available(
      car.id,
      rental.draft.pickup,
      rental.draft.returnDate,
      rental.draft.pickupTime,
      rental.draft.returnTime,
    )
  )
    throw new Error(
      'This car is unavailable for the selected schedule. Choose another car or dates.',
    )
  if (
    rental.reservations.some(
      (r) =>
        r.status !== 'Cancelled' &&
        r.draft.carId === car.id &&
        JSON.stringify(r.draft) === JSON.stringify(rental.draft),
    )
  )
    throw new Error('This request is already in My bookings.')
  const reservation: Reservation = {
    id: `RG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    accountId: rental.account.id,
    draft: { ...rental.draft },
    quote: quoteRental(rental.draft, car.pricePerDay),
    status: 'Pending Approval',
    createdAt: new Date().toISOString(),
  }
  rental.reservations.unshift(reservation)
  return reservation
}
export async function cancelReservation(id: string) {
  await delay()
  const r = rental.reservations.find((r) => r.id === id && r.accountId === rental.account?.id)
  if (!r || !['Pending Approval', 'Confirmed'].includes(r.status))
    throw new Error('This reservation cannot be cancelled.')
  r.status = 'Cancelled'
}
function sampleReservations(): Reservation[] {
  return (['Confirmed', 'Active Rental', 'Completed', 'Cancelled'] as ReservationStatus[]).map(
    (status, index) => {
      const draft = {
        ...rental.draft,
        carId: featuredCars[index % 2]!.id,
        pickup: dateAfter(index === 0 ? 6 : index === 1 ? -1 : -8),
        returnDate: dateAfter(index === 0 ? 8 : index === 1 ? 1 : -6),
      }
      return {
        id: `SAMPLE-${1001 + index}`,
        accountId: 'demo-traveler',
        draft,
        quote: quoteRental(draft, featuredCars[index % 2]!.pricePerDay),
        status,
        createdAt: new Date().toISOString(),
      }
    },
  )
}
