import { NextRequest, NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const snapshot = await adminDb.collection("photos").orderBy("position", "asc").get();
  const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { title, slug, description, category_id, filename, extra_images, featured, position, formats } = body;

    if (!title?.trim() || !filename?.trim()) {
      return NextResponse.json({ error: "Titre et fichier requis." }, { status: 400 });
    }

    const finalSlug = slug?.trim() || slugify(title);

    // Check slug uniqueness
    const existing = await adminDb.collection("photos").where("slug", "==", finalSlug).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
    }

    // Get category info for denormalization
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

    const embeddedFormats = (Array.isArray(formats) ? formats : [])
      .filter((f: any) => f.label && f.price !== undefined)
      .map((f: any) => ({ label: f.label.trim(), price: Number(f.price) }));

    const min_price = embeddedFormats.length > 0
      ? Math.min(...embeddedFormats.map((f: any) => f.price))
      : null;

    const ref = await adminDb.collection("photos").add({
      title: title.trim(),
      slug: finalSlug,
      description: description?.trim() || null,
      category_id: category_id || null,
      category_name,
      category_slug,
      filename: filename.trim(),
      extra_images: Array.isArray(extra_images) ? extra_images : [],
      formats: embeddedFormats,
      featured: !!featured,
      position: position ?? 0,
      min_price,
      created_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err) {
    console.error("Create photo error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
