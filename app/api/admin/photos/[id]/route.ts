import { NextRequest, NextResponse } from "next/server";
import { getDb, Photo, Format, PhotoImage } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";
import fs from "fs";
import path from "path";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const db = getDb();
  const photo = db
    .prepare("SELECT * FROM photos WHERE id = ?")
    .get(Number(id)) as Photo | undefined;

  if (!photo) {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }

  const formats = db
    .prepare("SELECT * FROM formats WHERE photo_id = ? ORDER BY price ASC")
    .all(photo.id) as Format[];

  const extraImages = db
    .prepare("SELECT * FROM photo_images WHERE photo_id = ? ORDER BY position ASC")
    .all(photo.id) as PhotoImage[];

  return NextResponse.json({
    ...photo,
    formats,
    extra_images: extraImages.map((i) => i.filename),
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const photoId = Number(id);

  try {
    const body = await req.json();
    const {
      title,
      slug,
      description,
      category_id,
      filename,
      extra_images,
      featured,
      position,
      formats,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Le titre est requis." },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db
      .prepare("SELECT * FROM photos WHERE id = ?")
      .get(photoId) as Photo | undefined;
    if (!existing) {
      return NextResponse.json(
        { error: "Photo introuvable." },
        { status: 404 }
      );
    }

    const finalSlug = slug?.trim() || slugify(title);

    db.prepare(
      `UPDATE photos SET title=?, slug=?, description=?, category_id=?,
       filename=?, featured=?, position=?
       WHERE id=?`
    ).run(
      title.trim(),
      finalSlug,
      description?.trim() || null,
      category_id || null,
      filename?.trim() || existing.filename,
      featured ? 1 : 0,
      position ?? existing.position,
      photoId
    );

    // Update formats if provided
    if (Array.isArray(formats)) {
      db.prepare("DELETE FROM formats WHERE photo_id = ?").run(photoId);
      const insertFmt = db.prepare(
        "INSERT INTO formats (photo_id, label, price) VALUES (?, ?, ?)"
      );
      for (const fmt of formats) {
        if (fmt.label && fmt.price !== undefined) {
          insertFmt.run(photoId, fmt.label.trim(), Number(fmt.price));
        }
      }
    }

    // Update extra images if provided
    if (Array.isArray(extra_images)) {
      db.prepare("DELETE FROM photo_images WHERE photo_id = ?").run(photoId);
      const insertImg = db.prepare(
        "INSERT INTO photo_images (photo_id, filename, position) VALUES (?, ?, ?)"
      );
      extra_images.forEach((f: string, i: number) => insertImg.run(photoId, f, i));
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé." },
        { status: 409 }
      );
    }
    console.error("Update photo error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const photoId = Number(id);
  const db = getDb();

  const photo = db
    .prepare("SELECT * FROM photos WHERE id = ?")
    .get(photoId) as Photo | undefined;
  if (!photo) {
    return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  }

  // Delete file if local
  if (photo.filename && !photo.filename.startsWith("http")) {
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      photo.filename
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  db.prepare("DELETE FROM photos WHERE id = ?").run(photoId);

  return NextResponse.json({ ok: true });
}
