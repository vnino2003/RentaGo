# RentaGo customer frontend

## Scope

Vue 3, TypeScript, Ionic Vue, Vue Router and Motion for Vue. This is an interactive frontend demonstration, not an authenticated or secure production system. No payment, identity service, biometric analysis, backend or database is connected.

## Information architecture

- Discover: photographic homepage, collections, rental process and service principles.
- Collection: search, categories, price, seats, transmission, fuel, branch, date availability and saved cars. Loading, failure/retry and empty states are included.
- Vehicle: dedicated image gallery, thumbnails, fullscreen modal, specifications, rental conditions and reservation entry.
- Account: sign in, register, profile completion and verification.
- Reservation: schedule, extras, estimate and gated submission.
- Dashboard / bookings: eligibility, requests, active rentals, history, account information and cancellation.

The old homepage date strip duplicated the reservation form without enforcing eligibility. The new homepage focuses on vehicle discovery; schedule editing lives in the catalog filter sheet and reservation workflow. Guest bookings no longer show someone else's sample trips.

## Ownership boundaries

`src/domain/rental.ts` defines typed entities, Manila date handling, schedule validation and the pure pricing calculation.

`src/stores/rental.ts` owns the current account, verification, rental draft and reservations. This state intentionally lasts only until the page reloads. Favorite vehicle IDs alone use browser local storage through `useSavedCars`.

`src/services/mockApi.ts` implements delayed mock requests, sample account login, profile validation, verification scenarios, availability, request submission and cancellation. A backend adapter can replace this layer while keeping the view contracts. The backend must independently enforce authorization, eligibility, availability, pricing, review decisions and duplicate protection in production.

`src/components` owns the shared header, status indicators, progress steps, upload control, reveal animation and vehicle gallery/cards. `src/views` owns routed screens. `src/theme` owns design tokens and responsive styling. A single Ionic router outlet owns transitions across the entire customer journey; the shared bottom navigation is route-driven. This avoids nested tab-cache overlap when returning from checkout to bookings.

## Demo walkthrough

1. Browse as a guest. Open a vehicle and select Sign in to reserve.
2. Register with sample details and a disposable demo password. Alternatively, Use verified demo account opens seeded sample rentals.
3. Complete the profile. Fill sample details avoids entering personal information.
4. Consent to local previews, select sample license and supporting ID, then a sample selfie.
5. Choose Verified, Pending Review or Rejected. All OCR, comparison, facial and liveness results are explicitly scripted. Pending Review requires simulated reviewer approval. Rejected supports resubmission.
6. Resume the preserved reservation, choose schedule and extras, accept demo terms and submit. A successful submission creates Pending Approval only.
7. Open My bookings to inspect or cancel. Demo approval is explicitly marked as a simulation.

Sample account: `traveler@rentago.demo` / `RentaGo123!`. New accounts and passwords exist only in this browser session; never use a real password. Signing out clears session documents and reservations. No real password reset is offered.

## Document handling

Images use local object URLs, basic file-type/size/decode validation and simulated progress. They are never sent over the network or saved to local storage. Removing a preview or signing out revokes its object URL. Optional camera capture requires browser permission and stops on leaving the verification screen. Sample previews require no camera or personal documents.

Production integration requires explicit retention rules, encrypted private storage, access controls, consent records, genuine provider results, secure review tools and server-side verification decisions. The current client-side status is not an identity assurance mechanism.

## Pricing and availability

Demo rentals use started 24-hour blocks in Philippine time, capped at 30 days. Optional child seats are PHP 250/day, additional drivers PHP 300/day, and different return branches PHP 750. A PHP 5,000 refundable deposit is separate from the rental subtotal. No payment is collected. Rates and rules are configurable examples, not a statement of universal Philippine rental law.

The Staria is marked unavailable for demonstration. Confirmed/active sample reservations block overlapping dates. Pending requests do not lock inventory; a real backend must arbitrate approval atomically.

## Visual references and assets

- Turo: https://turo.com/ (discovery, rental search and clear vehicle cards).
- SIXT: https://www.sixt.com/ (schedule and branch hierarchy).
- Porsche: https://www.porsche.com/international/models/ (vehicle-focused presentation).
- Tesla: https://www.tesla.com/model3 (automotive imagery; page content access was limited).
- Dribbble: https://dribbble.com/shots/27661481-Car-Rental-App-UI-Vehicle-Booking-Search-Details-Screens (vehicle detail and mobile discovery concepts).
- Behance: https://www.behance.net/gallery/222025999/Premium-Car-Rental-Mobile-App-UX-UI-Design (identified as a reference, full page returned 403).
- Business-policy reference: https://www.hertzphilippines.com/terms-conditions (example minimum driver age and license tenure; not a universal policy).

The approved RentaGo logo is a generated raster asset. Vehicle photography sources are listed in DESIGN-NOTES.md. The Montero interior is from the same manufacturer's official model page. Model images are representative, not actual fleet photos. Replace with owned vehicle photography and finalized terms before release.

No matching licensed 3D model has been bundled. The details page clearly explains 3D unavailability and provides the image-gallery fallback. It does not misrepresent a 2D image as a 3D scene. The Tesla landscape option is a wider presentation of the same photo, not a second vehicle angle.

## Validation

Run `npm run build` for TypeScript and the production build. Run `npx vitest run` for pricing, invalid schedules, eligibility gates, duplicate requests and profile re-verification tests. Browser checks cover guest registration, rejected and pending verification, preserved vehicle selection, estimate totals, request creation and cancellation. All animations respect reduced-motion preferences.
