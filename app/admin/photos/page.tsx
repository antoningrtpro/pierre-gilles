import Image from "next/image";
import Link from "next/link";
import { getDb, Photo } from "@/lib/db";
import { imageUrl } from "@/lib/utils";
import AdminPhotoActions from "@/components/admin/AdminPhotoActions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Photos — Admin" };

export default function AdminPhotosPage() {
  const db = getDb();
  const photos = db
    .prepare(
      `SELECT p.*, c.name as category_name
       FROM photos p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.position ASC, p.created_at DESC`
    )
    .all() as Photo[];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-ink">Photos</h1>
          <p className="text-sm text-ink/50 mt-0.5">{photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/photos/new"
          className="px-5 py-2.5 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors"
        >
          + Ajouter
        </Link>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white border border-ink/8 rounded-lg p-16 text-center">
          <p className="text-ink/40 text-sm mb-4">Aucune photo pour le moment.</p>
          <Link
            href="/admin/photos/new"
            className="text-moss text-sm hover:underline"
          >
            Ajouter la première photo →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-ink/8 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/8 bg-ink/2">
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-ink/40 w-16">
                  Image
                </th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-ink/40">
                  Titre
                </th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-ink/40 hidden md:table-cell">
                  Galerie
                </th>
                <th className="text-center px-4 py-3 text-xs tracking-widest uppercase text-ink/40 hidden sm:table-cell">
                  À la une
                </th>
                <th className="text-center px-4 py-3 text-xs tracking-widest uppercase text-ink/40 hidden sm:table-cell">
                  Pos.
                </th>
                <th className="text-right px-4 py-3 text-xs tracking-widest uppercase text-ink/40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {photos.map((photo, i) => (
                <tr
                  key={photo.id}
                  className={`${i < photos.length - 1 ? "border-b border-ink/6" : ""} hover:bg-ink/1 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <div className="relative w-14 h-10 rounded overflow-hidden bg-ink/5 shrink-0">
                      <Image
                        src={imageUrl(photo.filename)}
                        alt={photo.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized={photo.filename.startsWith("http")}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink text-sm">{photo.title}</p>
                    <p className="text-xs text-ink/40 font-mono">{photo.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-ink/60">
                      {photo.category_name || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                        photo.featured
                          ? "bg-moss/20 text-moss"
                          : "bg-ink/5 text-ink/30"
                      }`}
                    >
                      {photo.featured ? "✓" : "–"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-xs text-ink/40">{photo.position}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminPhotoActions photoId={photo.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
