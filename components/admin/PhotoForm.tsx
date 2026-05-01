"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import { slugify } from "@/lib/utils";

interface Format {
  id?: number;
  label: string;
  price: string;
}

interface Category {
  id: number;
  name: string;
}

interface PhotoFormProps {
  photoId?: number;
  initialData?: {
    title: string;
    slug: string;
    description: string;
    category_id: number | null;
    filename: string;
    featured: boolean;
    position: number;
    formats: { id?: number; label: string; price: number }[];
  };
  categories: Category[];
}

export default function PhotoForm({
  photoId,
  initialData,
  categories,
}: PhotoFormProps) {
  const router = useRouter();
  const isEdit = !!photoId;

  const [form, setForm] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category_id: initialData?.category_id?.toString() || "",
    filename: initialData?.filename || "",
    featured: initialData?.featured || false,
    position: initialData?.position?.toString() || "0",
  });

  const [formats, setFormats] = useState<Format[]>(
    initialData?.formats.map((f) => ({
      id: f.id,
      label: f.label,
      price: f.price.toString(),
    })) || [{ label: "", price: "" }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title (only when creating)
  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: isEdit ? prev.slug : slugify(value),
    }));
  };

  const addFormat = () =>
    setFormats((prev) => [...prev, { label: "", price: "" }]);

  const removeFormat = (i: number) =>
    setFormats((prev) => prev.filter((_, idx) => idx !== i));

  const updateFormat = (i: number, field: "label" | "price", val: string) =>
    setFormats((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, [field]: val } : f))
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      description: form.description.trim(),
      category_id: form.category_id ? Number(form.category_id) : null,
      filename: form.filename.trim(),
      featured: form.featured,
      position: Number(form.position),
      formats: formats
        .filter((f) => f.label.trim() && f.price)
        .map((f) => ({
          id: f.id,
          label: f.label.trim(),
          price: Number(f.price),
        })),
    };

    try {
      const url = isEdit
        ? `/api/admin/photos/${photoId}`
        : "/api/admin/photos";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde.");
      }

      // If creating, get the new ID and save formats
      if (!isEdit) {
        const { id } = await res.json();
        await fetch(`/api/admin/photos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, formats: payload.formats }),
        });
      }

      router.push("/admin/photos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column */}
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="admin-label">Titre *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="admin-input"
              placeholder="Lumière d'automne"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="admin-label">Slug *</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="admin-input font-mono text-xs"
              placeholder="lumiere-automne"
            />
          </div>

          {/* Category */}
          <div>
            <label className="admin-label">Galerie</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="admin-input bg-white"
            >
              <option value="">— Sans galerie —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="admin-label">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="admin-input resize-none"
              placeholder="Une brève description poétique de la photo…"
            />
          </div>

          {/* Featured + Position */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-moss"
              />
              <span className="text-sm text-ink">Mise en avant</span>
            </label>
            <div>
              <label className="admin-label inline">Position</label>
              <input
                type="number"
                min={0}
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="admin-input w-20 ml-2 inline-block"
              />
            </div>
          </div>

          {/* Formats */}
          <div>
            <label className="admin-label">Formats & Prix</label>
            <div className="space-y-2">
              {formats.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={f.label}
                    onChange={(e) => updateFormat(i, "label", e.target.value)}
                    placeholder="30×40 cm — Fine Art"
                    className="admin-input flex-1"
                  />
                  <input
                    type="number"
                    min={0}
                    value={f.price}
                    onChange={(e) => updateFormat(i, "price", e.target.value)}
                    placeholder="Prix €"
                    className="admin-input w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeFormat(i)}
                    className="text-ink/30 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFormat}
              className="mt-2 text-xs text-moss hover:underline"
            >
              + Ajouter un format
            </button>
          </div>
        </div>

        {/* Right: image */}
        <div>
          <label className="admin-label">Image *</label>
          <ImageUpload
            value={form.filename}
            onChange={(filename) => setForm({ ...form, filename })}
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="flex items-center gap-4 pt-2 border-t border-ink/8">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors disabled:opacity-50"
        >
          {saving ? "Sauvegarde…" : isEdit ? "Enregistrer" : "Créer la photo"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 border border-ink/20 text-ink text-xs tracking-widest uppercase hover:bg-ink/5 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
