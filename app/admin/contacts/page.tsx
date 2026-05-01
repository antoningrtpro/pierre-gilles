import { getDb, ContactRequest } from "@/lib/db";
import AdminContactsClient from "@/components/admin/AdminContactsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Messages — Admin" };

export default function AdminContactsPage() {
  const db = getDb();
  const contacts = db
    .prepare(
      "SELECT * FROM contact_requests ORDER BY created_at DESC"
    )
    .all() as ContactRequest[];

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink">Messages</h1>
        <p className="text-sm text-ink/50 mt-0.5">
          {contacts.filter((c) => !c.read).length} non lu{contacts.filter((c) => !c.read).length !== 1 ? "s" : ""} sur {contacts.length}
        </p>
      </div>
      <AdminContactsClient initialContacts={contacts} />
    </div>
  );
}
