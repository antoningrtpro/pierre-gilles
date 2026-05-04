"use client";

import { useRef, useState } from "react";
import { imageUrl } from "@/lib/utils";

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function MultiImageUpload({ images, onChange }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur upload");
    }
    const { filename } = await res.json();
    return filename;
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const filenames = await Promise.all(files.map(uploadFile));
      onChange([...images, ...filenames]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  /* ── Drag & drop ─────────────────────────────────────────── */
  const handleDragStart = (e: React.DragEvent, i: number) => {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(i);
  };
  const handleDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return reset();
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    onChange(next);
    reset();
  };
  const reset = () => { setDragIndex(null); setDragOverIndex(null); };

  return (
    <div>
      {/* Image list */}
      {images.length > 0 && (
        <div className="space-y-2 mb-4">
          {images.map((img, i) => (
            <div
              key={`${img}-${i}`}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={reset}
              className={`flex items-center gap-3 p-2 border rounded-sm bg-white select-none transition-all ${
                dragOverIndex === i && dragIndex !== i
                  ? "border-moss bg-moss/5 scale-[1.01]"
                  : "border-ink/10"
              } ${dragIndex === i ? "opacity-40" : "opacity-100"}`}
            >
              {/* Drag handle */}
              <span className="cursor-grab active:cursor-grabbing text-ink/25 hover:text-ink/50 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </span>

              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(img)}
                alt={`Image ${i + 1}`}
                className="w-16 h-16 object-cover rounded-sm shrink-0 bg-ink/5 pointer-events-none"
              />

              {/* Cover badge */}
              {i === 0 && (
                <span className="text-[10px] tracking-widest uppercase text-moss border border-moss/30 px-1.5 py-0.5 shrink-0">
                  Couverture
                </span>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink/40 truncate">{img.split("/").pop()}</p>
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-ink/25 hover:text-red-500 transition-colors shrink-0 p-1"
                title="Supprimer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-ink/20 text-ink/45 text-xs tracking-wide hover:border-moss hover:text-moss transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {uploading ? "Upload en cours…" : images.length === 0 ? "Ajouter des images" : "Ajouter une image"}
      </button>

      {images.length > 1 && (
        <p className="text-xs text-ink/35 mt-1.5">
          Glissez pour réordonner · La première image est la couverture
        </p>
      )}

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
