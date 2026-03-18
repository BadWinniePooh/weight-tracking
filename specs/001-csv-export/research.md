# Research: CSV Export for Weight Data

**Feature**: `001-csv-export` | **Date**: 2026-03-18

## Decision Log

---

### 1. CSV Generation Approach

**Decision**: Build the CSV string manually in the API route handler — no external CSV library.

**Rationale**: The export schema is fixed to two columns (`date`, `weight`). Manual construction is 3 lines of code and introduces zero dependencies. Libraries like `papaparse` or `csv-stringify` add complexity with no benefit at this scope.

**Alternatives considered**:
- `papaparse` — overkill; designed for parsing, not generation
- `csv-stringify` (Node streams) — adds a dependency and streaming complexity not needed for ≤10k rows
- `xlsx` (already in project) — wrong format; produces binary Excel, not CSV

---

### 2. Date Formatting

**Decision**: Use `date-fns` `format(date, "yyyy-MM-dd")` to produce YYYY-MM-DD strings.

**Rationale**: `date-fns` is already a project dependency (v4.1.0). Using it avoids raw `Date.toISOString().slice(0, 10)` which is also correct but less explicit.

**Alternatives considered**:
- `date-fns-tz` — unnecessary; the export only needs the calendar date, not timezone conversion. The `date` field in `UserEntry` is stored as a UTC DateTime. Using local format is consistent with how the table page currently displays dates.
- Native `Intl.DateTimeFormat` — works but verbose for a simple YYYY-MM-DD pattern

**Note**: The `UserEntry.date` field is a Prisma `DateTime` stored as SQLite integer (Unix ms). When read via Prisma, it arrives as a JavaScript `Date` object. `format(entry.date, "yyyy-MM-dd")` will format in server local time. Since this is a personal app with a configurable `TIMEZONE` env var used elsewhere, this is consistent with existing behavior.

---

### 3. Download Mechanism

**Decision**: Use an anchor tag with `href="/api/entries/export"` triggering a standard browser navigation (GET request), relying on the `Content-Disposition: attachment` response header to prompt a file download.

**Rationale**: NextAuth uses HTTP-only cookies for session management. A plain browser navigation to the API route will automatically include session cookies, so authentication works without any JavaScript fetch + blob workaround. This is the simplest correct approach.

**Alternatives considered**:
- `fetch()` + `URL.createObjectURL(blob)` — works but unnecessarily complex; requires manual cleanup of blob URLs
- Signed URL / pre-auth token — adds a whole auth layer for no gain in a single-user personal app
- Server Action — not appropriate for file downloads

---

### 4. API Route Placement

**Decision**: `src/app/api/entries/export/route.ts` — nested under the existing `entries` resource.

**Rationale**: Consistent with the existing pattern (`entries/`, `entries/[id]/`, `entries/delete-all/`). The export is semantically an operation on the entries collection.

**Alternatives considered**:
- `/api/export` (top-level) — less resource-oriented; inconsistent with current structure
- `/api/entries?format=csv` — query-param content negotiation is an anti-pattern in Next.js route handlers

---

### 5. Export Button Placement

**Decision**: Add the "Export CSV" button to the table page header (`src/app/table/page.tsx`), next to the existing "Delete All" button.

**Rationale**: The table page is where users view all entries — the natural place to offer a download of that data. The header already has a flex row with `justify-between` for the title and action buttons.

**Alternatives considered**:
- Settings page — less discoverable; users expect data actions near the data
- Separate `/export` page — unnecessary indirection for a one-click action
- Home/Data Entry page — wrong context; that page is for creating entries

---

### 6. Filename

**Decision**: `weight-export-YYYY-MM-DD.csv` where the date is the export date (today's date from the server response headers or computed client-side).

**Rationale**: Descriptive, sortable, unique across multiple exports. FR-006 requires the filename to clearly identify its contents. The `Content-Disposition` header is set server-side: `attachment; filename="weight-export-2026-03-18.csv"`.

---

### 7. Empty Dataset Handling

**Decision**: Return a valid CSV with only the header row (`date,weight\n`) when the user has no entries.

**Rationale**: FR-007 requires this. An empty file with headers is valid CSV and opens correctly in spreadsheet apps.
