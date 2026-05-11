"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { imageUrl } from "@/lib/utils";
import { Category } from "@/lib/db";

interface AdminCategoriesListProps {
  categories: Category[];
}

export default function AdminCategoriesList({ categories: initial }: AdminCategoriesListProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  /* ── Drag & drop ────────────────────────────────────────── */
  const onDragStart = (i: number) => {
    dragIndex.current = i;
  };

  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOver(i);
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) {
      setDragOver(null);
      return;
    }
    const next = [...categories];
    const [moved] = next.splice(from, 1);
    next.splice(dropIndex, 0, moved);
    setCategories(next);
    setDragOver(null);
    dragIndex.current = null;
    setSaved(false);
  };

  const onDragEnd = () => {
    setDragOver(null);
    dragIndex.current = null;
  };

  /* ── Save order ─────────────────────────────────────────── */
  const saveOrder = async () => {
    setSaving(true);
    try {
      const orders = categories.map((cat, i) => ({ id: cat.id, position: i }));
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setConfirmDelete(null);
      router.refresh();
    } catch {
      alert("Erreur lors de la suppression.");
    } finally {
      setDeleting(null);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white border border-ink/8 rounded-lg p-12 text-center text-ink/40 text-sm">
        Aucune galerie. Créez-en une à droite.
      </div>
    );
  }

  return (
    <div>
      {/* List */}
      <div className="bg-white border border-ink/8 rounded-lg overflow-hidden">
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDrop={(e) => onDrop(e, i)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-grab active:cursor-grabbing select-none ${
              i < categories.length - 1 ? "border-b border-ink/6" : ""
            } ${
              dragOver === i
                ? "bg-moss/5 border-t-2 border-t-moss"
                : "hover:bg-ink/1"
            }`}
          >
            {/* Drag handle */}
            <div className="text-ink/20 hover:text-ink/50 shrink-0 flex flex-col gap-0.5">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
              </div>
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
              </div>
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-1 h-1 rounded-full bg-current" />
              </div>
            </div>

            {/* Position badge */}
            <span className="text-[10px] text-ink/30 w-4 text-center shrink-0">{i + 1}</span>

            {/* Thumbnail */}
            <div className="relative w-14 h-10 rounded overflow-hidden bg-ink/5 shrink-0">
              {cat.cover_image ? (
                <Image
                  src={imageUrl(cat.cover_image)}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized={cat.cover_image.startsWith("http")}
                />
              ) : (
                <div className="w-full h-full bg-ink/10" />
              )}
            </div>

            {/* Name + slug */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{cat.name}</p>
              <p className="text-xs text-ink/40 font-mono truncate">{cat.slug}</p>
            </div>

            {/* Photo count */}
            <span className="text-xs text-ink/40 shrink-0">
              {(cat as any).photo_count ?? 0} photo{(cat as any).photo_count !== 1 ? "s" : ""}
            </span>

            {/* Delete */}
            {confirmDelete === cat.id ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deleting === cat.id}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  {deleting === cat.id ? "…" : "Supprimer"}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="text-xs text-ink/40 hover:text-ink"
                >
                  Non
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(cat.id)}
                className="text-xs text-ink/30 hover:text-red-500 transition-colors shrink-0"
              >
                Supprimer
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Save order button */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={saveOrder}
          disabled={saving}
          className="px-5 py-2 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors disabled:opacity-50"
        >
          {saving ? "Sauvegarde…" : saved ? "✓ Ordre enregistré" : "Enregistrer l'ordre"}
        </button>
        <p className="text-xs text-ink/35">Glissez les lignes pour réordonner</p>
      </div>
    </div>
  );
}
