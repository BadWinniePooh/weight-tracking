# API Contract: GET /api/entries/export

**Feature**: `001-csv-export` | **Date**: 2026-03-18

## Endpoint

```
GET /api/entries/export
```

## Authentication

Requires an active NextAuth session (HTTP-only cookie). Returns `401` if unauthenticated.

## Request

No query parameters. No request body.

**Headers** (sent automatically by browser):
```
Cookie: next-auth.session-token=<session-token>
```

## Response: 200 OK

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="weight-export-YYYY-MM-DD.csv"
```

**Body** (plain text, UTF-8):
```csv
date,weight
2024-01-01,82.5
2024-01-02,82.3
2026-03-18,79.1
```

- First line: literal header `date,weight`
- Subsequent lines: one entry per line, ordered by date ascending
- `date`: ISO 8601 date in `YYYY-MM-DD` format
- `weight`: numeric string, full precision as stored (e.g., `82.5`, `80.125`)
- Line separator: LF (`\n`)

**Empty dataset response** (user has no entries):
```csv
date,weight
```
(header only, 200 OK — not a 204)

## Response: 401 Unauthorized

```json
{ "error": "Unauthorized" }
```

## Response: 500 Internal Server Error

```json
{ "error": "Export failed" }
```

## Filename Convention

`weight-export-{YYYY-MM-DD}.csv` where the date is the server's current date at the time of export (formatted using the same date-fns pattern as the rest of the app).

Example: `weight-export-2026-03-18.csv`

## Notes

- This endpoint is idempotent — repeated calls return the same data (modulo new entries being added between calls).
- No pagination — always returns all entries.
- No `Range` header support.
