export type CarCategory = 'Sedan' | 'SUV' | 'Van' | 'Premium'

export interface Car {
  id: string
  name: string
  brand: string
  category: CarCategory
  seats: number
  transmission: 'Automatic' | 'Manual'
  fuel: 'Gasoline' | 'Diesel' | 'Hybrid' | 'Electric'
  pricePerDay: number
  rating: number
  location: string
  imageUrl: string
  tags: string[]
  description: string
  model3d?: {
    url: string
    description: string
    author: string
    sourceUrl: string
    licenseUrl: string
  }
}

export interface BookingPreview {
  id: string
  carName: string
  dateRange: string
  status: 'Confirmed' | 'Pending' | 'Completed'
  total: number
}
