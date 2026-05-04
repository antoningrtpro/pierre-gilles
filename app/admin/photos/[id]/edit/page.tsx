import { notFound } from "next/navigation";
import { getDb, Category, Photo, Format, PhotoImage } from "@/lib/db";
import PhotoForm from "@/components/admin/PhotoForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const photo = db
    .prepare("SELECT title FROM photos WHERE id = ?")
    .get(Number(id)) as { title: string } | undefined;
  return { title: photo ? `Modifier — ${photo.title}` : "Modifier — Admin" };
}

export default async function EditPhotoPage({ params }: Props) {
  const { id } = await params;
  const photoId = Number(id);
  const db = getDb();

  const photo = db
    .prepare("SELECT * FROM photos WHERE id = ?")
    .get(photoId) as Photo | undefined;
  if (!photo) notFound();

  const formats = db
    .prepare("SELECT * FROM formats WHERE photo_id = ? ORDER BY price ASC")
    .all(photoId) as Format[];

  const extraImages = db
    .prepare("SELECT * FROM photo_images WHERE photo_id = ? ORDER BY position ASC")
    .all(photoId) as PhotoImage[];

  const categories = db
    .prepare("SELECT id, name FROM categories ORDER BY position ASC")
    .all() as Category[];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink">
          Modifier — {photo.title}
        </h1>
      </div>
      <PhotoForm
        photoId={photoId}
        categories={categories}
        initialData={{
          title: photo.title,
          slug: photo.slug,
          description: photo.description || "",
          category_id: photo.category_id,
          filename: photo.filename,
          extraImages: extraImages.map((i) => i.filename),
          featured: !!photo.featured,
          position: photo.position,
          formats: formats.map((f) => ({
            id: f.id,
            label: f.label,
            price: f.price,
          })),
        }}
      />
    </div>
  );
}
