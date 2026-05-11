import { adminDb } from "@/lib/firebase-admin";
import { Category } from "@/lib/db";
import { serializeDoc } from "@/lib/utils";
import AdminCategoriesList from "@/components/admin/AdminCategoriesList";
import AdminCategoryForm from "@/components/admin/AdminCategoryForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Galeries — Admin" };

export default async function AdminCategoriesPage() {
  const [catsSnap, photosSnap] = await Promise.all([
    adminDb.collection("categories").orderBy("position", "asc").get(),
    adminDb.collection("photos").get(),
  ]);

  const photoCounts: Record<string, number> = {};
  photosSnap.docs.forEach((doc) => {
    const cid = doc.data().category_id;
    if (cid) photoCounts[cid] = (photoCounts[cid] || 0) + 1;
  });

  const categories = catsSnap.docs.map((doc) =>
    serializeDoc({ id: doc.id, ...doc.data(), photo_count: photoCounts[doc.id] || 0 })
  ) as Category[];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink">Galeries</h1>
        <p className="text-sm text-ink/50 mt-0.5">
          {categories.length} galerie{categories.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* List */}
        <div className="lg:col-span-3">
          <AdminCategoriesList categories={categories} />
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-ink/8 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-ink mb-5">
              Nouvelle galerie
            </h2>
            <AdminCategoryForm />
          </div>
        </div>
      </div>
    </div>
  );
}
