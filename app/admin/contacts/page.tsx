import { adminDb } from "@/lib/firebase-admin";
import { ContactRequest } from "@/lib/db";
import { serializeDoc } from "@/lib/utils";
import AdminContactsClient from "@/components/admin/AdminContactsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Messages — Admin" };

export default async function AdminContactsPage() {
  const snapshot = await adminDb
    .collection("contact_requests")
    .orderBy("created_at", "desc")
    .get();

  const contacts = snapshot.docs.map((doc) =>
    serializeDoc({ id: doc.id, ...doc.data() })
  ) as ContactRequest[];

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-ink">Messages</h1>
        <p className="text-sm text-ink/50 mt-0.5">
          {contacts.filter((c) => !c.read).length} non lu
          {contacts.filter((c) => !c.read).length !== 1 ? "s" : ""} sur{" "}
          {contacts.length}
        </p>
      </div>
      <AdminContactsClient initialContacts={contacts} />
    </div>
  );
}
