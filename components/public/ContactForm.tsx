"use client";

import { useState, useEffect, FormEvent } from "react";

interface ContactFormProps {
  photoTitle?: string;
  formats?: { label: string; price: number }[];
  defaultSubject?: string;
  photos?: { id: string; title: string; slug: string }[];
}

export default function ContactForm({
  photoTitle,
  formats = [],
  defaultSubject = "Tirage",
  photos = [],
}: ContactFormProps) {
  const isProduct = !!photoTitle;

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: defaultSubject,
    format_selected: formats[0]?.label || "",
    photo_selected: "",
    message: "",
  });

  // Random stock 1–5, défini côté client uniquement pour éviter le mismatch hydration
  const [stock, setStock] = useState<number | null>(null);
  useEffect(() => {
    setStock(Math.floor(Math.random() * 5) + 1);
  }, []);

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          format_selected: form.format_selected || null,
          photo_title: photoTitle || form.photo_selected || null,
          message: form.message || "",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  };

  /* ── Success ─────────────────────────────────────────────── */
  if (status === "success") {
    return (
      <div className="border border-moss/30 bg-moss/5 rounded-sm p-8 text-center">
        <p className="font-serif text-xl text-ink">
          {isProduct ? "Demande envoyée." : "Message envoyé."}
        </p>
        <p className="text-sm text-ink/60 mt-2">
          {isProduct
            ? "Pierre reviendra vers vous rapidement !"
            : "Votre demande a bien été envoyée. Pierre vous répondra sous 48h."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Nom + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs tracking-widest uppercase text-ink/60 mb-2">
            Nom *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-moss transition-colors"
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase text-ink/60 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-moss transition-colors"
            placeholder="votre@email.fr"
          />
        </div>
      </div>

      {/* Sujet — uniquement hors page produit */}
      {!isProduct && (
        <div>
          <label className="block text-xs tracking-widest uppercase text-ink/60 mb-2">
            Sujet *
          </label>
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full border border-ink/20 bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-moss transition-colors"
          >
            <option value="Tirage">Tirage</option>
            <option value="Collaboration">Collaboration</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      )}

      {/* Photo — uniquement si liste fournie et hors page produit */}
      {!isProduct && photos.length > 0 && (
        <div>
          <label className="block text-xs tracking-widest uppercase text-ink/60 mb-2">
            Photo souhaitée
          </label>
          <select
            value={form.photo_selected}
            onChange={(e) => setForm({ ...form, photo_selected: e.target.value })}
            className="w-full border border-ink/20 bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-moss transition-colors"
          >
            <option value="">— Choisir une photo —</option>
            {photos.map((p) => (
              <option key={p.id} value={p.title}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Format — si formats disponibles */}
      {formats.length > 0 && (
        <div>
          <label className="block text-xs tracking-widest uppercase text-ink/60 mb-2">
            Format souhaité
          </label>
          <select
            value={form.format_selected}
            onChange={(e) => setForm({ ...form, format_selected: e.target.value })}
            className="w-full border border-ink/20 bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-moss transition-colors"
          >
            <option value="">— Choisir un format —</option>
            {formats.map((f) => (
              <option key={f.label} value={f.label}>
                {f.label} — {f.price} €
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message — uniquement hors page produit */}
      {!isProduct && (
        <div>
          <label className="block text-xs tracking-widest uppercase text-ink/60 mb-2">
            Message *
          </label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-moss transition-colors resize-none"
            placeholder="Votre message..."
          />
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Bouton + stock */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="px-10 py-3.5 bg-ink text-cream text-xs tracking-widest uppercase font-medium hover:bg-moss transition-colors duration-300 disabled:opacity-50"
        >
          {status === "sending"
            ? "Envoi en cours…"
            : isProduct
            ? "Vérifier la disponibilité"
            : "Envoyer le message"}
        </button>

        {isProduct && stock !== null && (
          <p className="text-xs text-red-600/80 font-medium">
            Plus que <span className="font-bold">{stock}</span> exemplaire{stock > 1 ? "s" : ""} disponible{stock > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </form>
  );
}
