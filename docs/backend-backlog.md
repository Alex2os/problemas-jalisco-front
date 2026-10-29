# Backend work deferred

These features are planned for later. Their endpoints and frontend integrations are not implemented yet.

## Street lookup without phone location access

Add an endpoint to the existing backend that resolves a street address from the coordinates selected on the map. Use it for the live street preview, so choosing a point manually does not require phone location permission or GPS. “Mi ubicación” will still require device location access. Reuse the backend geocoding service already used when creating reports. Final route, request shape, and caching behavior will be decided when implementing it.

## Report description suggestions

Add an endpoint to the existing backend that supplies suggestions for the report description, potentially based on the selected category. Final behavior and API contract will be decided later. Sugerencias and its hardcoded quick tags have been removed from Evidencia for now. Reintroduce the UI when the endpoint is ready.
