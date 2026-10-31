# AGENTS.md — ProblemasJalisco Frontend

## Project overview

ProblemasJalisco is a cross-platform application built with Expo, React Native, Expo Router and TypeScript. It communicates with a separate ASP.NET Core REST API backed by PostgreSQL.

Target platforms: Android, iOS and web. Android and iOS are currently the validated platforms; web compatibility remains a work in progress.

The product is a practical civic reporting tool, not a social network. Prioritize accurate reports, useful discovery and follow-up over engagement mechanics.

## Architecture

- `src/app/`: Expo Router routes, layouts and navigation entry points.
- `src/features/`: domain-specific components and functionality.
- `src/components/`: reusable, domain-independent UI components.
- `src/services/`: API communication, session management and shared infrastructure.
- `src/hooks/`: reusable React hooks.
- `src/store/`: shared application state.
- `src/constants/`: design tokens, themes, categories and shared constants.

Prefer existing structures. Do not create unnecessary directories, abstractions or wrapper modules.

Keep route files focused on navigation and screen composition where practical. Do not change public routes as part of unrelated refactors.

## Naming conventions

| Element | Convention | Example |
|---|---|---|
| React component files | PascalCase | `ReportCard.tsx` |
| React hooks | camelCase, starting with `use` | `useBackendReports.ts` |
| Services and utilities | kebab-case | `create-report.ts` |
| Constants and configuration files | kebab-case | `report-categories.ts` |
| Zustand store hooks | camelCase, starting with `use` | `useDraftStore.ts` |
| Variables and functions | camelCase | `getReportById` |
| Types, interfaces and React components | PascalCase | `Report`, `ReportCard` |
| Module-level constants | UPPER_SNAKE_CASE when appropriate | `API_BASE_URL` |
| Directories | kebab-case | `default-components/` |

Preserve Expo Router filename conventions, dynamic segments, route groups and React Native platform suffixes such as `.ios.tsx` and `.web.ts`.

## Imports and dependencies

- Use the `@/` alias for imports within `src/` when appropriate.
- Do not introduce legacy `@/src/` paths.
- Keep import paths consistent with actual filenames, including letter case.
- Update all imports, exports, tests and references when moving or renaming files.
- Avoid unnecessary barrel files and circular dependencies.
- Do not add packages without a clear technical reason.

## Design system

- Reuse existing design tokens from `src/constants/`, including `tokens.ts`, `palette.ts`, `design.ts` and `theme.ts`.
- Prefer semantic colors and shared spacing, typography and radius scales over hardcoded values.
- Do not introduce competing palettes or theme systems.
- Preserve existing light/dark behavior where implemented.
- Dark-mode styling uses the shared dark palette: subdued surfaces, softer borders/status fills and readable secondary text. Keep the Reportar flow's dark background as the visual reference; styling requests do not authorize removing cards, changing icon shapes or rearranging layouts. Keep light-mode styling unchanged unless explicitly requested.
- The Reportes header uses `colors.background` in dark mode and `colors.surface` in light mode. Preserve its existing search/filter spacing; the attempted light-mode header adjustment was reverted.
- NativeWind/Tailwind may be used where appropriate, but do not migrate working StyleSheet components solely for stylistic consistency.
- Do not change visual identity, typography or component appearance during unrelated refactors.
- Do not add shadows, glow, decorative elevation or simulated shadows. Use flat fills, borders and spacing for separation.
- Support both light and dark themes using semantic colors, including contrasting foreground colors for filled buttons.
- Keep touch targets at least `size.touch` (48 logical pixels). Allow labels to grow with accessibility text settings.
- Reportes filters use one grouped control with equal-width rectangular tabs and a clear selected state. Preserve this design; do not turn them back into pills. Selection changes immediately; the sliding highlight animation was removed at the user's request.
- Put padding inside pressed/highlighted containers so icons, labels and chevrons do not touch the background edges. Preserve this in both themes.
- Shared buttons use direct style arrays with explicit press state. Preserve the existing rendering fix; verify native rendering before switching back to callback-only Pressable styles.
- Full-width button content must center the icon and label together. Apply full-width inner content only to full-width buttons to avoid intrinsic sizing regressions.

## Connection errors and retries

- Use the shared API client in `src/services/api.ts` for backend calls. Preserve Spanish connection/timeout messages and server validation messages; native fetch failures can be plain Error objects, not only TypeError.
- Distinguish transport failures, timeouts, HTTP errors and unreadable responses. An HTML error page from a proxy must not hide the HTTP status behind a JSON parsing error.
- Network failures must not log the user out. Preserve session handling for actual authentication failures.
- Never automatically retry report writes. A lost response can follow a committed change; preserve the message asking users to check their reports before repeating the action.
- Reuse `ErrorBanner`. Its retry action is compact, red, full-width and centered below the message, with no shadow. Preserve its 48px effective touch target even when its visible height is smaller.
- Error banners need an explicit stable width, including in the map's centered overlay. Switching to a loading spinner must not collapse the banner or clip its message.
- During an error retry, show only the retry control's spinner for that request. Suppress duplicate refresh-control, header, empty-list and pagination loaders across all relevant screens, not just the map.
- Keep the error visible until recovery, and keep previously loaded reports visible if refresh fails. Clear the error on success instead of replacing the banner with a separate loading screen.

## Report photos and fullscreen viewer

- `appendPhotos` in `src/services/report-media.ts` is asynchronous. Both report creation and adding photos must await it before sending the multipart request.
- Expo 58 fetch rejects the old React Native `{ uri, name, type }` multipart descriptors with `Unsupported FormDataPart implementation`. Use `File` from `expo-file-system` on native and a fetched Blob on web. Preserve the repeated `photos` field, filenames, three-photo limit and 5 MiB per-file checks, including actual file size. Let fetch set the multipart boundary.
- The backend photo implementation was checked with its disposable integration suite, including creation, retrieval, persistence across API restart, limits and ownership. This does not establish that an application's database migration or deployment storage is configured; do not alter those without authorization.
- `src/features/reports/components/ReportPhotos.tsx` provides the shared fullscreen viewer. Keep horizontal, paged swiping instead of Anterior/Siguiente buttons. Open at the tapped photo, update the counter after swiping, and preserve the current photo when the viewport width or photo list changes where possible.
- The viewer intentionally stays dark in either app theme, using `palette.dark`. Keep explicit light text/icon colors, the photo counter, the swipe hint for multiple photos, and the compact bottom Cerrar control with a 48px minimum touch target. Preserve Android Back dismissal and safe-area handling.
- A failed prefetched/offscreen photo must not dismiss the photo currently being viewed. Report an opening failure when the failed photo becomes the visible page.
- Native swipe, layout and dismissal behavior still requires device checks; tests and exports alone do not validate those interactions.

## Report location address preview

- `LocationPicker` uses `GetLocationAddress` in `src/services/get-location-address.ts`, calling authenticated `GET /locations/reverse?latitude=...&longitude=...`.
- Manual map selection must not request device-location permission or use native reverse geocoding. Only the explicit GPS action requests permission; preserve its timeout and movement guard.
- While the map moves, clear the old address and invalidate stale results without sending a request. Request the address after movement completes, using the debounce and lifecycle guards in `createAddressLookup`.
- Keep the selected coordinates authoritative. Check that response coordinates match; preserve null/missing components and explicit no-coverage responses rather than inventing a street, colonia or municipality.
- On lookup failure or no coverage, preserve the selected point and provide the shared retry UI with a single spinner. Successful retries clear the previous error.
- Preserve OpenStreetMap attribution and backend provider limits. Do not add continuous per-movement calls, background tracking or a direct public-geocoder fallback.
- The backend contract and provider behavior are documented in its `docs/location-preview.md`. Test mapping, no coverage, stale responses, movement scheduling and retry recovery; native map/permission behavior still needs device validation.

## Report screens and recommendations

- The visible Reportes tab is `src/app/(tabs)/mis-reportes.tsx`; `reports.tsx` is a hidden legacy route. Inspect navigation before choosing which screen to edit.
- There are two report detail paths: `/reporte/[id]` and `/reports/[report_id]`. Keep shared behavior consistent where both paths expose it; do not remove or rename routes as part of styling work.
- Report sharing is currently removed, including the detail screen's share button and handler. The app-link experiment and its helper/tests/docs were reverted. Do not restore text-only sharing, custom-scheme report links or a share button unless requested; HTTPS app-link/domain configuration remains future work.
- Keep the comment form above existing comments. The character counter belongs beside the input label, not between the input and publish button.
- Empty or whitespace-only descriptions show plain `No hay descripción.` text. Do not add a bordered description section or extra heading unless requested.
- Para ti consumes `/reports/recommended`; preserve server ranking and recommendation reasons. It is currently rule-based, not an AI feature.
- Preserve Todos, Para ti, Reportado and Resuelto, along with type/location search. Search in Para ti must include remaining recommendation pages, not silently stop at the first page.
- Deduplicate paginated reports by ID, guard against stale responses after navigation or identity changes, and clear personalized caches on session changes. Reuse existing session/cache infrastructure.
- Location is optional and requested through an explicit action. Keep the centered explanation and full-width, noticeable `Activar ubicación` button. Do not restore the removed secondary “Puedes seguir…” messages.
- Preserve location timeouts and guest/permission-denied fallback. Do not persist location or add background tracking as part of unrelated work.

## Backend integration

- Preserve existing REST API contracts, request/response types and authentication behavior.
- Do not hardcode local network addresses, credentials or tokens in source files.
- Use the existing environment-based API configuration.
- Keep secrets out of Git.
- Do not modify the backend repository unless the user explicitly authorizes backend or cross-repository work. For authorized API work, read and follow its own AGENTS.md and keep changes scoped to that task.

## Platform compatibility

- Preserve Android and iOS functionality.
- Do not assume native libraries work on web.
- Use platform-specific implementations when necessary.
- Treat web support as an explicit compatibility task, not an excuse to remove native functionality.
- A successful bundle does not replace manual testing on devices.

## Testing and validation

Use Node 22.13 or later as documented in README.md; Expo 58 reports Node 20 as unsupported even when some commands complete.

After meaningful changes, run:

```bash
npm run typecheck
npm run lint
npm test
git diff --check
```

For changes affecting navigation, components or module resolution, also run:

```bash
npx expo export --platform android
```

Report failures clearly. Distinguish pre-existing failures from regressions.

For API integration changes, use the backend's disposable integration suite with `JALISCO_TEST_FRONTEND_DIR` pointing to this checkout. Keep integration-script imports consistent with current kebab-case service filenames. Never point these tests at the application database.

Documentation-only changes require review and `git diff --check`; application builds are unnecessary.

## Git and change management

- Inspect `git status` before making changes.
- Preserve existing uncommitted work.
- Do not reset, discard or overwrite unrelated changes.
- Keep changes focused on the requested task.
- Do not commit, push, rebase or force-push without explicit authorization.
- Do not modify environment files or secrets unless explicitly requested.
- Explain significant architectural decisions and summarize changed files.

## Working principles

- Prefer straightforward, readable TypeScript.
- Reuse existing components and services before creating alternatives.
- Avoid speculative refactoring.
- Preserve working functionality and user-visible behavior unless explicitly asked to change them.
- When uncertain about an architectural decision, inspect existing patterns before introducing a new one.
- For staged feature work, finish and validate each agreed step and report its outcome before moving to the next stage.
- Do not claim visual/device validation from typecheck, tests or export alone. If a reported visual issue is unclear, inspect the actual screen/pressed state before guessing. Expo Fast Refresh can lag; confirm the current build is visible before adding unnecessary UI changes.

