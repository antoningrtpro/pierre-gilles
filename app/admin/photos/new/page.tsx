import { getDb, Category } from "@/lib/db";
import PhotoForm from "@/components/admin/PhotoForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nouvelle photo — Admin" };

export default function NewPhotoPage() {
  const db = getDb();
  const categories = db
    .prepare("SELECT id, name FROM categories ORDER BY position ASC")
    .all() as Category[];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink">Nouvelle photo</h1>
        <p className="text-sm text-ink/50 mt-0.5">
          Ajoutez une nouvelle photo à votre portfolio.
        </p>
      </div>
      <PhotoForm categories={categories} />
    </div>
  );
}
