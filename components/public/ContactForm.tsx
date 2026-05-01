"use client";

import { useState, FormEvent } from "react";

interface ContactFormProps {
  photoTitle?: string;
  formats?: { id: number; label: string; price: number }[];
  defaultSubject?: string;
}

export default function ContactForm({
  photoTitle,
  formats = [],
  defaultSubject = "Achat",
}: ContactFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: defaultSubject,
    format_selected: formats[0]?.label || "",
    message: "",
  });
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
        body: JSON.stringify({ ...form, photo_title: photoTitle }),
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

  if (status === "success") {
    return (
      <div className="border border-moss/30 bg-moss/5 rounded-sm p-8 text-center">
        <p className="font-serif text-xl text-ink">Message envoyé.</p>
        <p className="text-sm text-ink/60 mt-2">
          Votre demande a bien été envoyée. Pierre vous répondra sous 48h.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      {!photoTitle && (
        <div>
          <label className="block text-xs tracking-widest uppercase text-ink/60 mb-2">
            Sujet *
          </label>
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full border border-ink/20 bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-moss transition-colors"
          >
            <option value="Achat">Achat</option>
            <option value="Collaboration">Collaboration</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      )}

      {formats.length > 0 && (
        <div>
          <label className="block text-xs tracking-widest uppercase text-ink/60 mb-2">
            Format souhaité
          </label>
          <select
            value={form.format_selected}
            onChange={(e) =>
              setForm({ ...form, format_selected: e.target.value })
            }
            className="w-full border border-ink/20 bg-cream px-4 py-3 text-sm text-ink focus:outline-none focus:border-moss transition-colors"
          >
            <option value="">— Choisir un format —</option>
            {formats.map((f) => (
              <option key={f.id} value={f.label}>
                {f.label} — {f.price} €
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs tracking-widest uppercase text-ink/60 mb-2">
          {photoTitle ? "Comment voulez-vous exploiter la photo ?" : "Message *"}
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-moss transition-colors resize-none"
          placeholder={photoTitle ? "Tirage personnel, cadeau, décoration d'intérieur…" : "Votre message..."}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full sm:w-auto px-10 py-3.5 bg-ink text-cream text-xs tracking-widest uppercase font-medium hover:bg-moss transition-colors duration-300 disabled:opacity-50"
      >
        {status === "sending" ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}
