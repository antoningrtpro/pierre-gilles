import Image from "next/image";
import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import { imageUrl } from "@/lib/utils";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "À propos",
  description: "Photographe naturaliste basé en France.",
};

export default async function AboutPage() {
  const settingsDoc = await adminDb.collection("config").doc("settings").get();
  const settings = (settingsDoc.data() || {}) as Record<string, string>;

  const aboutText =
    settings.about_text ||
    "Photographe naturaliste basé en France, Pierre G. parcourt les paysages sauvages à la recherche de la lumière fugace, du silence habité et des beautés discrètes du monde vivant.";

  const instagramUrl =
    settings.instagram_url || "https://instagram.com/pierreg_photography";

  const portraitImageSrc =
    settings.portrait_image || "https://picsum.photos/seed/portrait/600/800";

  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <RevealOnScroll>
          <p className="text-xs tracking-widest uppercase text-moss mb-3">
            À propos
          </p>
          <h1 className="font-serif text-display-lg text-ink mb-16">
            Pierre G.
          </h1>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* Portrait */}
          <RevealOnScroll>
            <div className="relative aspect-portrait bg-ink/5 rounded-sm overflow-hidden">
              <Image
                src={imageUrl(portraitImageSrc)}
                alt="Pierre G., photographe"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </RevealOnScroll>

          {/* Bio */}
          <RevealOnScroll delay={150}>
            <div className="space-y-6">
              <p className="font-serif text-2xl text-ink leading-relaxed">
                &ldquo;Chaque instant dans la nature est une invitation au
                silence.&rdquo;
              </p>

              <div className="divider" />

              <div className="space-y-4 text-ink/70 text-sm leading-relaxed">
                {aboutText.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-px bg-moss" />
                  <span className="text-xs tracking-widest uppercase text-ink/50">
                    Basé en France
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-px bg-moss" />
                  <span className="text-xs tracking-widest uppercase text-ink/50">
                    Photographie naturaliste
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-px bg-moss" />
                  <span className="text-xs tracking-widest uppercase text-ink/50">
                    Tirages Fine Art
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-ink/30 text-ink text-xs tracking-widest uppercase hover:bg-ink hover:text-cream transition-all duration-300"
                >
                  Instagram
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors duration-300"
                >
                  Me contacter
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}
