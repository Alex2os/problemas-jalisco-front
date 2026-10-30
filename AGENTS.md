# AGENTS.md — ProblemasJalisco Frontend

## Project overview

ProblemasJalisco is a cross-platform application built with Expo, React Native, Expo Router and TypeScript. It communicates with a separate ASP.NET Core REST API backed by PostgreSQL.

Target platforms: Android, iOS and web. Android and iOS are currently the validated platforms; web compatibility remains a work in progress.

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
- NativeWind/Tailwind may be used where appropriate, but do not migrate working StyleSheet components solely for stylistic consistency.
- Do not change visual identity, typography or component appearance during unrelated refactors.

## Backend integration

- Preserve existing REST API contracts, request/response types and authentication behavior.
- Do not hardcode local network addresses, credentials or tokens in source files.
- Use the existing environment-based API configuration.
- Keep secrets out of Git.
- Do not modify the backend repository from this frontend workspace.

## Platform compatibility

- Preserve Android and iOS functionality.
- Do not assume native libraries work on web.
- Use platform-specific implementations when necessary.
- Treat web support as an explicit compatibility task, not an excuse to remove native functionality.
- A successful bundle does not replace manual testing on devices.

## Testing and validation

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

