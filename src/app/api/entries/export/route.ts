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

  try {
    const entries = await prisma.userEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
      select: { value: true, date: true },
    });

    const today = format(new Date(), "yyyy-MM-dd");
    const rows = entries.map((e) => `${format(e.date, "yyyy-MM-dd")},${e.value}`);
    const csv = ["date,weight", ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="weight-export-${today}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting entries:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
