import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-serif text-lg text-ink">Pierre G.</p>
          <p className="text-xs tracking-widest uppercase text-ink/40 mt-1">
            Photographie naturaliste
          </p>
        </div>

        <nav className="flex items-center gap-8">
          <Link
            href="/gallery"
            className="text-xs tracking-widest uppercase text-ink/60 hover:text-moss transition-colors"
          >
            Galeries
          </Link>
          <Link
            href="/about"
            className="text-xs tracking-widest uppercase text-ink/60 hover:text-moss transition-colors"
          >
            À propos
          </Link>
          <Link
            href="/contact"
            className="text-xs tracking-widest uppercase text-ink/60 hover:text-moss transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://instagram.com/pierreg_photography"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-widest uppercase text-ink/60 hover:text-moss transition-colors"
          >
            Instagram
          </a>
          <span className="text-ink/20">·</span>
          <p className="text-xs text-ink/40">
            © {new Date().getFullYear()} Pierre G.
          </p>
        </div>
      </div>
    </footer>
  );
}
