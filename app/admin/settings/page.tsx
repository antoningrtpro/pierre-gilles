import { adminDb } from "@/lib/firebase-admin";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Paramètres — Admin" };

export default async function AdminSettingsPage() {
  const doc = await adminDb.collection("config").doc("settings").get();
  const settings = (doc.data() || {}) as Record<string, string>;

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
