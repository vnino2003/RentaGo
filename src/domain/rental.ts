export type VerificationStatus =
  'Not Started' | 'In Progress' | 'Pending Review' | 'Verified' | 'Rejected'
export type ReservationStatus =
  'Pending Approval' | 'Confirmed' | 'Active Rental' | 'Completed' | 'Cancelled'
export interface Profile {
  name: string
  email: string
  phone: string
  address: string
  birthDate: string
  licenseSince: string
}
export interface Account {
  id: string
  profile: Profile
  profileComplete: boolean
}
export interface DocumentPreview {
  name: string
  url: string
  sample: boolean
}
export interface Verification {
  status: VerificationStatus
  consent: boolean
  license?: DocumentPreview
  identity?: DocumentPreview
  selfie?: DocumentPreview
  result: string
}
export interface RentalDraft {
  carId: string
  pickup: string
  returnDate: string
  pickupTime: string
  returnTime: string
  pickupLocation: string
  returnLocation: string
  childSeat: boolean
  additionalDriver: boolean
}
export interface Quote {
  days: number
  base: number
  childSeat: number
  additionalDriver: number
  relocation: number
  deposit: number
  total: number
  due: number
}
export interface Reservation {
  id: string
  accountId: string
  draft: RentalDraft
  quote: Quote
  status: ReservationStatus
  createdAt: string
}
export const locations = ['Downtown Manila', 'Quezon City Hub', 'NAIA Terminal 3', 'BGC Taguig']
export function manilaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}
export function dateAfter(days: number) {
  const date = new Date(`${manilaToday()}T12:00:00+08:00`)
  date.setUTCDate(date.getUTCDate() + days)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
export function timestamp(date: string, time: string) {
  return new Date(`${date}T${time}:00+08:00`).getTime()
}
export function draftError(draft: RentalDraft) {
  const start = timestamp(draft.pickup, draft.pickupTime),
    end = timestamp(draft.returnDate, draft.returnTime)
  if (!Number.isFinite(start) || !Number.isFinite(end))
    return 'Choose valid pickup and return dates and times.'
  if (start < Date.now()) return 'Pickup must be in the future.'
  if (end <= start) return 'Return must be after pickup.'
  if (end - start > 30 * 86400000) return 'Choose a rental of 30 days or less.'
  if (!locations.includes(draft.pickupLocation) || !locations.includes(draft.returnLocation))
    return 'Select a pickup and return branch.'
  return ''
}
export function quoteRental(draft: RentalDraft, dailyRate: number): Quote {
  const duration =
    timestamp(draft.returnDate, draft.returnTime) - timestamp(draft.pickup, draft.pickupTime)
  const days = Number.isFinite(duration) && duration > 0 ? Math.ceil(duration / 86400000) : 0
  const base = days * dailyRate,
    childSeat = draft.childSeat ? days * 250 : 0,
    additionalDriver = draft.additionalDriver ? days * 300 : 0,
    relocation = draft.pickupLocation !== draft.returnLocation ? 750 : 0
  const total = base + childSeat + additionalDriver + relocation,
    deposit = 5000
  return {
    days,
    base,
    childSeat,
    additionalDriver,
    relocation,
    total,
    deposit,
    due: total + deposit,
  }
}
export const money = (amount: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount)
