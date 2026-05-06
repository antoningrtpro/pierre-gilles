import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/adminAuth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const doc = await adminDb.collection("config").doc("settings").get();
  return NextResponse.json(doc.data() || {});
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const body = await req.json();
    const {
      photographer_name,
      hero_title,
      tagline,
      about_text,
      instagram_url,
      hero_image,
      hero_position,
      portrait_image,
      notification_email,
      current_password,
      new_password,
    } = body;

    const updates: Record<string, string> = {};
    if (photographer_name !== undefined) updates.photographer_name = photographer_name;
    if (hero_title !== undefined) updates.hero_title = hero_title;
    if (tagline !== undefined) updates.tagline = tagline;
    if (about_text !== undefined) updates.about_text = about_text;
    if (instagram_url !== undefined) updates.instagram_url = instagram_url;
    if (hero_image !== undefined) updates.hero_image = hero_image;
    if (hero_position !== undefined) updates.hero_position = hero_position;
    if (portrait_image !== undefined) updates.portrait_image = portrait_image;
    if (notification_email !== undefined) updates.notification_email = notification_email;

    if (Object.keys(updates).length > 0) {
      await adminDb.collection("config").doc("settings").set(updates, { merge: true });
    }

    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ error: "Mot de passe actuel requis." }, { status: 400 });
      }
      const adminDoc = await adminDb.collection("config").doc("admin").get();
      if (!adminDoc.exists) return NextResponse.json({ error: "Admin introuvable." }, { status: 404 });
      const admin = adminDoc.data() as { password_hash: string };
      const valid = await bcrypt.compare(current_password, admin.password_hash);
      if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
      const hash = await bcrypt.hash(new_password, 12);
      await adminDb.collection("config").doc("admin").update({ password_hash: hash });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Settings error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
