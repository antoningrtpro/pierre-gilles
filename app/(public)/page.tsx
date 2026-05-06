import Image from "next/image";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import { Photo, Category } from "@/lib/db";
import { imageUrl, serializeDoc } from "@/lib/utils";
import PhotoCard from "@/components/public/PhotoCard";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import ContactForm from "@/components/public/ContactForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch all data from Firestore
  const [featuredSnap, allPhotosSnap, catsSnap, settingsDoc] = await Promise.all([
    adminDb.collection("photos").where("featured", "==", true).orderBy("position", "asc").limit(6).get(),
    adminDb.collection("photos").orderBy("position", "asc").get(),
    adminDb.collection("categories").orderBy("position", "asc").get(),
    adminDb.collection("config").doc("settings").get(),
  ]);

  const featuredPhotos = featuredSnap.docs.map(doc => serializeDoc({ id: doc.id, ...doc.data() })) as Photo[];
  const allPhotos = allPhotosSnap.docs.map(doc => ({ id: doc.id, title: (doc.data() as any).title, slug: (doc.data() as any).slug }));

  // Compute photo_count for categories
  const photoCounts: Record<string, number> = {};
  allPhotosSnap.docs.forEach(doc => {
    const cid = (doc.data() as any).category_id;
    if (cid) photoCounts[cid] = (photoCounts[cid] || 0) + 1;
  });

  const categories = catsSnap.docs.map(doc => serializeDoc({
    id: doc.id,
    ...doc.data(),
    photo_count: photoCounts[doc.id] || 0,
  })) as Category[];

  const s = settingsDoc.data() || {};

  const heroTitle = (s as any).hero_title || "Pierre G.";
  const tagline = (s as any).tagline || "Le monde vivant, saisi dans l'instant";
  const aboutText = (s as any).about_text || "";
  const instagramUrl = (s as any).instagram_url || "https://instagram.com/pierreg_photography";
  const portraitImageSrc = (s as any).portrait_image || "https://picsum.photos/seed/portrait/600/800";
  const heroPosition = (s as any).hero_position || "center";
  const heroImageSrc: string = (s as any).hero_image || (featuredPhotos[0]?.filename ?? "");


  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {heroImageSrc ? (
          <Image
            src={imageUrl(heroImageSrc)}
            alt={featuredPhotos[0]?.title ?? "Photo d'accueil"}
            fill
            priority
            className={`object-cover object-${heroPosition}`}
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div className="absolute inset-0 bg-ink/40" />

        <div className="relative z-10 text-center px-6">
          <h1 className="font-serif text-display-xl text-cream tracking-tight text-balance">
            {heroTitle}
          </h1>
          <p className="mt-4 text-cream/70 font-sans text-sm md:text-base tracking-[0.2em] uppercase max-w-xs mx-auto">
            {tagline}
          </p>
          <div className="mt-10 flex items-center justify-center gap-6">
            <Link
              href="/gallery"
              className="px-8 py-3 border border-cream/60 text-cream text-xs tracking-widest uppercase hover:bg-cream hover:text-ink transition-all duration-300"
            >
              Découvrir
            </Link>
            <Link
              href="/contact"
              className="text-cream/60 text-xs tracking-widest uppercase hover:text-cream transition-colors"
            >
              Effectuer un tirage
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-cream/40 text-xs tracking-widest uppercase">Défiler</span>
          <div className="w-px h-12 bg-cream/20 animate-pulse" />
        </div>
      </section>

      {/* ── Featured works ──────────────────────────────── */}
      {featuredPhotos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <RevealOnScroll>
            <div className="mb-14 flex items-end justify-between">
              <div>
                <p className="text-xs tracking-widest uppercase text-moss mb-2">Sélection</p>
                <h2 className="font-serif text-display-lg text-ink">Œuvres à la une</h2>
              </div>
              <Link
                href="/gallery"
                className="hidden md:inline-flex text-xs tracking-widest uppercase text-ink/50 hover:text-moss transition-colors border-b border-ink/20 hover:border-moss pb-0.5"
              >
                Voir tout
              </Link>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 items-start">
            {featuredPhotos.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} index={i} />
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link
              href="/gallery"
              className="text-xs tracking-widest uppercase text-ink/50 hover:text-moss transition-colors border-b border-ink/20 hover:border-moss pb-0.5"
            >
              Voir toutes les œuvres
            </Link>
          </div>
        </section>
      )}

      {/* ── Qui je suis ─────────────────────────────────── */}
      <section className="border-t border-ink/8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">

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
                {/* Floating label */}
                <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-moss px-5 py-3">
                  <p className="text-cream text-xs tracking-widest uppercase">
                    @pierreg_photography
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            {/* Text */}
            <RevealOnScroll delay={150}>
              <div>
                <p className="text-xs tracking-widest uppercase text-moss mb-4">
                  Le photographe
                </p>
                <h2 className="font-serif text-display-lg text-ink mb-6 leading-tight">
                  Qui<br />suis-je ?
                </h2>

                <div className="space-y-4 text-ink/70 text-base leading-relaxed mb-6">
                  {aboutText.split("\n\n").filter(Boolean).map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Traits */}
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

      {/* ── Categories ──────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-ink py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <RevealOnScroll>
              <div className="mb-14">
                <p className="text-xs tracking-widest uppercase text-moss mb-2">Collections</p>
                <h2 className="font-serif text-display-lg text-cream">Galeries</h2>
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {categories.map((cat, i) => (
                <RevealOnScroll key={cat.id} delay={i * 100}>
                  <Link
                    href={`/gallery/${cat.slug}`}
                    className="group block relative aspect-landscape overflow-hidden rounded-sm bg-cream/5"
                  >
                    {cat.cover_image && (
                      <Image
                        src={imageUrl(cat.cover_image)}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-ink/50 group-hover:bg-ink/35 transition-colors duration-500" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <h3 className="font-serif text-2xl text-cream">{cat.name}</h3>
                      {cat.photo_count !== undefined && (
                        <p className="mt-2 text-cream/50 text-xs tracking-widest uppercase">
                          {cat.photo_count} {cat.photo_count === 1 ? "photo" : "photos"}
                        </p>
                      )}
                      <span className="mt-4 text-xs tracking-widest uppercase text-moss opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explorer →
                      </span>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact prestation ───────────────────────────── */}
      <section className="bg-[#EFEDE8] border-t border-ink/8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-start">

            {/* Pitch */}
            <RevealOnScroll>
              <div className="lg:sticky lg:top-28">
                <p className="text-xs tracking-widest uppercase text-moss mb-4">
                  Travaillons ensemble
                </p>
                <h2 className="font-serif text-display-lg text-ink mb-6 leading-tight">
                  Un projet,<br />une idée ?
                </h2>
                <p className="text-ink/65 text-base leading-relaxed mb-10">
                  Chaque tirage peut être adapté selon vos besoins : format,
                  finition ou présentation — Pierre étudie chaque demande avec
                  attention et répond personnellement.
                </p>

                {/* Prestations */}
                <div className="space-y-0 border border-ink/10 divide-y divide-ink/8 mb-10">
                  {[
                    { label: "Tirages", desc: "Photographies disponibles en différents formats" },
                    { label: "Finitions", desc: "Supports et encadrements selon vos préférences" },
                    { label: "Sur mesure", desc: "Adaptation possible à votre espace ou projet" },
                    { label: "Contact", desc: "Échange direct pour toute demande" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-3.5">
                      <span className="text-sm font-medium text-ink">{item.label}</span>
                      <span className="text-xs text-ink/45">{item.desc}</span>
                    </div>
                  ))}
                  <div className="px-4 py-3 bg-ink/2">
                    <p className="text-xs text-ink/40">Formats disponibles : 30×40 cm ou 50×70 cm — Pas de numérique</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-ink/40">
                  <span className="w-8 h-px bg-ink/20" />
                  <span className="text-xs tracking-widest uppercase">Réponse sous 48h</span>
                </div>
              </div>
            </RevealOnScroll>

            {/* Formulaire */}
            <RevealOnScroll delay={120}>
              <div className="bg-cream border border-ink/8 p-8 md:p-10">
                <p className="text-xs tracking-widest uppercase text-ink/40 mb-8">
                  Envoyer un message
                </p>
                <ContactForm defaultSubject="Tirage" photos={allPhotos} />
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* ── Instagram CTA ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 text-center">
        <RevealOnScroll>
          <p className="text-xs tracking-widest uppercase text-moss mb-4">Instagram</p>
          <h2 className="font-serif text-3xl md:text-4xl text-ink mb-6">
            Suivre l&apos;objectif
          </h2>
          <p className="text-ink/60 max-w-sm mx-auto text-sm mb-8">
            Des instants quotidiens, des coulisses, des lumières inattendues.
          </p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-8 py-3 border border-ink/30 text-ink text-xs tracking-widest uppercase hover:bg-ink hover:text-cream transition-all duration-300"
          >
            @pierreg_photography
          </a>
        </RevealOnScroll>
      </section>
    </>
  );
}
