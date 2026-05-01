import Image from "next/image";
import { getDb, Category } from "@/lib/db";
import { imageUrl } from "@/lib/utils";
import AdminCategoryActions from "@/components/admin/AdminCategoryActions";
import AdminCategoryForm from "@/components/admin/AdminCategoryForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Galeries — Admin" };

export default function AdminCategoriesPage() {
  const db = getDb();
  const categories = db
    .prepare(
      `SELECT c.*, COUNT(p.id) as photo_count
       FROM categories c
       LEFT JOIN photos p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.position ASC`
    )
    .all() as Category[];

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
          {categories.length === 0 ? (
            <div className="bg-white border border-ink/8 rounded-lg p-12 text-center text-ink/40 text-sm">
              Aucune galerie. Créez-en une à droite.
            </div>
          ) : (
            <div className="bg-white border border-ink/8 rounded-lg overflow-hidden">
              {categories.map((cat, i) => (
                <div
                  key={cat.id}
                  className={`flex items-center gap-4 px-4 py-3 ${
                    i < categories.length - 1 ? "border-b border-ink/6" : ""
                  } hover:bg-ink/1 transition-colors`}
                >
                  {/* Cover */}
                  <div className="relative w-14 h-10 rounded overflow-hidden bg-ink/5 shrink-0">
                    {cat.cover_image ? (
                      <Image
                        src={imageUrl(cat.cover_image)}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized={cat.cover_image.startsWith("http")}
                      />
                    ) : (
                      <div className="w-full h-full bg-ink/10" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{cat.name}</p>
                    <p className="text-xs text-ink/40 font-mono">{cat.slug}</p>
                  </div>
                  <span className="text-xs text-ink/40 shrink-0">
                    {cat.photo_count ?? 0} photo{cat.photo_count !== 1 ? "s" : ""}
                  </span>
                  <AdminCategoryActions categoryId={cat.id} />
                </div>
              ))}
            </div>
          )}
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
