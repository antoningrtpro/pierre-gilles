import ContactForm from "@/components/public/ContactForm";
import RevealOnScroll from "@/components/public/RevealOnScroll";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Pierre G. pour un achat, une collaboration ou toute question.",
};

export default function ContactPage() {
  return (
    <div className="pt-24 md:pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <RevealOnScroll>
          <p className="text-xs tracking-widest uppercase text-moss mb-3">
            Contact
          </p>
          <h1 className="font-serif text-display-lg text-ink mb-4">
            Écrire à Pierre
          </h1>
          <p className="text-ink/60 text-sm mb-14 max-w-lg">
            Pour une commande, une collaboration ou simplement un bonjour.
            Pierre répond à tous les messages sous 48h.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <ContactForm defaultSubject="Achat" />
        </RevealOnScroll>

        {/* Info cards */}
        <RevealOnScroll delay={200}>
          <div className="mt-16 pt-12 border-t border-ink/10 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-xs tracking-widest uppercase text-moss mb-2">
                Commandes
              </p>
              <p className="text-sm text-ink/70 leading-relaxed">
                Tirages Fine Art sur papier Hahnemühle, encadrés ou non. Envoi
                soigné en France et à l&apos;international.
              </p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-moss mb-2">
                Collaborations
              </p>
              <p className="text-sm text-ink/70 leading-relaxed">
                Édition, presse, usage commercial, expositions. Pierre étudie
                toutes les propositions.
              </p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-moss mb-2">
                Réponse
              </p>
              <p className="text-sm text-ink/70 leading-relaxed">
                Pierre répond à chaque message personnellement, sous 48h en
                semaine.
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
