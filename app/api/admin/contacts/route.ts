import { NextRequest, NextResponse } from "next/server";
import { getDb, ContactRequest } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all";

  const db = getDb();
  let query = "SELECT * FROM contact_requests";
  const conditions: string[] = [];

  if (filter === "unread") conditions.push("read = 0");
  else if (["Achat", "Collaboration", "Autre"].includes(filter)) {
    conditions.push(`subject = '${filter}'`);
  }

  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY created_at DESC";

  const contacts = db.prepare(query).all() as ContactRequest[];
  return NextResponse.json(contacts);
}
