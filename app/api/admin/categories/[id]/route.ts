import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/adminAuth";
import { slugify } from "@/lib/utils";

interface Params { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, slug, cover_image, position } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
    const finalSlug = slug?.trim() || slugify(name);
    const docRef = adminDb.collection("categories").doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return NextResponse.json({ error: "Galerie introuvable." }, { status: 404 });
    const slugCheck = await adminDb.collection("categories").where("slug", "==", finalSlug).limit(1).get();
    if (!slugCheck.empty && slugCheck.docs[0].id !== id) {
      return NextResponse.json({ error: "Ce slug est déjà utilisé." }, { status: 409 });
    }
    await docRef.update({
      name: name.trim(),
      slug: finalSlug,
      cover_image: cover_image?.trim() || null,
      position: position ?? existing.data()!.position,
    });
    // Update denormalized category info in photos
    const photosSnap = await adminDb.collection("photos").where("category_id", "==", id).get();
    const batch = adminDb.batch();
    photosSnap.docs.forEach(doc => {
      batch.update(doc.ref, { category_name: name.trim(), category_slug: finalSlug });
    });
    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update category error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  const doc = await adminDb.collection("categories").doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Galerie introuvable." }, { status: 404 });
  // Unlink photos from this category
  const photosSnap = await adminDb.collection("photos").where("category_id", "==", id).get();
  const batch = adminDb.batch();
  photosSnap.docs.forEach(doc => {
    batch.update(doc.ref, { category_id: null, category_name: null, category_slug: null });
  });
  batch.delete(adminDb.collection("categories").doc(id));
  await batch.commit();
  return NextResponse.json({ ok: true });
}
