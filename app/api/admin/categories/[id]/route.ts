import { NextRequest, NextResponse } from "next/server";
import { getDb, Category } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const catId = Number(id);

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
    const existing = db
      .prepare("SELECT * FROM categories WHERE id = ?")
      .get(catId) as Category | undefined;
    if (!existing) {
      return NextResponse.json(
        { error: "Catégorie introuvable." },
        { status: 404 }
      );
    }

    const finalSlug = slug?.trim() || slugify(name);

    db.prepare(
      "UPDATE categories SET name=?, slug=?, cover_image=?, position=? WHERE id=?"
    ).run(
      name.trim(),
      finalSlug,
      cover_image?.trim() || existing.cover_image,
      position ?? existing.position,
      catId
    );

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "Ce slug est déjà utilisé." },
        { status: 409 }
      );
    }
    console.error("Update category error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const catId = Number(id);
  const db = getDb();

  const existing = db
    .prepare("SELECT * FROM categories WHERE id = ?")
    .get(catId) as Category | undefined;
  if (!existing) {
    return NextResponse.json(
      { error: "Catégorie introuvable." },
      { status: 404 }
    );
  }

  // Nullify category_id on photos referencing this category
  db.prepare("UPDATE photos SET category_id = NULL WHERE category_id = ?").run(
    catId
  );
  db.prepare("DELETE FROM categories WHERE id = ?").run(catId);

  return NextResponse.json({ ok: true });
}
