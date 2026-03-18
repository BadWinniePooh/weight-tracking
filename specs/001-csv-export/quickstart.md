# Quickstart: CSV Export for Weight Data

**Feature**: `001-csv-export` | **Date**: 2026-03-18

## What This Feature Adds

- A `GET /api/entries/export` endpoint that returns all weight entries as a CSV file.
- An "Export CSV" button on the table page (`/table`) that triggers the download.

## Files to Create / Modify

### 1. Create: `src/app/api/entries/export/route.ts`

New API route. Authenticates via NextAuth, queries all `UserEntry` rows for the user, serializes to CSV, and returns with download headers.

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.userEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
    select: { value: true, date: true },
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const rows = entries.map(
    (e) => `${format(e.date, "yyyy-MM-dd")},${e.value}`
  );
  const csv = ["date,weight", ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="weight-export-${today}.csv"`,
    },
  });
}
```

### 2. Modify: `src/app/table/page.tsx`

Add an "Export CSV" button to the page header, alongside the existing "Delete All" button. The button is an anchor tag styled as a button, pointing to `/api/entries/export`.

**Before** (line ~164–177):
```tsx
<div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">Data Table</h1>

  {entries.length > 0 && (
    <Button
      onClick={() => setShowDeleteConfirm(true)}
      variant="danger"
      ...
    >
      Delete All
    </Button>
  )}
</div>
```

**After**:
```tsx
<div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">Data Table</h1>

  <div className="flex gap-2">
    <a href="/api/entries/export" download>
      <Button variant="outline" disabled={loading}>
        Export CSV
      </Button>
    </a>
    {entries.length > 0 && (
      <Button
        onClick={() => setShowDeleteConfirm(true)}
        variant="danger"
        disabled={isDeleting}
        isLoading={isDeleting}
      >
        Delete All
      </Button>
    )}
  </div>
</div>
```

**Note**: The Export CSV button is always visible (not gated on `entries.length > 0`) because FR-007 requires it to work even with an empty dataset. The `disabled={loading}` prevents triggering a download before entries have loaded.

## Verification

1. Log in and navigate to `/table`
2. Click "Export CSV" — browser should download `weight-export-YYYY-MM-DD.csv`
3. Open the file in a spreadsheet app — verify `date` and `weight` columns with all entries
4. Create a fresh account with no entries, navigate to `/table`, click "Export CSV" — file should contain only the header row

## No Migration Required

No database schema changes. No `prisma migrate` needed.
