import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userForApi } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request";
import { storeUpload, UploadError } from "@/lib/uploads";
import { MEDIA_CATEGORIES } from "@/lib/taxonomy";

export const runtime = "nodejs";

// Les utilisateurs non authentifiés reçoivent une 404 : la route ne révèle pas son existence.
export async function POST(req: Request) {
  const user = await userForApi(["ADMIN", "EDITOR"]);
  if (!user) return new NextResponse("Not found", { status: 404 });
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Origine refusée." }, { status: 403 });
  if (!(await rateLimit(`upload:${user.id}`, 200, 3600))) return NextResponse.json({ error: "Trop de téléversements. Réessayez plus tard." }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  const category = String(form.get("category") ?? "OTHER");
  const alt = String(form.get("alt") ?? "").trim().slice(0, 300);

  try {
    const stored = await storeUpload(file);
    const media = await db.media.create({
      data: {
        ...stored,
        originalName: file.name.replace(/[^\w.\- ]/g, "_").slice(0, 200) || "fichier",
        alt,
        category: (MEDIA_CATEGORIES.some((c) => c.value === category) ? category : stored.mimeType.startsWith("video/") ? "VIDEOS" : "OTHER") as "OTHER",
        uploadedById: user.id,
      },
    });
    await audit("media.upload", { userId: user.id, entity: "Media", entityId: media.id, details: { name: media.originalName, size: media.size } });
    return NextResponse.json({ media });
  } catch (e) {
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("[upload]", e);
    return NextResponse.json({ error: "Échec du téléversement." }, { status: 500 });
  }
}
