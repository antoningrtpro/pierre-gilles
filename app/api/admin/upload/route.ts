import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { adminStorage } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Type non autorisé. Utilisez JPEG, PNG ou WebP." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)." }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const basename = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 40);
    const filename = `${basename}-${Date.now()}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(`uploads/${filename}`);
    await fileRef.save(buffer, { contentType: file.type });
    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/pierre-gilles.firebasestorage.app/uploads/${filename}`;
    return NextResponse.json({ filename: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erreur lors de l'upload." }, { status: 500 });
  }
}
