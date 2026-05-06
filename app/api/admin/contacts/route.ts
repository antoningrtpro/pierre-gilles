import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const snapshot = await adminDb.collection("contact_requests").orderBy("created_at", "desc").get();
  const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(contacts);
}
