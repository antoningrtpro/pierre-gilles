import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import { Category, Photo } from "@/lib/db";
import { serializeDoc } from "@/lib/utils";
import PhotoForm from "@/components/admin/PhotoForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const doc = await adminDb.collection("photos").doc(id).get();
  const title = doc.exists ? (doc.data() as Photo).title : undefined;
  return { title: title ? `Modifier — ${title}` : "Modifier — Admin" };
}

export default async function EditPhotoPage({ params }: Props) {
  const { id } = await params;

  const [photoDoc, catsSnap] = await Promise.all([
    adminDb.collection("photos").doc(id).get(),
    adminDb.collection("categories").orderBy("position", "asc").get(),
  ]);

  if (!photoDoc.exists) notFound();

  const photo = serializeDoc({ id: photoDoc.id, ...photoDoc.data() }) as Photo;
  const categories = catsSnap.docs.map((doc) =>
    serializeDoc({ id: doc.id, ...doc.data() })
  ) as Category[];

  const formats = Array.isArray(photo.formats) ? photo.formats : [];
  const extraImages = Array.isArray(photo.extra_images) ? photo.extra_images : [];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink">
          Modifier — {photo.title}
        </h1>
      </div>
      <PhotoForm
        photoId={photo.id}
        categories={categories}
        initialData={{
          title: photo.title,
          slug: photo.slug,
          description: photo.description || "",
          category_id: photo.category_id || null,
          filename: photo.filename,
          extraImages: extraImages,
          featured: !!photo.featured,
          position: photo.position,
          formats: formats.map((f) => ({
            label: f.label,
            price: f.price,
          })),
        }}
      />
    </div>
  );
}
