import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";

interface Params { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  const doc = await adminDb.collection("photos").doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;

  try {
    const body = await req.json();
    const { title, slug, description, category_id, filename, extra_images, featured, position, formats } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Le titre est requis." }, { status: 400 });

    const docRef = adminDb.collection("photos").doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });

    const finalSlug = slug?.trim() || slugify(title);

    // Check slug uniqueness (exclude self)
    const slugCheck = await adminDb.collection("photos").where("slug", "==", finalSlug).limit(1).get();
    if (!slugCheck.empty && slugCheck.docs[0].id !== id) {
      return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
    }

    // Get category info
    let category_name = null;
    let category_slug = null;
    if (category_id) {
      const catDoc = await adminDb.collection("categories").doc(category_id).get();
      if (catDoc.exists) {
        const cat = catDoc.data()!;
        category_name = cat.name;
        category_slug = cat.slug;
      }
    }

    const embeddedFormats = Array.isArray(formats)
      ? formats.filter((f: any) => f.label && f.price !== undefined)
          .map((f: any) => ({ label: f.label.trim(), price: Number(f.price) }))
      : existing.data()!.formats;

    const min_price = embeddedFormats.length > 0
      ? Math.min(...embeddedFormats.map((f: any) => f.price))
      : null;

    await docRef.update({
      title: title.trim(),
      slug: finalSlug,
      description: description?.trim() || null,
      category_id: category_id || null,
      category_name,
      category_slug,
      filename: filename?.trim() || existing.data()!.filename,
      extra_images: Array.isArray(extra_images) ? extra_images : [],
      formats: embeddedFormats,
      featured: !!featured,
      position: position ?? existing.data()!.position,
      min_price,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update photo error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  const doc = await adminDb.collection("photos").doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
  await adminDb.collection("photos").doc(id).delete();
  return NextResponse.json({ ok: true });
}
