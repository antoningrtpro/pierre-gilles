import { NextRequest, NextResponse } from "next/server";
import { getDb, ContactRequest } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const contactId = Number(id);
  const db = getDb();

  const existing = db
    .prepare("SELECT * FROM contact_requests WHERE id = ?")
    .get(contactId) as ContactRequest | undefined;
  if (!existing) {
    return NextResponse.json(
      { error: "Demande introuvable." },
      { status: 404 }
    );
  }

  const body = await req.json();
  const newRead = body.read !== undefined ? (body.read ? 1 : 0) : existing.read;
  db.prepare("UPDATE contact_requests SET read = ? WHERE id = ?").run(
    newRead,
    contactId
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const contactId = Number(id);
  const db = getDb();

  db.prepare("DELETE FROM contact_requests WHERE id = ?").run(contactId);
  return NextResponse.json({ ok: true });
}
