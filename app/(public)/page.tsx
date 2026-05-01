import Image from "next/image";
import Link from "next/link";
import { getDb, Photo, Category } from "@/lib/db";
import { imageUrl } from "@/lib/utils";
import PhotoCard from "@/components/public/PhotoCard";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import ContactForm from "@/components/public/ContactForm";

export const dynamic = "force-dynamic";

function getHomeData() {
  const db = getDb();

  const featuredPhotos = db
    .prepare(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        MIN(f.price) as min_price
       FROM photos p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN formats f ON f.photo_id = p.id
       WHERE p.featured = 1
       GROUP BY p.id
       ORDER BY p.position ASC
       LIMIT 6`
    )
    .all() as Photo[];

  const categories = db
    .prepare(
      `SELECT c.*, COUNT(p.id) as photo_count
       FROM categories c
       LEFT JOIN photos p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.position ASC`
    )
    .all() as Category[];

  const heroPhoto = db
    .prepare("SELECT * FROM photos WHERE featured = 1 ORDER BY position ASC LIMIT 1")
    .get() as Photo | undefined;

  const settings = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const s = Object.fromEntries(settings.map((r) => [r.key, r.value]));

  // hero_image setting overrides the featured photo
  const heroImageSrc: string =
    s.hero_image ||
    (heroPhoto ? heroPhoto.filename : "");

  return { featuredPhotos, categories, heroPhoto, heroImageSrc, settings: s };
}

export default function HomePage() {
  const { featuredPhotos, categories, heroPhoto, heroImageSrc, settings } = getHomeData();

  const tagline = settings.tagline || "La nature dans ses instants les plus silencieux.";
  const aboutText = settings.about_text || "";
  const instagramUrl = settings.instagram_url || "https://instagram.com/pierreg_photography";
  const portraitImageSrc = settings.portrait_image || "https://picsum.photos/seed/portrait/600/800";

  // First paragraph only for homepage teaser
  const aboutTeaser = aboutText.split("\n\n")[0] || aboutText;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {heroImageSrc ? (
          <Image
            src={imageUrl(heroImageSrc)}
            alt={heroPhoto?.title ?? "Photo d'accueil"}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div className="absolute inset-0 bg-ink/40" />

        <div className="relative z-10 text-center px-6">
          <h1 className="font-serif text-display-xl text-cream tracking-tight text-balance">
            Pierre G.
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
              Prévoir une session
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
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

                <p className="text-ink/70 text-base leading-relaxed mb-6">
                  {aboutTeaser}
                </p>

                {/* Traits */}
                <div className="space-y-3 mb-10">
                  {[
                    { label: "Approche", value: "Lumière naturelle, aube et crépuscule" },
                    { label: "Technique", value: "Tirages Fine Art sur Hahnemühle" },
                    { label: "Territoire", value: "Paysages et faune sauvage, France" },
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
                  Commande d&apos;un tirage sur mesure, reportage nature,
                  illustration éditoriale ou collaboration de marque — Pierre
                  étudie chaque demande avec soin et répond personnellement
                  sous 48h.
                </p>

                {/* Prestations */}
                <div className="space-y-0 border border-ink/10 divide-y divide-ink/8 mb-10">
                  {[
                    { label: "Tirages Fine Art", desc: "Sur mesure, encadrés ou non" },
                    { label: "Reportage nature", desc: "Paysage, faune, milieux sauvages" },
                    { label: "Cession de droits", desc: "Presse, édition, usage commercial" },
                    { label: "Collaboration marque", desc: "Contenu visuel, direction artistique" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-3.5">
                      <span className="text-sm font-medium text-ink">{item.label}</span>
                      <span className="text-xs text-ink/45">{item.desc}</span>
                    </div>
                  ))}
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
                <ContactForm defaultSubject="Collaboration" />
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
