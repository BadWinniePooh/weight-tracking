# Tasks: CSV Export for Weight Data

**Input**: Design documents from `/specs/001-csv-export/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api-export.md ✓, quickstart.md ✓

**Tests**: No test framework is configured in this project. Verification uses Chrome DevTools MCP per user request (see Phase 4).

**Organization**: Single user story (P1) — all implementation is in one phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US1]**: User Story 1 — Download Full Weight History as CSV

---

## Phase 1: Setup

**Purpose**: No new project structure required. All infrastructure (Next.js App Router, Prisma, NextAuth) is already in place. The `export/` route directory is created implicitly by placing the route file.

*(No setup tasks — skip to Phase 2)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No new foundational infrastructure needed. Authentication, database, and API routing are all operational.

*(No foundational tasks — skip to Phase 3)*

---

## Phase 3: User Story 1 — Download Full Weight History as CSV (Priority: P1) 🎯 MVP

**Goal**: User clicks "Export CSV" on the table page and receives a `weight-export-YYYY-MM-DD.csv` file containing all their weight entries with `date` and `weight` columns.

**Independent Test**: Log in, navigate to `/table`, click "Export CSV", verify download contains correct headers and all entries in YYYY-MM-DD / numeric format. Works even with zero entries (header-only CSV).

### Implementation for User Story 1

- [x] T001 [P] [US1] Create export API route in `src/app/api/entries/export/route.ts`: authenticate via `getServerSession(authOptions)`, query `prisma.userEntry.findMany({ where: { userId }, orderBy: { date: "asc" }, select: { value: true, date: true } })`, build CSV string with `date-fns` `format(entry.date, "yyyy-MM-dd")` for dates and `entry.value.toString()` for weights, return `new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="weight-export-${today}.csv"` } })`. Return 401 JSON if unauthenticated. Return header-only CSV (`date,weight\n`) when no entries exist.

- [x] T002 [P] [US1] Modify `src/app/table/page.tsx`: wrap the existing "Delete All" button in a `<div className="flex gap-2">` container, add an `<a href="/api/entries/export" download>` anchor before it containing a `<Button variant="outline" disabled={loading}>Export CSV</Button>`. The export button is always shown (not gated on `entries.length > 0`) so it satisfies FR-007. The `disabled={loading}` prevents download before entries have loaded. Update the outer header div to wrap title + button group.

**Checkpoint**: User Story 1 is complete. Navigate to `/table`, click "Export CSV", verify file downloads with correct format.

---

## Phase 4: Polish & Verification

**Purpose**: Chrome DevTools MCP verification of the end-to-end export flow, as requested.

- [x] T003 Start the dev server (`npm run dev`) and open Chrome to `http://localhost:3000`, then use Chrome DevTools MCP to verify the CSV export end-to-end: navigate to `/login`, authenticate, navigate to `/table`, click the "Export CSV" button, intercept the network request to `/api/entries/export`, and confirm the response has `Content-Type: text/csv`, `Content-Disposition: attachment; filename="weight-export-..."`, and a body that starts with `date,weight` followed by correctly formatted rows (YYYY-MM-DD dates and numeric weight values). Also verify the button is visible and not blocked by any UI errors.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A — no tasks
- **Foundational (Phase 2)**: N/A — no tasks
- **User Story 1 (Phase 3)**: No prerequisites — can start immediately
- **Polish (Phase 4)**: Depends on T001 and T002 being complete

### User Story Dependencies

- **User Story 1 (P1)**: T001 and T002 have no dependencies on each other — they touch different files and can be implemented in parallel.

### Within User Story 1

- T001 (API route) and T002 (UI button) are fully parallel — different files, zero shared state.
- T003 (verification) requires both T001 and T002 complete and the dev server running.

### Parallel Opportunities

- T001 and T002 can be executed simultaneously by separate agents or in the same session as independent edits.

---

## Parallel Example: User Story 1

```bash
# T001 and T002 can be executed in parallel (different files):
Task T001: "Create src/app/api/entries/export/route.ts"
Task T002: "Modify src/app/table/page.tsx to add Export CSV button"

# Then sequentially:
Task T003: "Verify end-to-end with Chrome DevTools MCP"
```

---

## Implementation Strategy

### MVP (User Story 1 Only — this IS the entire feature)

1. Implement T001 (API route) and T002 (UI button) — can be done in parallel
2. Start dev server and validate manually: click Export CSV, check downloaded file
3. Run T003 Chrome DevTools MCP verification
4. Feature complete ✓

### Incremental Delivery

This feature has a single user story. Both tasks (T001, T002) must be complete before the feature is usable. T001 alone provides a working API endpoint testable via `curl`; T002 alone provides a button that 404s. Together they deliver the complete feature.

---

## Notes

- No database migrations needed
- No new dependencies needed — `date-fns` is already installed
- `UserEntry.date` is stored as UTC `DateTime` — `date-fns` `format()` formats in server local time, consistent with existing app behavior
- The `<a download>` attribute on the anchor tag triggers a file download; browser session cookies are sent automatically, so NextAuth session auth works without a fetch+blob pattern
- CSV values (`date` = `\d{4}-\d{2}-\d{2}`, `weight` = numeric) never contain commas or quotes, so no CSV escaping is needed
