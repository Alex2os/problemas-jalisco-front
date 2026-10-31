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
- Character counters use `src/components/CharacterCount.tsx`, on the right of the field-label row above the input. Keep title, description and comment counters consistent; do not put counters below inputs or between an input and its action button.
- The floating bottom navigation uses `colors.secondary` (raspberry pink) for active icons and labels. Preserve its extra `space.md` bottom offset above the safe-area calculation and the map error overlay's matching clearance.
- Orange primary buttons use white text/icons in light mode through `colors.onPrimary`; preserve the existing dark-mode foreground.
- The Más page no longer contains the Sesión section or Cerrar sesión button. Do not restore them as part of unrelated work.

## Report titles and category selection

- New reports require a user-written, nonblank, single-line title of up to 80 UTF-16 code units. Titles are stored separately from descriptions. The description-excerpt title experiment was reverted; do not restore it or generate titles from descriptions.
- The required title input belongs on `src/app/reportar/evidencia.tsx`, above the photos. Keep the red asterisk, character counter beside the label, inline Spanish validation, and focus/scroll to the title when continuing with invalid input. Empty or whitespace-only titles must block navigation to review.
- Keep the title and description labels free of helper subtitles. Photos and descriptions remain optional. Show the entered title on the review screen before publishing.
- Reuse `REPORT_TITLE_LIMIT` and `getReportTitleError` in `src/services/create-report.ts` for validation. Preserve the draft's title setter/reset and the title in both JSON and multipart submissions.
- API responses may contain a null title for legacy reports. Keep the existing category-based display fallback; prefer a nonblank stored title where a report title is displayed.
- Required-title support depends on API migration `002_report_titles.sql`. Disposable integration results do not establish that the application's database has been migrated.
- Category cards use compact local descriptions from `src/constants/report-categories.ts`, even when `/reports/categories` returns longer explanations. Preserve backend category IDs/names and the remote-description fallback for unknown future categories.
- The active catalog has eight categories, including `semaforos` (Semáforos), with the compact subtitle “Apagados o dañados”, a purple accent and the outline traffic-light glyph rendered by `CategoryIcon` (preserve the outline style used by the other categories). Keep category icons consistent across selection, map, feed, review and detail screens; preload `CATEGORY_ICON_FONTS` before capturing map markers. Keep its visual/legacy lookup and search/display-title support consistent. Existing `otro` reports are not reclassified. Banquetas y accesibilidad and a broader Señales category remain suggestions only; do not add other categories or subcategories without a separate request.

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
- The static “Hasta 5 MB por foto” helper was removed. Keep visible Spanish errors for oversized prepared uploads and the actual-file-size check before sending. Preserve photo preparation/compression; the upload limit applies to the prepared file, not an automatic rejection of every original above 5 MiB.
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

## Report location search

- `src/features/reports/components/LocationSearch.tsx` above the map calls authenticated `GET /locations/search?query=...` through `src/services/search-locations.ts`. Search only on an explicit Buscar/keyboard submit action; public Nominatim forbids autocomplete. Do not request GPS permission for text search or persist search history.
- Keep the search bar and Buscar button without the removed bold “Buscar dirección o lugar” label above them. Preserve the accessible input label, placeholder, keyboard submission, clear action and minimum touch targets.
- Match backend query validation: at least three characters after whitespace normalization and at most 200 raw UTF-16 code units. Encode query text, validate response coordinates/fields, and preserve Spanish backend errors. Search requires the API version exposing `/locations/search`; do not silently substitute a public-geocoder call or report-feed search.
- Show up to five named candidates with their address details. Preserve null address components and distinguish empty matches from request failures. Keep the shared ErrorBanner visible during retries with only its retry spinner for that request.
- Selecting a result moves the adjustable center pin; the existing reverse lookup still runs after movement completes. Keep the pin authoritative, retain the current selection on search failure/no matches, and prevent late GPS responses from overriding a selected search result.
- `createLocationSearch` in `src/services/location-search.ts` guards pending/stale queries and keeps previous results/errors during retries. Dispose/reset search state on navigation and session changes; ignore responses after editing/clearing the query. Keep the search endpoint's raw query/error payloads out of API diagnostics in `src/services/api.ts`.
- The map is taller and responds to viewport height (320–440 logical pixels). Preserve the marker, live address preview, explicit GPS button, movement debounce, retries, attribution and keyboard/safe-area handling. Search coordinates use the same bounds as the API: latitude 18.92–22.75, longitude -105.68–-101.50.
- Preserve `tests/location-search.test.cjs` coverage for explicit-only requests, validation, stale responses, lifecycle disposal, retry recovery, partial/malformed responses, exact bounds and diagnostic privacy. The real-client integration script also exercises search followed by reverse lookup; fake-provider integration does not establish native map/keyboard/GPS behavior.

## Report screens and recommendations

- The visible Reportes tab is `src/app/(tabs)/mis-reportes.tsx`; `reports.tsx` is a hidden legacy route. Inspect navigation before choosing which screen to edit.
- There are two report detail paths: `/reporte/[id]` and `/reports/[report_id]`. Keep shared behavior consistent where both paths expose it; do not remove or rename routes as part of styling work.
- Report sharing is currently removed, including the detail screen's share button and handler. The app-link experiment and its helper/tests/docs were reverted. Do not restore text-only sharing, custom-scheme report links or a share button unless requested; HTTPS app-link/domain configuration remains future work.
- Keep the comment form above existing comments. The character counter belongs beside the input label, not between the input and publish button.
- Empty or whitespace-only descriptions show plain `No hay descripción.` text. Do not add a bordered description section or extra heading unless requested.
- Para ti consumes `/reports/recommended`; preserve server ranking and recommendation reasons. It is currently rule-based, not an AI feature.
- Preserve Todos, Para ti, Reportado and Resuelto, along with title/type/location/description search. The shared `matchesReportSearch` includes descriptions, ignores case/accents and matches query words across searchable fields. Search in Para ti must include remaining recommendation pages, not silently stop at the first page.
- Feed description previews use two lines with a photo and three without, with a trailing ellipsis when truncated. Keep the full description in the detail screen; do not shorten stored text.
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

