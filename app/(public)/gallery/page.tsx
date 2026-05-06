import Image from "next/image";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import { Category } from "@/lib/db";
import { imageUrl, serializeDoc } from "@/lib/utils";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeries",
  description: "Toutes les collections photographiques de Pierre G.",
};

export default async function GalleriesPage() {
  const [catsSnap, photosSnap] = await Promise.all([
    adminDb.collection("categories").orderBy("position", "asc").get(),
    adminDb.collection("photos").get(),
  ]);

  const counts: Record<string, number> = {};
  photosSnap.docs.forEach(doc => {
    const cid = (doc.data() as any).category_id;
    if (cid) counts[cid] = (counts[cid] || 0) + 1;
  });

  const categories = catsSnap.docs.map(doc => serializeDoc({
    id: doc.id,
    ...doc.data(),
    photo_count: counts[doc.id] || 0,
  })) as Category[];

  return (
    <div className="pt-24 md:pt-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 md:mb-20">
        <p className="text-xs tracking-widest uppercase text-moss mb-3">
          Collections
        </p>
        <h1 className="font-serif text-display-lg text-ink">Galeries</h1>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {categories.length === 0 ? (
          <p className="text-ink/40 text-sm">Aucune galerie pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-start">
            {categories.map((cat, i) => (
              <RevealOnScroll key={cat.id} delay={i * 80}>
                <Link
                  href={`/gallery/${cat.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-landscape overflow-hidden rounded-sm bg-ink/5">
                    {cat.cover_image ? (
                      <Image
                        src={imageUrl(cat.cover_image)}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-ink/10 flex items-center justify-center">
                        <span className="text-ink/20 text-xs tracking-widest uppercase">
                          Sans image
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors duration-500" />
                  </div>
                  <div className="mt-4">
                    <h2 className="font-serif text-xl text-ink group-hover:text-moss transition-colors">
                      {cat.name}
                    </h2>
                    <p className="mt-1 text-xs tracking-widest uppercase text-ink/40">
                      {cat.photo_count ?? 0}{" "}
                      {cat.photo_count === 1 ? "photo" : "photos"}
                    </p>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
