@AGENTS.md

# Project: GitHub Repository Card List

A single-page Next.js app that fetches a GitHub user's public repositories and displays them as filterable cards. Built as a developer-portfolio component.

## Goals

- Fetch public repos from `https://api.github.com/users/{username}/repos`.
- Render each repo as a card showing: name, description, primary language, star count, plus forks, last pushed (relative), topics, and `fork`/`archived` badges.
- Handle repos with no description gracefully (fallback text).
- Real-time client-side search input that filters the already-fetched data by repo name. No page reloads, no extra API calls per keystroke.
- Handle loading, error, and empty states with user-friendly UI.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS.
- Client-side fetch on mount. No server-side data fetching for repos.
- No external UI or data-fetching libraries — plain `fetch`, plain React state.

## File Structure

```
src/
├── app/
│   ├── _components/       # Co-located, private (underscore prefix keeps it out of routing)
│   │   ├── RepoCard.tsx   # Presentational card
│   │   └── RepoList.tsx   # Client component: fetch + state + search filter
│   ├── globals.css
│   ├── layout.tsx         # Root layout, sets Geist font via CSS variable
│   └── page.tsx           # Server component shell; passes username to <RepoList>
└── lib/
    └── github.ts          # Repo type, language colors, relative-time + count formatters
```

Rules:
- Route-adjacent components live in `src/app/_components/`. Anything reused across routes moves to `src/components/`.
- Pure helpers, types, and constants live in `src/lib/`.
- `page.tsx` and `layout.tsx` stay server components. `RepoList.tsx` is the only `"use client"` boundary.

## Configuration

- Target username is a module-level constant in `src/app/page.tsx` (`GITHUB_USERNAME`). Default: `HDRUK`. Change it there.
- No environment variables. If a token or configurable username is needed later, introduce `NEXT_PUBLIC_*` env vars.

## Conventions

- **Fetch state** is modelled as a discriminated union (`loading | error | success`), not multiple booleans.
- **Errors** are user-friendly strings mapped from HTTP status (404 → "user not found", 403 → "rate limit reached", else → generic). Never surface raw `Error.message` for unknown failures.
- **Search filter** operates on `state.repos` via `useMemo`, case-insensitive substring match on `repo.name` only.
- **"Updated" timestamps** use `pushed_at` (last code activity), not `updated_at` (metadata edits).
- **Empty description** renders "No description provided." in italic, muted text — do not render an empty paragraph.
- **Accessibility**: search input has a `<label>`, result count is in an `aria-live="polite"` region, loading grid has `aria-busy`, error panel has `role="alert"`.
- **Styling**: Tailwind utility classes only. No CSS modules, no inline `<style>` blocks. Dark mode via `dark:` variants driven by `prefers-color-scheme`.

## Verification

Before claiming a change is done, run all four:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run dev   # then load http://localhost:3000 and confirm the golden path
```

Type check + lint + build passing is necessary but not sufficient — the client-side fetch and search filter must be exercised in a browser.
