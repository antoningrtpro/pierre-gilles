import { NextRequest, NextResponse } from "next/server";
import { getDb, Category } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const db = getDb();
  const categories = db
    .prepare(
      `SELECT c.*, COUNT(p.id) as photo_count
       FROM categories c
       LEFT JOIN photos p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.position ASC, c.created_at DESC`
    )
    .all() as Category[];

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { name, slug, cover_image, position } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Le nom est requis." },
        { status: 400 }
      );
    }

    const db = getDb();
    const finalSlug = slug?.trim() || slugify(name);

    const result = db
      .prepare(
        `INSERT INTO categories (name, slug, cover_image, position)
         VALUES (?, ?, ?, ?)`
      )
      .run(name.trim(), finalSlug, cover_image?.trim() || null, position ?? 0);

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé." },
        { status: 409 }
      );
    }
    console.error("Create category error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
