# Backend work deferred

This file records deferred backend work and the status of previously deferred features.

## Implemented: street lookup without phone location access

Authenticated `GET /locations/reverse?latitude=...&longitude=...` now supplies the address preview in `LocationPicker`. Manual map selection does not request device-location permission; only the explicit GPS action does. Lookups wait until map movement finishes, then use the existing debounce and stale-response protection. The API shares its geocoder/cache with report creation; see the API's `docs/location-preview.md` for contracts and provider limits. Device validation remains separate from automated tests.

## Report description suggestions

Add an endpoint to the existing backend that supplies suggestions for the report description, potentially based on the selected category. Final behavior and API contract will be decided later. Sugerencias and its hardcoded quick tags have been removed from Evidencia for now. Reintroduce the UI when the endpoint is ready.
