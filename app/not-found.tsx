import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-xs tracking-widest uppercase text-moss mb-4">404</p>
      <h1 className="font-serif text-4xl text-ink mb-4">Page introuvable</h1>
      <p className="text-ink/50 text-sm mb-10 max-w-xs">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="px-8 py-3 border border-ink/30 text-ink text-xs tracking-widest uppercase hover:bg-ink hover:text-cream transition-all duration-300"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
