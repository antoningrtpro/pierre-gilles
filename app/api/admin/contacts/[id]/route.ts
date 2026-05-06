import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/adminAuth";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  await adminDb.collection("contact_requests").doc(id).update({ read: !!body.read });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  await adminDb.collection("contact_requests").doc(id).update({ read: !!body.read });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  await adminDb.collection("contact_requests").doc(id).delete();
  return NextResponse.json({ ok: true });
}
