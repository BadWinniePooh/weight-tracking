# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack at localhost:3000

# Build & Production
npm run build        # Production build (Next.js standalone output)
npm run start        # Start production server

# Code Quality
npm run lint         # ESLint
npm run check-deps   # Check for unused dependencies

# Database
npm exec prisma migrate dev    # Apply migrations in development
npm exec prisma studio         # Open Prisma Studio (database GUI)
npm exec prisma generate       # Regenerate Prisma client after schema changes

# Docker
docker compose up -d           # Start containerized app
docker compose down            # Stop containers
```

## Architecture

**ScaleTrack** is a Next.js 16 App Router full-stack weight tracking app using SQLite + Prisma, NextAuth.js (JWT, 30-day sessions), and Chart.js visualizations.

### Key Directories

- `src/app/` — Pages and API routes (App Router)
- `src/components/` — React components: `ui/` (primitives), `layout/` (nav/header/footer)
- `src/lib/` — Auth config (`auth.ts`), Prisma client (`prisma.ts`), theme utilities
- `src/hooks/` — Custom React hooks (theme)
- `src/types/` — Shared TypeScript types
- `prisma/` — Schema + migrations

### Data Model

Three Prisma models: **User** (UUID PK, username/email unique, password hash, reset token) → **UserEntry** (weight float + date + optional notes, cascade delete) and **UserSettings** (weight goal, loss rate, macronutrient ratios — 1:1 with User, cascade delete).

### API Routes

All under `src/app/api/`:
- `auth/[...nextauth]` — NextAuth handler
- `auth/register`, `auth/forgot-password`, `auth/reset-password` — Auth flows
- `entries` / `entries/[id]` / `entries/delete-all` — Weight entry CRUD
- `import` — Excel file import (up to 3 measurements/day via xlsx)
- `settings` — User preferences

### Authentication

NextAuth.js credentials provider. Server components use `getServerSession(authOptions)` to protect routes. Edge middleware blocks `/design-system` in production. Password reset uses Nodemailer (configured via `EMAIL_*` env vars).

### Theme System

Custom HSL-based token system using CSS variables. `ThemeManager.ts` manages state, `useThemeColor.ts` hook exposes semantic color tokens, `ThemeSync.tsx` synchronizes across tabs. Tailwind uses class-based dark mode (`dark:`). A `/design-system` route exists for development documentation.

### Docker

Multi-stage build on Node 22 Alpine. `better-sqlite3` is compiled from source for Alpine compatibility. `docker-entrypoint.sh` runs `prisma migrate deploy` before app start. Database persists in named volume at `/app/data`. Next.js builds with `output: "standalone"`.

## Environment Variables

Required for local dev (create `.env`):
```
DATABASE_URL="file:./data/weight-tracking.db"
NEXTAUTH_SECRET=<random-key>
NEXTAUTH_URL=http://localhost:3000
```

Optional for password reset:
```
EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, EMAIL_FROM, EMAIL_SERVER_SECURE
TIMEZONE="Europe/Berlin"
```

## Notes

- TypeScript build errors are ignored in `next.config.ts` (intentional — affects `design-system` page)
- Prisma client is generated to `src/generated/prisma/` — don't edit generated files
- Input validation uses Valibot; date handling uses date-fns + date-fns-tz
- `@/*` path alias maps to `src/*`

## Active Technologies
- TypeScript 5 / Node.js 20 (Next.js 16 App Router) + Next.js 16, Prisma 7 (SQLite via better-sqlite3), NextAuth.js 4, date-fns 4, React 19 (001-csv-export)
- SQLite — `UserEntry` table (fields: `id`, `value: Float`, `date: DateTime`, `notes: String?`, `userId`) (001-csv-export)

## Recent Changes
- 001-csv-export: Added TypeScript 5 / Node.js 20 (Next.js 16 App Router) + Next.js 16, Prisma 7 (SQLite via better-sqlite3), NextAuth.js 4, date-fns 4, React 19
