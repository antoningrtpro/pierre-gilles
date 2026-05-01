"use client";

import { useState } from "react";
import { imageUrl } from "@/lib/utils";
import ImageUpload from "./ImageUpload";

interface AdminSettingsClientProps {
  initialSettings: Record<string, string>;
}

export default function AdminSettingsClient({
  initialSettings,
}: AdminSettingsClientProps) {
  /* ── Hero image ─────────────────────────────────────────── */
  const [heroImage, setHeroImage] = useState(
    initialSettings.hero_image || ""
  );
  const [heroPosition, setHeroPosition] = useState(
    initialSettings.hero_position || "center"
  );
  const [heroStatus, setHeroStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const saveHeroImage = async () => {
    setHeroStatus("saving");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero_image: heroImage, hero_position: heroPosition }),
      });
      if (!res.ok) throw new Error();
      setHeroStatus("saved");
      setTimeout(() => setHeroStatus("idle"), 3000);
    } catch {
      setHeroStatus("error");
    }
  };

  /* ── Portrait image ─────────────────────────────────────── */
  const [portraitImage, setPortraitImage] = useState(
    initialSettings.portrait_image || ""
  );
  const [portraitStatus, setPortraitStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const savePortraitImage = async () => {
    setPortraitStatus("saving");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portrait_image: portraitImage }),
      });
      if (!res.ok) throw new Error();
      setPortraitStatus("saved");
      setTimeout(() => setPortraitStatus("idle"), 3000);
    } catch {
      setPortraitStatus("error");
    }
  };

  /* ── Site info ──────────────────────────────────────────── */
  const [siteForm, setSiteForm] = useState({
    photographer_name: initialSettings.photographer_name || "Pierre G.",
    tagline: initialSettings.tagline || "La nature dans ses instants les plus silencieux.",
    about_text: initialSettings.about_text || "",
    instagram_url: initialSettings.instagram_url || "https://instagram.com/pierreg_photography",
  });
  const [siteStatus, setSiteStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [siteError, setSiteError] = useState("");

  const saveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiteStatus("saving");
    setSiteError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setSiteStatus("saved");
      setTimeout(() => setSiteStatus("idle"), 3000);
    } catch (err) {
      setSiteStatus("error");
      setSiteError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  /* ── Password ───────────────────────────────────────────── */
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (pwForm.new_password.length < 8) {
      setPwError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    setPwStatus("saving");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: pwForm.current_password,
          new_password: pwForm.new_password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setPwStatus("saved");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => setPwStatus("idle"), 3000);
    } catch (err) {
      setPwStatus("error");
      setPwError(err instanceof Error ? err.message : "Erreur.");
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Image d'accueil ──────────────────────────────────── */}
      <div className="bg-white border border-ink/8 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Image d&apos;accueil</h2>
            <p className="text-xs text-ink/45 mt-0.5">
              Photo affichée en plein écran sur la page d&apos;accueil.
            </p>
          </div>
          {/* Live preview badge */}
          {heroImage && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-moss hover:underline shrink-0"
            >
              Voir sur le site →
            </a>
          )}
        </div>

        {/* Aperçu hero — recadrage centré comme sur la homepage */}
        {heroImage && (
          <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-sm bg-ink/5 mb-6 border border-ink/8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl(heroImage)}
              alt="Image d'accueil actuelle"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end p-4 bg-gradient-to-t from-ink/60 to-transparent pointer-events-none">
              <div className="text-cream">
                <p className="font-serif text-xl">Pierre G.</p>
                <p className="text-xs opacity-70 tracking-widest uppercase mt-0.5">
                  La nature dans ses instants les plus silencieux.
                </p>
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-ink/60 text-cream text-[10px] tracking-widest uppercase px-2 py-1 rounded">
              Aperçu hero
            </div>
          </div>
        )}

        {/* Upload widget */}
        <ImageUpload
          value={heroImage}
          onChange={setHeroImage}
        />

        {/* Position */}
        <div className="mt-4">
          <label className="block text-xs text-ink/50 mb-1.5">Position de recadrage</label>
          <select
            value={heroPosition}
            onChange={(e) => setHeroPosition(e.target.value)}
            className="admin-input bg-white w-48"
          >
            <option value="top">Haut</option>
            <option value="center">Centre (défaut)</option>
            <option value="bottom">Bas</option>
          </select>
        </div>

        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            onClick={saveHeroImage}
            disabled={heroStatus === "saving" || !heroImage}
            className="px-6 py-2.5 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors disabled:opacity-50"
          >
            {heroStatus === "saving"
              ? "Sauvegarde…"
              : heroStatus === "saved"
              ? "✓ Image enregistrée"
              : "Enregistrer l'image"}
          </button>
          {heroImage && (
            <button
              type="button"
              onClick={() => setHeroImage("")}
              className="text-xs text-ink/40 hover:text-red-500 transition-colors"
            >
              Supprimer
            </button>
          )}
          {heroStatus === "error" && (
            <p className="text-xs text-red-500">Erreur lors de la sauvegarde.</p>
          )}
        </div>

        <p className="text-xs text-ink/35 mt-3">
          Sans image sélectionnée, la première photo mise en avant sera utilisée.
        </p>
      </div>

      {/* ── Photo de portrait ───────────────────────────────── */}
      <div className="bg-white border border-ink/8 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Photo de portrait</h2>
            <p className="text-xs text-ink/45 mt-0.5">
              Affichée dans les sections &quot;Qui je suis&quot; et sur la page À propos.
            </p>
          </div>
        </div>

        {portraitImage && (
          <div className="mb-6 overflow-hidden rounded-sm border border-ink/8 bg-ink/3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl(portraitImage)}
              alt="Portrait actuel"
              className="w-full h-auto block max-h-[320px] object-contain"
            />
          </div>
        )}

        <ImageUpload
          value={portraitImage}
          onChange={setPortraitImage}
        />

        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            onClick={savePortraitImage}
            disabled={portraitStatus === "saving" || !portraitImage}
            className="px-6 py-2.5 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors disabled:opacity-50"
          >
            {portraitStatus === "saving"
              ? "Sauvegarde…"
              : portraitStatus === "saved"
              ? "✓ Image enregistrée"
              : "Enregistrer le portrait"}
          </button>
          {portraitImage && (
            <button
              type="button"
              onClick={() => setPortraitImage("")}
              className="text-xs text-ink/40 hover:text-red-500 transition-colors"
            >
              Supprimer
            </button>
          )}
          {portraitStatus === "error" && (
            <p className="text-xs text-red-500">Erreur lors de la sauvegarde.</p>
          )}
        </div>
      </div>

      {/* ── Informations du site ─────────────────────────────── */}
      <div className="bg-white border border-ink/8 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-ink mb-6">Informations du site</h2>
        <form onSubmit={saveSiteSettings} className="space-y-5">
          <div>
            <label className="admin-label">Nom du photographe</label>
            <input
              type="text"
              value={siteForm.photographer_name}
              onChange={(e) => setSiteForm({ ...siteForm, photographer_name: e.target.value })}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">Tagline</label>
            <input
              type="text"
              value={siteForm.tagline}
              onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label">URL Instagram</label>
            <input
              type="url"
              value={siteForm.instagram_url}
              onChange={(e) => setSiteForm({ ...siteForm, instagram_url: e.target.value })}
              className="admin-input"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className="admin-label">Texte de présentation (À propos)</label>
            <textarea
              rows={6}
              value={siteForm.about_text}
              onChange={(e) => setSiteForm({ ...siteForm, about_text: e.target.value })}
              className="admin-input resize-none"
              placeholder="Texte affiché sur la page À propos…"
            />
          </div>

          {siteError && <p className="text-red-500 text-xs">{siteError}</p>}

          <button
            type="submit"
            disabled={siteStatus === "saving"}
            className="px-6 py-2.5 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors disabled:opacity-50"
          >
            {siteStatus === "saving" ? "Sauvegarde…" : siteStatus === "saved" ? "✓ Sauvegardé" : "Enregistrer"}
          </button>
        </form>
      </div>

      {/* ── Mot de passe ─────────────────────────────────────── */}
      <div className="bg-white border border-ink/8 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-ink mb-6">Changer le mot de passe</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="admin-label">Mot de passe actuel</label>
            <input
              type="password"
              required
              value={pwForm.current_password}
              onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
              className="admin-input"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="admin-label">Nouveau mot de passe</label>
            <input
              type="password"
              required
              minLength={8}
              value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
              className="admin-input"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="admin-label">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              required
              value={pwForm.confirm_password}
              onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
              className="admin-input"
              autoComplete="new-password"
            />
          </div>

          {pwError && <p className="text-red-500 text-xs">{pwError}</p>}

          <button
            type="submit"
            disabled={pwStatus === "saving"}
            className="px-6 py-2.5 bg-ink text-cream text-xs tracking-widest uppercase hover:bg-moss transition-colors disabled:opacity-50"
          >
            {pwStatus === "saving" ? "Changement…" : pwStatus === "saved" ? "✓ Mot de passe changé" : "Changer le mot de passe"}
          </button>
        </form>
      </div>

      {/* ── Zone de danger ───────────────────────────────────── */}
      <div className="bg-white border border-red-100 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-red-600 mb-2">Zone de danger</h2>
        <p className="text-xs text-ink/50">
          Identifiants par défaut :{" "}
          <code className="bg-ink/5 px-1 py-0.5 rounded">admin</code> /{" "}
          <code className="bg-ink/5 px-1 py-0.5 rounded">changeme123</code>.{" "}
          Changez le mot de passe ci-dessus dès que possible.
        </p>
      </div>

    </div>
  );
}
