import type { BookingPreview, Car } from '../types/car'

export const featuredCars: Car[] = [
  {
    id: 'toyota-vios-2026',
    name: 'Vios G CVT',
    brand: 'Toyota',
    category: 'Sedan',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Gasoline',
    pricePerDay: 1850,
    rating: 4.8,
    location: 'Downtown Manila',
    imageUrl: '/vehicles/vios.webp',
    tags: ['Fuel efficient', 'Daily drive', 'Best value'],
    description: 'A practical sedan for city errands, campus trips, and short out-of-town rentals.',
  },
  {
    id: 'mitsubishi-montero-sport',
    name: 'Montero Sport GLS',
    brand: 'Mitsubishi',
    category: 'SUV',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 3400,
    rating: 4.9,
    location: 'Quezon City Hub',
    imageUrl: '/vehicles/montero.png',
    tags: ['Family ready', 'Long drive', 'High clearance'],
    description:
      'A comfortable SUV for barkada trips, family plans, and luggage-heavy travel days.',
  },
  {
    id: 'hyundai-staria-van',
    name: 'Staria Premium',
    brand: 'Hyundai',
    category: 'Van',
    seats: 8,
    transmission: 'Automatic',
    fuel: 'Diesel',
    pricePerDay: 5200,
    rating: 4.7,
    location: 'NAIA Terminal 3',
    imageUrl: '/vehicles/staria.png',
    tags: ['Airport pickup', 'Group trips', 'Large cabin'],
    description:
      'Space to stretch out, room for your luggage, and comfort for the whole group. A great fit for airport pickups and shared getaways.',
  },
  {
    id: 'tesla-model-3',
    model3d: {
      url: '/vehicles/tesla-model-3-2018.glb',
      description: '2018 Model 3 reference. Actual rental year, trim and colour may differ.',
      author: 'Ameer Studio',
      sourceUrl:
        'https://sketchfab.com/3d-models/tesla-2018-model-3-5ef9b845aaf44203b6d04e2c677e444f',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
    name: 'Model 3 Long Range',
    brand: 'Tesla',
    category: 'Premium',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Electric',
    pricePerDay: 6500,
    rating: 4.9,
    location: 'BGC Taguig',
    imageUrl: '/vehicles/tesla.jpg',
    tags: ['Premium', 'EV', 'Weekend'],
    description:
      'A quiet electric drive with a refined cabin. Make your next weekend away feel a little more special.',
  },
]

export const bookingPreviews: BookingPreview[] = [
  {
    id: 'BK-1008',
    carName: 'Montero Sport GLS',
    dateRange: 'Oct 18 - Oct 20',
    status: 'Confirmed',
    total: 6800,
  },
  {
    id: 'BK-1009',
    carName: 'Vios G CVT',
    dateRange: 'Oct 25 - Oct 26',
    status: 'Pending',
    total: 1850,
  },
]

export const categories = ['All', 'Sedan', 'SUV', 'Van', 'Premium'] as const
