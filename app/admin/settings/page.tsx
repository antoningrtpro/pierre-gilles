import { adminDb } from "@/lib/firebase-admin";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Paramètres — Admin" };

export default async function AdminSettingsPage() {
  const [settingsDoc, adminDoc] = await Promise.all([
    adminDb.collection("config").doc("settings").get(),
    adminDb.collection("config").doc("admin").get(),
  ]);
  const settings = (settingsDoc.data() || {}) as Record<string, string>;
  const passwordChanged = !!(adminDoc.data() as any)?.password_changed;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink">Paramètres</h1>
        <p className="text-sm text-ink/50 mt-0.5">
          Informations du site et sécurité.
        </p>
      </div>
      <AdminSettingsClient initialSettings={settings} passwordChanged={passwordChanged} />
    </div>
  );
}
