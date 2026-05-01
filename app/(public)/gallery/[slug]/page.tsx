import { notFound } from "next/navigation";
import { getDb, Photo, Category } from "@/lib/db";
import PhotoCard from "@/components/public/PhotoCard";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();
  const cat = db
    .prepare("SELECT * FROM categories WHERE slug = ?")
    .get(slug) as Category | undefined;
  if (!cat) return { title: "Galerie introuvable" };
  return {
    title: cat.name,
    description: `Découvrez la collection ${cat.name} de Pierre G.`,
  };
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  const category = db
    .prepare("SELECT * FROM categories WHERE slug = ?")
    .get(slug) as Category | undefined;
  if (!category) notFound();

  const photos = db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        MIN(f.price) as min_price
       FROM photos p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN formats f ON f.photo_id = p.id
       WHERE p.category_id = ?
       GROUP BY p.id
       ORDER BY p.position ASC`
    )
    .all(category.id) as Photo[];

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {photos.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
