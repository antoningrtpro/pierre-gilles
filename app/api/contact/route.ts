import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, photo_title, format_selected, message } =
      body;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Nom, email et message sont requis." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    const validSubjects = ["Achat", "Collaboration", "Autre"];
    const resolvedSubject =
      subject && validSubjects.includes(subject) ? subject : "Autre";

    const db = getDb();
    db.prepare(
      `INSERT INTO contact_requests (name, email, subject, photo_title, format_selected, message)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      name.trim(),
      email.trim(),
      resolvedSubject,
      photo_title?.trim() || null,
      format_selected?.trim() || null,
      message.trim()
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
