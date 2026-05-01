"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import { slugify } from "@/lib/utils";

interface AdminCategoryFormProps {
  categoryId?: number;
  initialData?: {
    name: string;
    slug: string;
    cover_image: string;
    position: number;
  };
}

export default function AdminCategoryForm({
  categoryId,
  initialData,
}: AdminCategoryFormProps) {
  const router = useRouter();
  const isEdit = !!categoryId;

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    cover_image: initialData?.cover_image || "",
    position: initialData?.position?.toString() || "0",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: isEdit ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEdit
        ? `/api/admin/categories/${categoryId}`
        : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || slugify(form.name),
          cover_image: form.cover_image.trim() || null,
          position: Number(form.position),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur.");
      }

      // Reset form on create
      if (!isEdit) {
        setForm({ name: "", slug: "", cover_image: "", position: "0" });
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="admin-label">Nom *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="admin-input"
          placeholder="Paysages"
        />
      </div>

      <div>
        <label className="admin-label">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="admin-input font-mono text-xs"
          placeholder="paysages"
        />
      </div>

      <div>
        <label className="admin-label">Position</label>
        <input
          type="number"
          min={0}
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          className="admin-input"
        />
      </div>

      <div>
        <label className="admin-label">Image de couverture</label>
        <ImageUpload
          value={form.cover_image}
          onChange={(filename) => setForm({ ...form, cover_image: filename })}
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors disabled:opacity-50"
      >
        {saving ? "…" : isEdit ? "Enregistrer" : "Créer la galerie"}
      </button>
    </form>
  );
}
