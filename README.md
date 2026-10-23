# Jalisco Problems

Expo / React Native app for viewing local reports on a map, searching reports, and posting reports and comments.

## Run locally

1. Use Node 22.13 or later and run `npm ci`.
2. Set `EXPO_PUBLIC_API_URL` in `.env` to your backend URL (see `.env.example`). Android emulators default to `http://10.0.2.2:5140`; iOS simulators default to `http://localhost:5140`. Physical devices need your computer's LAN address and a reachable backend.
3. Run `npm start`, then launch the Android or iOS app.

The map uses `react-native-maps` and requires a native target. Authenticated actions use a token stored with Expo SecureStore. The backend is a separate service and is not included here.

## Report data

Successful report, search, detail, and comment reads are cached in memory for the current app session. Navigation reuses cached results and simultaneous reads share one request. Use **Actualizar** to fetch fresh data. Restarting the app clears this cache.

Creating a report invalidates report lists and reloads the map. Posting a comment displays the server's inserted comment and invalidates cached comment queries. The map and reports list read from the same cache when focused. Failed reads can be retried; failed refreshes preserve previously cached data.

API requests share a configurable base URL, error handling, and a 15-second timeout. Search text is URL encoded. Errors are displayed in the relevant screen, and failed submissions preserve entered text.

## Checks

- `npm run typecheck`
- `npm run lint`
- `npm test` (cache reuse, refresh, request deduplication, failure recovery, and mutation races)

Live API and device interaction checks require a running backend and emulator/device.

## Appearance

The app follows the device theme by default. **Cuenta → Apariencia** lets you choose Sistema, Claro, or Oscuro; the choice is saved on the device. Shared colors live in `constants/palette.ts`; typography, spacing, radii, dividers, touch targets, and content width live in `constants/design.ts`. Reusable controls live in `components/app/ui.tsx`. The interface uses native system fonts.

Navigation transitions and the report sheet respect the device's reduced-motion preference. The map uses a dark Google Maps style on Android and the native appearance on Apple Maps. Verify map rendering, the keyboard, and theme persistence on a device or emulator.

Reports and comment threads use `FlatList` with native pull-to-refresh. The map has a fixed action area below it; reporting begins by selecting a point and opens a native modal form. Registration returns to sign-in with a confirmation. All existing API endpoints and the session cache remain in use.

For device acceptance, check light/dark themes, 320–430 pt phone widths, larger accessibility text, keyboard focus/submit/scrolling, Android system Back, iOS modal dismissal, map marker callouts, and failed requests with cached content. Native bundle exports do not replace those interaction checks.

## Likes and comments

Deploy the updated API and point `EXPO_PUBLIC_API_URL` at it. Report rows and details show database-derived `like_count`, `comment_count`, and the authenticated viewer's `liked_by_me`. Public reads send the saved token when available; login/logout invalidate personalized request caches. No counters are stored as a substitute for the database.

Like/unlike uses `PUT`/`DELETE /reports/{id}/like`. Controls wait for confirmation, share a per-report pending lock, and display failures without inventing a successful result. Report entities in the existing cache notify feed/detail subscribers immediately after confirmed mutations. Per-report write serialization and read/session guards prevent delayed responses from reversing newer state or crossing accounts.

Comments load 50 at a time with “Ver más comentarios”. Posting displays the inserted server comment (including ID, author, timestamp, and permissions). Only server-authorized delete controls are shown; deletion requires confirmation and updates the shared total after the API succeeds. Failed posts retain the draft. Refresh retrieves current database state, including changes made by other users. App restart clears the in-memory cache and reloads persisted interactions using the saved SecureStore token.

`npm test` covers duplicate taps, failed writes/retry, cross-screen shared state, read/write races, account changes, and invalidation. `tests/api-integration.cjs` is invoked by the API's disposable PostgreSQL suite to exercise the actual mobile service code against the running API. That test substitutes only native platform/SecureStore bindings; HTTP requests and database persistence are real. It does not render the native UI or validate device keyboard gestures.

Feature files added: `components/app/report-interactions.tsx`, `hooks/use-report-state.ts`, `services/ReportInteractions.ts`, `services/reportState.ts`, `services/session.ts`, `tests/load-services.cjs`, `tests/interactions.test.cjs`, and `tests/api-integration.cjs`.

Feature files updated: `components/app/report-row.tsx`, `app/reports/[report_id].tsx`, `app/(tabs)/account.tsx`, `app/auth/login.tsx`, `services/api.ts`, `services/cache.ts`, `services/types.ts`, `services/GetAllReports.ts`, `services/GetFilteredReports.ts`, `services/GetReportById.ts`, `services/GetCommentsByReportId.ts`, and `services/CreateNewComment.ts`. Existing unrelated edits are preserved.

## Photos and report status

Reports support up to **3 photos**, selected from the gallery or camera. The form prepares JPEG previews before publishing; report creation with photos is submitted as one multipart operation. Images appear in report rows and the detail gallery, with fullscreen viewing. Authenticated owners can upload more photos within the limit or remove existing ones. Permission denial, cancellation, processing failures, pending uploads and API failures have explicit states; uncertain uploads instruct users to refresh before retrying.

Status is **Reportado**, **Sigue presente**, or **Resuelto**. Only the owner sees update controls. A resolved issue can be reopened as still present; there is no speculative “in progress” status. Updates use the server's version to reject stale changes, then refresh the shared report snapshot/history. A basic paginated history shows authors and timestamps. Existing reports without photos remain supported.

Deploy the backend migration and configure its durable photo directory first; see the backend's `docs/report-photos-status.md`. `EXPO_PUBLIC_API_URL` must be reachable from the phone because image URLs resolve against the same API configuration. Camera/gallery permissions are configured in `app.json`; **rebuild an existing development/production native app** after adding the image-picker/manipulator native modules. An OTA JavaScript update alone cannot add native modules or permission declarations. Expo Go must match SDK 57 and include these modules. Use the project's Node 22 configuration; older Node versions may produce Expo/Metro engine warnings.

Added frontend files: `components/app/photo-picker.tsx`, `components/app/report-photos.tsx`, `components/app/report-status.tsx`, `services/ReportMedia.ts`, `services/report-format.ts`, `tests/report-media.test.cjs`, and `tests/media-api-integration.cjs`.

Modified frontend files: `app.json`, `package.json`, `package-lock.json`, `app/(tabs)/index.tsx`, `app/reports/[report_id].tsx`, `components/app/report-row.tsx`, `services/CreateReport.ts`, `services/api.ts`, `services/types.ts`, `services/session.ts`, and this README. No existing user-owned reports screen exists; owners manage photos/status from report details.

`npm test` now additionally covers multipart authentication/header handling, photo count/size validation, status version payloads, shared snapshots and failed writes. The backend suite invokes `tests/media-api-integration.cjs` using the real mobile API services, HTTP, PostgreSQL and stored image files, including reopen and ownership checks; only native bindings are emulated. Device camera/permissions, gestures, layout and keyboard behavior still require Android/iOS manual testing.
