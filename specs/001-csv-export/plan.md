# Implementation Plan: CSV Export for Weight Data

**Branch**: `001-csv-export` | **Date**: 2026-03-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-csv-export/spec.md`

## Summary

Add a server-side CSV export endpoint (`GET /api/entries/export`) that streams all weight entries for the authenticated user as a plain-text CSV file, plus an "Export CSV" button on the table page that triggers a browser download.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 20 (Next.js 16 App Router)
**Primary Dependencies**: Next.js 16, Prisma 7 (SQLite via better-sqlite3), NextAuth.js 4, date-fns 4, React 19
**Storage**: SQLite — `UserEntry` table (fields: `id`, `value: Float`, `date: DateTime`, `notes: String?`, `userId`)
**Testing**: No test framework configured (no test files in repo)
**Target Platform**: Web — Node.js server + browser client
**Project Type**: Full-stack web application (Next.js App Router)
**Performance Goals**: Full export of ~3,650 rows in under 5 seconds (SC-001); trivially met by a single synchronous Prisma query
**Constraints**: Authenticated users only; NextAuth cookie-based session; no external services required
**Scale/Scope**: Single-user export; dataset bounded by daily weight entries (~1–10 years)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`/.specify/memory/constitution.md`) has not been configured — it contains only placeholder template content. No principle-based gates can be evaluated. Proceeding without constitution violations.

**Post-Phase 1 re-check**: No violations identified. Implementation is minimal and direct.

## Project Structure

### Documentation (this feature)

```text
specs/001-csv-export/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api-export.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   └── entries/
│   │       └── export/
│   │           └── route.ts        # NEW: GET /api/entries/export → text/csv
│   └── table/
│       └── page.tsx                # MODIFIED: add Export CSV button
└── components/
    └── ui/
        └── Button.tsx              # EXISTING: reuse as-is
```

**Structure Decision**: Single Next.js project (Option 1). The export is a thin new API route alongside existing `src/app/api/entries/` routes, with a UI addition to the existing table page. No new directories beyond the `export/` route folder are needed.

## Complexity Tracking

> No constitution violations to justify.
