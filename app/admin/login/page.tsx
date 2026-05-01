"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Identifiants incorrects.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl text-cream">Pierre G.</h1>
          <p className="text-cream/40 text-xs tracking-widest uppercase mt-1">
            Administration
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-cream/5 border border-cream/10 rounded p-8 space-y-5"
        >
          <div>
            <label className="block text-xs tracking-widest uppercase text-cream/50 mb-2">
              Identifiant
            </label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-cream/5 border border-cream/15 px-4 py-3 text-sm text-cream placeholder:text-cream/20 focus:outline-none focus:border-moss transition-colors"
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-cream/50 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-cream/5 border border-cream/15 px-4 py-3 text-sm text-cream placeholder:text-cream/20 focus:outline-none focus:border-moss transition-colors"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-moss text-cream text-xs tracking-widest uppercase font-medium hover:bg-moss-light transition-colors disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-cream/20 text-xs mt-6">
          © {new Date().getFullYear()} Pierre G.
        </p>
      </div>
    </div>
  );
}
