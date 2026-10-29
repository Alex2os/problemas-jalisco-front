# ProblemasJalisco

Expo / React Native app backed by the separate `jalisco-problems-api` service.

## Run

Use Node 22.13 or later, install with `npm ci`, and set `EXPO_PUBLIC_API_URL` in `.env`. The API client uses this value directly, with no platform fallback; the current value is `http://localhost:5140`. Android emulators normally use `http://10.0.2.2:5140`; iOS simulators use `http://localhost:5140`; physical phones need a reachable LAN/server address. Run `npm start` and open an Android or iOS target. The map requires a native target.

The API must have its database migrations and durable photo storage configured. No backend schema changes are needed for these frontend changes.

## Data and authentication

The map, report details, Reportes, account statistics, photos, likes, and comments use API responses. There are no sample reports, fabricated counters, randomly generated folios, local report databases, or offline submission queues. The UI displays the database report ID as the report number. Errors remain errors; unavailable or empty API responses never fall back to sample data.

Reports and interactions are cached only in memory. Report screens and comments refresh every 15 seconds while focused and when the app becomes active again. Leaving a screen stops its timer. Server-confirmed mutations update subscribed screens immediately. Account changes clear personalized lists and reject stale responses. The Reportes list is public and shows all server reports. Profile statistics and owner controls use the API's `can_manage` flag.

Only the bearer token is persisted, in Expo SecureStore. User identity comes from the login response/server-issued token; every write is authorized by the API. Expired or rejected tokens return the app to a signed-out state. Unsubmitted form entries and appearance preferences are held in memory. Startup removes report/draft/comment storage keys from the old demo implementation; those records are never uploaded.

Login and registration are available in Perfil. Login returns users to the report form or comment thread that requested authentication. Public report and comment reads work without login. Creating reports, posting/deleting comments, likes, photo management, and status changes require authentication. Only API-authorized owners see photo and status controls; comment deletion also follows server permissions.

## Reporting

The existing four-step form submits to `POST /reports/create` or `/reports/create-with-photos`. Photos are prepared as JPEG files, limited to three and 5 MB each, then uploaded in the same multipart request as the report. Temporary selected files are needed for the upload; they are not a substitute for server storage. Descriptions are limited to the backend's 255 characters; comments to 100.

Successful submissions show the server-confirmed report number. Failed writes retain form entries. If creation succeeds but loading its details fails, the confirmed report number still appears so the user is not prompted to submit a duplicate.

The API stores category (`type`), description, coordinates, author, photos, and status, and resolves the address from the coordinates. It currently has no custom address, anonymous author, or contact-information fields. The form does not offer unsupported persistence controls.

The UI displays only Reportado and Resuelto. Existing older status values display as Reportado. Owners can mark a report resolved or reported with server version checks. There is no follow-up timeline or status history in the current details page. Comments appear at the bottom and update automatically, without a refresh button.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm test`

Tests cover API failures without demo fallbacks, confirmed report creation and ownership, session restoration/expiration, shared interaction updates, concurrent writes, login requirements, photo validation, and stale responses across accounts. `tests/api-integration.cjs` and `tests/media-api-integration.cjs` are invoked by the backend's disposable PostgreSQL integration suite. They exercise the actual frontend services and current report store against HTTP, PostgreSQL, and durable photo storage. Only native SecureStore/platform/multipart bindings are substituted.

Device checks are still required for map rendering, camera/gallery permissions, keyboard behavior, and layout. A successful TypeScript check or API integration test does not verify native UI rendering.
