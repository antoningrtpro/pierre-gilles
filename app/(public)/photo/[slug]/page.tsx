import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import { Photo } from "@/lib/db";
import { imageUrl, formatPrice, serializeDoc } from "@/lib/utils";
import ContactForm from "@/components/public/ContactForm";
import PhotoCard from "@/components/public/PhotoCard";
import PhotoGallery from "@/components/public/PhotoGallery";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const photoSnap = await adminDb.collection("photos").where("slug", "==", slug).limit(1).get();
  if (photoSnap.empty) return { title: "Photo introuvable" };
  const photo = photoSnap.docs[0].data() as Photo;
  return {
    title: photo.title,
    description:
      photo.description ||
      `Photographie "${photo.title}" par Pierre G. — disponible en tirage Fine Art.`,
  };
}

export default async function PhotoPage({ params }: Props) {
  const { slug } = await params;

  const photoSnap = await adminDb.collection("photos").where("slug", "==", slug).limit(1).get();
  if (photoSnap.empty) notFound();

  const photo = serializeDoc({ id: photoSnap.docs[0].id, ...photoSnap.docs[0].data() }) as Photo;

  const formats: { label: string; price: number }[] = Array.isArray(photo.formats) ? photo.formats : [];
  const extraImages: string[] = Array.isArray(photo.extra_images) ? photo.extra_images : [];
  const allImages = [photo.filename, ...extraImages].filter(Boolean);

  // Related photos from same category
  let related: Photo[] = [];
  if (photo.category_id) {
    const relatedSnap = await adminDb.collection("photos")
      .where("category_id", "==", photo.category_id)
      .orderBy("position", "asc")
      .limit(7)
      .get();
    related = relatedSnap.docs
      .filter(doc => doc.id !== photo.id)
      .slice(0, 6)
      .map(doc => serializeDoc({ id: doc.id, ...doc.data() })) as Photo[];
  }

  const settingsDoc = await adminDb.collection("config").doc("settings").get();
  const s = settingsDoc.data() || {};
  const aboutText = (s as any).about_text || "";
  const instagramUrl = (s as any).instagram_url || "https://instagram.com/pierreg_photography";
  const portraitImageSrc = (s as any).portrait_image || "https://picsum.photos/seed/portrait/600/800";

  const minPrice = formats.length > 0 ? Math.min(...formats.map((f) => f.price)) : null;

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          ZONE FIXE : 2 colonnes pleine hauteur (desktop)
          2/3 photo — 1/3 détails scrollable
          Mobile : colonne unique, scroll normal
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-cream flex flex-col" style={{ minHeight: "100dvh" }}>

        {/* Breadcrumb */}
        <div className="shrink-0 pt-20 md:pt-[5.5rem]">
          <div className="px-6 md:px-10 py-3 border-b border-ink/8">
            <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-ink/35">
              <Link href="/gallery" className="hover:text-moss transition-colors">
                Galeries
              </Link>
              {photo.category_slug && (
                <>
                  <span>/</span>
                  <Link href={`/gallery/${photo.category_slug}`} className="hover:text-moss transition-colors">
                    {photo.category_name}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-ink/55 truncate max-w-[200px]">{photo.title}</span>
            </nav>
          </div>
        </div>

        {/* Corps 2 colonnes */}
        <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">

          {/* ── 1/2 gauche : galerie ─────────────────────────── */}
          <div className="
            lg:flex-[1] lg:overflow-hidden
            bg-[#F0EDE8]
            lg:h-[calc(100dvh-theme(spacing.20)-41px)]
            min-h-[50vw] lg:min-h-0
          ">
            <PhotoGallery images={allImages} title={photo.title} minPrice={minPrice} />
          </div>

          {/* ── 1/3 droite : détails scrollable ──────────────── */}
          <div className="
            lg:flex-[1] shrink-0
            lg:h-[calc(100dvh-theme(spacing.20)-41px)]
            lg:overflow-y-auto
            border-t border-ink/8 lg:border-t-0 lg:border-l lg:border-ink/8
            bg-cream
          ">
            <div className="px-6 md:px-8 py-8 space-y-8">

              {/* Titre + description */}
              <div>
                {photo.category_name && (
                  <p className="text-xs tracking-widest uppercase text-moss mb-2">
                    {photo.category_name}
                  </p>
                )}
                <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight mb-4">
                  {photo.title}
                </h1>
                {photo.description && (
                  <p className="text-ink/65 text-sm leading-relaxed whitespace-pre-line">
                    {photo.description}
                  </p>
                )}
              </div>

              {/* Formats & prix */}
              {formats.length > 0 && (
                <div>
                  <p className="text-xs tracking-widest uppercase text-ink/40 mb-3">
                    Formats disponibles
                  </p>
                  <div className="border border-ink/10 divide-y divide-ink/8">
                    {formats.map((fmt, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-4 py-3 hover:bg-ink/2 transition-colors"
                      >
                        <span className="text-sm text-ink">{fmt.label}</span>
                        <span className="text-sm font-semibold text-moss tabular-nums">
                          {formatPrice(fmt.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulaire */}
              <div className="border-t border-ink/8 pt-6">
                <p className="text-xs tracking-widest uppercase text-ink/40 mb-5">
                  Commander cette œuvre
                </p>
                <ContactForm
                  photoTitle={photo.title}
                  formats={formats}
                  defaultSubject="Achat"
                />
              </div>

              {/* Réassurance */}
              <div className="border-t border-ink/8 pt-6 grid grid-cols-3 gap-4">
                <ReassuranceItem icon="check" title="Édition limitée" desc="20 exemplaires" />
                <ReassuranceItem icon="quality" title="Papier de qualité" desc="Avec ou sans encadrement" />
                <ReassuranceItem icon="shipping" title="Livraison" desc="France & international." />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 : Qui je suis
      ══════════════════════════════════════════════════════════ */}
      <section className="border-t border-ink/8 bg-[#EFEDE8]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-24 items-center">

            {/* Portrait */}
            <RevealOnScroll>
              <div className="relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-ink/5">
                  <Image
                    src={imageUrl(portraitImageSrc)}
                    alt="Pierre G., photographe naturaliste"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 md:-bottom-5 md:-right-5 bg-moss px-5 py-3">
                  <p className="text-cream text-xs tracking-widest uppercase">
                    @pierreg_photography
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            {/* Bio */}
            <RevealOnScroll delay={150}>
              <div>
                <p className="text-xs tracking-widest uppercase text-moss mb-4">
                  Le photographe
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-ink mb-6 leading-tight">
                  Pierre G.
                </h2>

                <div className="space-y-4 text-ink/70 text-sm leading-relaxed mb-8">
                  {aboutText.split("\n\n").filter(Boolean).map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                <div className="space-y-3 mb-10">
                  {[
                    { label: "Approche", value: "Lumière naturelle, contraste et instants justes" },
                    { label: "Technique", value: "Tirages Fine Art sur Hahnemühle" },
                    { label: "Territoire", value: "Faune & paysages — exploration du monde" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-baseline gap-4 border-b border-ink/8 pb-3">
                      <span className="text-xs tracking-widest uppercase text-ink/40 w-24 shrink-0">
                        {item.label}
                      </span>
                      <span className="text-sm text-ink">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/about"
                    className="px-7 py-3 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors duration-300"
                  >
                    En savoir plus
                  </Link>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-7 py-3 border border-ink/25 text-ink text-xs tracking-widest uppercase hover:bg-ink/5 transition-colors duration-300"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 : Autres œuvres de la galerie
      ══════════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="bg-cream border-t border-ink/8">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
            <RevealOnScroll>
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <p className="text-xs tracking-widest uppercase text-moss mb-2">
                    {photo.category_name}
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl text-ink">
                    Autres œuvres de la collection
                  </h2>
                </div>
                {photo.category_slug && (
                  <Link
                    href={`/gallery/${photo.category_slug}`}
                    className="hidden md:inline-flex text-xs tracking-widest uppercase text-ink/45 hover:text-moss transition-colors border-b border-ink/20 hover:border-moss pb-0.5"
                  >
                    Voir toute la collection
                  </Link>
                )}
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-start">
              {related.map((r, i) => (
                <PhotoCard key={r.id} photo={r} index={i} />
              ))}
            </div>

            {photo.category_slug && (
              <div className="mt-10 text-center md:hidden">
                <Link
                  href={`/gallery/${photo.category_slug}`}
                  className="text-xs tracking-widest uppercase text-ink/45 hover:text-moss transition-colors border-b border-ink/20 pb-0.5"
                >
                  Voir toute la collection
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function ReassuranceItem({
  icon,
  title,
  desc,
}: {
  icon: "check" | "quality" | "shipping";
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="text-moss">
        {icon === "check" && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {icon === "quality" && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        )}
        {icon === "shipping" && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        )}
      </span>
      <p className="text-[10px] font-semibold tracking-wide text-ink uppercase leading-tight">{title}</p>
      <p className="text-[10px] text-ink/45 leading-snug">{desc}</p>
    </div>
  );
}
