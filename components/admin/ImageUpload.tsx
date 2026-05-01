"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { imageUrl } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (filename: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'upload.");
      }
      const { filename } = await res.json();
      onChange(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded cursor-pointer transition-colors ${
          dragging ? "border-moss bg-moss/5" : "border-ink/20 hover:border-moss/50 hover:bg-moss/2"
        }`}
      >
        {value ? (
          /* ── Aperçu : format naturel de l'image ── */
          <div className="relative w-full overflow-hidden rounded group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl(value)}
              alt="Aperçu"
              className="w-full h-auto block max-h-[480px] object-contain bg-ink/3"
            />
            <div className="absolute inset-0 bg-ink/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-cream text-xs tracking-widest uppercase bg-ink/60 px-3 py-1.5 rounded">
                Changer l&apos;image
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-ink/40">
            {uploading ? (
              <>
                <div className="w-8 h-8 border-2 border-moss border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm">Upload en cours…</p>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-sm font-medium text-ink/60">
                  Glisser-déposer ou cliquer pour choisir
                </p>
                <p className="text-xs mt-1">JPEG, PNG, WebP — max 10 Mo</p>
              </>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* URL fallback */}
      <div>
        <label className="block text-xs text-ink/50 mb-1">
          Ou saisir une URL d&apos;image
        </label>
        <input
          type="text"
          value={value.startsWith("http") ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://picsum.photos/seed/forest1/800/600"
          className="w-full border border-ink/20 bg-white px-3 py-2 text-xs text-ink focus:outline-none focus:border-moss transition-colors"
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
