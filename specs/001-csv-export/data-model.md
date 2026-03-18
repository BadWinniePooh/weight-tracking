# Data Model: CSV Export for Weight Data

**Feature**: `001-csv-export` | **Date**: 2026-03-18

## No Schema Changes

This feature introduces no new database tables, columns, or migrations. It reads existing data only.

---

## Existing Entity: `UserEntry` (read-only for this feature)

**Source**: `prisma/schema.prisma` — model `UserEntry`

| Field     | Prisma Type  | SQLite Type | Notes                                       |
|-----------|-------------|-------------|---------------------------------------------|
| `id`      | `String` (UUID) | TEXT    | Not exported                                |
| `value`   | `Float`      | REAL        | Exported as `weight` column (raw precision) |
| `date`    | `DateTime`   | INTEGER (Unix ms) | Exported as `date` column (YYYY-MM-DD)  |
| `notes`   | `String?`    | TEXT        | Not exported                                |
| `userId`  | `String`     | TEXT (FK)   | Used in WHERE clause, not exported          |

**Query for export**:
```ts
prisma.userEntry.findMany({
  where: { userId: session.user.id },
  orderBy: { date: "asc" },
  select: { value: true, date: true },
})
```

**Sort order**: Ascending by `date` — chronological order is most useful for data migration consumers.

---

## CSV Output Format

```text
date,weight
2024-01-01,82.5
2024-01-02,82.3
...
```

**Rules**:
- Header row always present: `date,weight`
- One row per `UserEntry`
- `date`: formatted `yyyy-MM-dd` using date-fns `format()`
- `weight`: `entry.value.toString()` — full floating-point precision as stored; no rounding
- Line ending: `\n` (LF)
- No trailing newline after last row (acceptable) or with trailing newline (also acceptable — both are valid CSV)
- No quoting needed: dates match `\d{4}-\d{2}-\d{2}` and weights are numeric — no commas or special chars

---

## State / Lifecycle

This feature has no state mutations. The export is a read-only operation:
1. Receive `GET /api/entries/export`
2. Authenticate via NextAuth session cookie
3. Query `UserEntry` for the user
4. Serialize to CSV string
5. Return with `Content-Type: text/csv` and `Content-Disposition: attachment`
