"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

const breadcrumbs: Record<string, string> = {
  "/admin": "Tableau de bord",
  "/admin/photos": "Photos",
  "/admin/photos/new": "Nouvelle photo",
  "/admin/categories": "Galeries",
  "/admin/contacts": "Messages",
  "/admin/settings": "Paramètres",
};

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const crumb = breadcrumbs[pathname] || "Administration";
  const isEditPage = pathname.includes("/edit");

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <header className="bg-white border-b border-ink/8 px-6 md:px-8 h-14 flex items-center justify-between shrink-0">
      {/* Mobile: hamburger placeholder + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile nav links */}
        <nav className="flex md:hidden items-center gap-4 text-xs">
          <Link href="/admin/photos" className="text-ink/60 hover:text-ink">Photos</Link>
          <Link href="/admin/categories" className="text-ink/60 hover:text-ink">Galeries</Link>
          <Link href="/admin/contacts" className="text-ink/60 hover:text-ink">Messages</Link>
        </nav>

        <span className="hidden md:block text-sm font-medium text-ink">
          {isEditPage ? "Modifier la photo" : crumb}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden text-ink/40 hover:text-ink transition-colors"
          title="Voir le site"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>

        <button
          onClick={handleLogout}
          className="text-xs text-ink/50 hover:text-ink transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
