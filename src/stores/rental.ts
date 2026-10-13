import { computed, reactive } from 'vue'
import {
  dateAfter,
  type Account,
  type RentalDraft,
  type Reservation,
  type Verification,
} from '../domain/rental'
const emptyVerification = (): Verification => ({
  status: 'Not Started',
  consent: false,
  result: '',
})
export const rental = reactive({
  account: null as Account | null,
  verification: emptyVerification(),
  draft: {
    carId: '',
    pickup: dateAfter(1),
    returnDate: dateAfter(3),
    pickupTime: '09:00',
    returnTime: '09:00',
    pickupLocation: 'Downtown Manila',
    returnLocation: 'Downtown Manila',
    childSeat: false,
    additionalDriver: false,
  } as RentalDraft,
  reservations: [] as Reservation[],
})
export const eligible = computed(
  () => !!rental.account?.profileComplete && rental.verification.status === 'Verified',
)
export function clearDocuments() {
  for (const key of ['license', 'identity', 'selfie'] as const) {
    const item = rental.verification[key]
    if (item?.url.startsWith('blob:')) URL.revokeObjectURL(item.url)
    delete rental.verification[key]
  }
}
export function logout() {
  clearDocuments()
  rental.account = null
  rental.verification = emptyVerification()
  rental.reservations = []
}
export function resetVerification() {
  clearDocuments()
  rental.verification = emptyVerification()
}
export function selectCar(id: string) {
  rental.draft.carId = id
}
