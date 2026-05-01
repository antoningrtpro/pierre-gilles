import { NextRequest, NextResponse } from "next/server";
import { getDb, Photo } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const db = getDb();
  const photos = db
    .prepare(
      `SELECT p.*, c.name as category_name
       FROM photos p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.position ASC, p.created_at DESC`
    )
    .all() as Photo[];

  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { title, slug, description, category_id, filename, featured, position } =
      body;

    if (!title?.trim() || !filename?.trim()) {
      return NextResponse.json(
        { error: "Titre et fichier requis." },
        { status: 400 }
      );
    }

    const db = getDb();
    const finalSlug = slug?.trim() || slugify(title);

    const result = db
      .prepare(
        `INSERT INTO photos (title, slug, description, category_id, filename, featured, position)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        title.trim(),
        finalSlug,
        description?.trim() || null,
        category_id || null,
        filename.trim(),
        featured ? 1 : 0,
        position ?? 0
      );

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé." },
        { status: 409 }
      );
    }
    console.error("Create photo error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
