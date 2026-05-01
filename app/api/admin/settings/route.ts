import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const body = await req.json();
    const db = getDb();

    const {
      photographer_name,
      tagline,
      about_text,
      instagram_url,
      hero_image,
      hero_position,
      portrait_image,
      current_password,
      new_password,
    } = body;

    // Update site settings
    const upsert = db.prepare(
      "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
    );

    const updateSettings = db.transaction(() => {
      if (photographer_name !== undefined)
        upsert.run("photographer_name", photographer_name);
      if (tagline !== undefined) upsert.run("tagline", tagline);
      if (about_text !== undefined) upsert.run("about_text", about_text);
      if (instagram_url !== undefined)
        upsert.run("instagram_url", instagram_url);
      if (hero_image !== undefined)
        upsert.run("hero_image", hero_image);
      if (hero_position !== undefined)
        upsert.run("hero_position", hero_position);
      if (portrait_image !== undefined)
        upsert.run("portrait_image", portrait_image);
    });
    updateSettings();

    // Password change
    if (new_password) {
      if (!current_password) {
        return NextResponse.json(
          { error: "Mot de passe actuel requis." },
          { status: 400 }
        );
      }

      const admin = db
        .prepare("SELECT * FROM admin WHERE id = 1")
        .get() as { password_hash: string } | undefined;
      if (!admin) {
        return NextResponse.json(
          { error: "Admin introuvable." },
          { status: 404 }
        );
      }

      const valid = await bcrypt.compare(current_password, admin.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: "Mot de passe actuel incorrect." },
          { status: 400 }
        );
      }

      const hash = await bcrypt.hash(new_password, 12);
      db.prepare("UPDATE admin SET password_hash = ? WHERE id = 1").run(hash);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Settings error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
