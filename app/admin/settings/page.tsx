import { getDb } from "@/lib/db";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Paramètres — Admin" };

export default function AdminSettingsPage() {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink">Paramètres</h1>
        <p className="text-sm text-ink/50 mt-0.5">
          Informations du site et sécurité.
        </p>
      </div>
      <AdminSettingsClient initialSettings={settings} />
    </div>
  );
}
