import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

/** Returns the session or a 401 response. Use in API routes. */
export async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Non autorisé." }, { status: 401 }),
    };
  }
  return { session, error: null };
}
