import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userForApi } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await userForApi(["ADMIN", "EDITOR"]);
  if (!user) return new NextResponse("Not found", { status: 404 });
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const kind = url.searchParams.get("kind");
  const category = url.searchParams.get("category");
  const items = await db.media.findMany({
    where: {
      ...(q ? { OR: [{ alt: { contains: q, mode: "insensitive" } }, { originalName: { contains: q, mode: "insensitive" } }] } : {}),
      ...(kind === "image" ? { mimeType: { startsWith: "image/" } } : kind === "video" ? { mimeType: { startsWith: "video/" } } : {}),
      ...(category ? { category: category as "OTHER" } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 120,
    select: { id: true, url: true, thumbUrl: true, alt: true, originalName: true, mimeType: true, category: true, width: true, height: true },
  });
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
