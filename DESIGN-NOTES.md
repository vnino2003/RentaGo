# RentaGo Customer UI

Component-based Vue 3 / Ionic frontend. No backend or payments are connected.

## Design references

- https://turo.com/ : location/date search, scannable vehicle cards, saved cars.
- https://www.sixt.com/ : pickup/return search hierarchy and premium vehicle presentation.

Original RentaGo palette: forest #123F35, gold #E9BD39, charcoal and white.
Desktop navigation becomes Ionic bottom tabs on small screens.

## Assets

The customer-approved generated logo is stored in public/rentago-logo.png.
Vehicle images are representative model images for this local prototype, not photos of actual rental inventory or guaranteed trim variants. Replace them with owned fleet photos before release.

- Vios: https://www.toyota.com.ph/index.php/vios
- Montero Sport: https://www.mitsubishi-motors.com.ph/cars/montero-sport
- Staria: https://www.hyundai.com/ph/en/build-a-car/price-list
- Tesla: https://images.unsplash.com/photo-1560958089-b8a1929cea89

## Frontend behavior

Search validates dates and passes dates/location to the car collection. Availability is not checked against inventory. Categories, text search, price sorting, and saved-car filtering work on mock data. Favorites persist in browser local storage; account display-name edits last for the session. Bookings are sample itineraries. Reserve displays an explicit unavailable notice.
