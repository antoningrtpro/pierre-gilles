import { adminDb } from "@/lib/firebase-admin";
import { Category } from "@/lib/db";
import { serializeDoc } from "@/lib/utils";
import PhotoForm from "@/components/admin/PhotoForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Nouvelle photo — Admin" };

export default async function NewPhotoPage() {
  const snapshot = await adminDb
    .collection("categories")
    .orderBy("position", "asc")
    .get();

  const categories = snapshot.docs.map((doc) =>
    serializeDoc({ id: doc.id, ...doc.data() })
  ) as Category[];

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
