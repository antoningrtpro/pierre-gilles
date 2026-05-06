import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import { Photo, Category } from "@/lib/db";
import { serializeDoc } from "@/lib/utils";
import PhotoCard from "@/components/public/PhotoCard";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catSnap = await adminDb.collection("categories").where("slug", "==", slug).limit(1).get();
  if (catSnap.empty) return { title: "Galerie introuvable" };
  const cat = catSnap.docs[0].data() as Category;
  return {
    title: cat.name,
    description: `Découvrez la collection ${cat.name} de Pierre G.`,
  };
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;

  const catSnap = await adminDb.collection("categories").where("slug", "==", slug).limit(1).get();
  if (catSnap.empty) notFound();

  const category = { id: catSnap.docs[0].id, ...catSnap.docs[0].data() } as Category;

  const photosSnap = await adminDb.collection("photos")
    .where("category_id", "==", category.id)
    .orderBy("position", "asc")
    .get();

  const photos = photosSnap.docs.map(doc => serializeDoc({ id: doc.id, ...doc.data() })) as Photo[];

  return (
    <div className="pt-24 md:pt-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-ink/40 mb-6">
          <a href="/gallery" className="hover:text-moss transition-colors">
            Galeries
          </a>
          <span>/</span>
          <span className="text-moss">{category.name}</span>
        </nav>
        <h1 className="font-serif text-display-lg text-ink">{category.name}</h1>
        <p className="mt-2 text-xs tracking-widest uppercase text-ink/40">
          {photos.length} {photos.length === 1 ? "photo" : "photos"}
        </p>
      </div>

      {/* Photos grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {photos.length === 0 ? (
          <RevealOnScroll>
            <p className="text-ink/40 text-sm">
              Aucune photo dans cette collection pour le moment.
            </p>
          </RevealOnScroll>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-start">
            {photos.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
