import { NextRequest, NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const snapshot = await adminDb.collection("categories").orderBy("position", "asc").get();
  // Get photo counts
  const photosSnap = await adminDb.collection("photos").get();
  const counts: Record<string, number> = {};
  photosSnap.docs.forEach(doc => {
    const cid = doc.data().category_id;
    if (cid) counts[cid] = (counts[cid] || 0) + 1;
  });
  const categories = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    photo_count: counts[doc.id] || 0,
  }));
  return NextResponse.json(categories);
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  try {
    const { orders } = await req.json() as { orders: { id: string; position: number }[] };
    if (!Array.isArray(orders)) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    const batch = adminDb.batch();
    for (const { id, position } of orders) {
      batch.update(adminDb.collection("categories").doc(id), { position });
    }
    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reorder categories error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { name, slug, cover_image, position } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
    const finalSlug = slug?.trim() || slugify(name);
    const existing = await adminDb.collection("categories").where("slug", "==", finalSlug).limit(1).get();
    if (!existing.empty) return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
    const ref = await adminDb.collection("categories").add({
      name: name.trim(),
      slug: finalSlug,
      cover_image: cover_image?.trim() || null,
      position: position ?? 0,
      created_at: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err) {
    console.error("Create category error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
