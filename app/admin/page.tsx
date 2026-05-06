import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import { getSession } from "@/lib/auth";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administration — Pierre G.",
};

interface RecentContact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: any;
  photo_title: string | null;
}

export default async function AdminDashboard() {
  const session = await getSession();

  const [photoCountSnap, catCountSnap, unreadCountSnap, recentSnap] = await Promise.all([
    adminDb.collection("photos").count().get(),
    adminDb.collection("categories").count().get(),
    adminDb.collection("contact_requests").where("read", "==", false).count().get(),
    adminDb.collection("contact_requests").orderBy("created_at", "desc").limit(5).get(),
  ]);

  const photoCount = photoCountSnap.data().count;
  const catCount = catCountSnap.data().count;
  const unreadCount = unreadCountSnap.data().count;

  const totalContactsSnap = await adminDb.collection("contact_requests").count().get();
  const totalContacts = totalContactsSnap.data().count;

  const recentContacts = recentSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().created_at?.toDate?.()?.toISOString() ?? null,
  })) as RecentContact[];

  const statCards = [
    {
      label: "Photos",
      value: photoCount,
      href: "/admin/photos",
      color: "bg-moss/10 text-moss",
    },
    {
      label: "Galeries",
      value: catCount,
      href: "/admin/categories",
      color: "bg-ink/5 text-ink",
    },
    {
      label: "Messages non lus",
      value: unreadCount,
      href: "/admin/contacts",
      color: unreadCount > 0 ? "bg-amber-50 text-amber-700" : "bg-ink/5 text-ink",
    },
    {
      label: "Messages total",
      value: totalContacts,
      href: "/admin/contacts",
      color: "bg-ink/5 text-ink",
    },
  ];

  return (
    <div className="max-w-5xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink">
          Bonjour{session?.username ? `, ${session.username}` : ""} 👋
        </h1>
        <p className="text-sm text-ink/50 mt-1">
          Voici un aperçu de votre portfolio.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white border border-ink/8 rounded-lg p-5 hover:border-moss/40 transition-colors group"
          >
            <p className="text-xs text-ink/50 mb-2">{card.label}</p>
            <p className={`text-3xl font-semibold rounded px-1 inline-block ${card.color}`}>
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="text-sm font-medium text-ink/60 uppercase tracking-widest mb-4">
          Actions rapides
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/photos/new"
            className="px-5 py-2.5 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors"
          >
            + Ajouter une photo
          </Link>
          <Link
            href="/admin/categories"
            className="px-5 py-2.5 border border-ink/20 text-ink text-xs tracking-widest uppercase hover:bg-ink/5 transition-colors"
          >
            Gérer les galeries
          </Link>
          <Link
            href="/admin/contacts"
            className="px-5 py-2.5 border border-ink/20 text-ink text-xs tracking-widest uppercase hover:bg-ink/5 transition-colors"
          >
            Voir les messages
          </Link>
        </div>
      </div>

      {/* Recent contacts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-ink/60 uppercase tracking-widest">
            Messages récents
          </h2>
          <Link
            href="/admin/contacts"
            className="text-xs text-moss hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        {recentContacts.length === 0 ? (
          <div className="bg-white border border-ink/8 rounded-lg p-8 text-center text-ink/40 text-sm">
            Aucun message pour le moment.
          </div>
        ) : (
          <div className="bg-white border border-ink/8 rounded-lg overflow-hidden">
            {recentContacts.map((c, i) => (
              <Link
                key={c.id}
                href="/admin/contacts"
                className={`flex items-start gap-4 px-5 py-4 hover:bg-ink/2 transition-colors ${
                  i < recentContacts.length - 1 ? "border-b border-ink/6" : ""
                }`}
              >
                {/* Unread dot */}
                <div className="mt-1 shrink-0">
                  {!c.read ? (
                    <span className="w-2 h-2 rounded-full bg-moss block" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-transparent block" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className={`text-sm font-medium ${!c.read ? "text-ink" : "text-ink/60"}`}>
                      {c.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-ink/5 text-ink/50">
                      {c.subject}
                    </span>
                    {c.photo_title && (
                      <span className="text-xs text-ink/40 truncate">
                        re: {c.photo_title}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink/50 truncate">{c.message}</p>
                </div>
                <span className="text-xs text-ink/30 shrink-0">
                  {c.created_at?.toDate
                    ? c.created_at.toDate().toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                    : "—"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
