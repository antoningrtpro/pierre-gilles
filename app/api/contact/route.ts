import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { Resend } from "resend";

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

    // ── Notification email ──────────────────────────────────
    const settings = db.prepare("SELECT key, value FROM settings").all() as {
      key: string; value: string;
    }[];
    const s = Object.fromEntries(settings.map((r) => [r.key, r.value]));
    const notificationEmail = s.notification_email;

    if (notificationEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Portfolio <onboarding@resend.dev>",
          to: notificationEmail,
          subject: `📩 Nouvelle demande — ${resolvedSubject}${photo_title ? ` · ${photo_title}` : ""}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a18">
              <h2 style="font-size:18px;margin-bottom:4px">Nouvelle demande de contact</h2>
              <p style="color:#888;font-size:13px;margin-top:0">${new Date().toLocaleDateString("fr-FR", { dateStyle: "full" })}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
              <table style="width:100%;font-size:14px;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#888;width:120px">Nom</td><td><strong>${name.trim()}</strong></td></tr>
                <tr><td style="padding:6px 0;color:#888">Email</td><td><a href="mailto:${email.trim()}" style="color:#4a6741">${email.trim()}</a></td></tr>
                <tr><td style="padding:6px 0;color:#888">Sujet</td><td>${resolvedSubject}</td></tr>
                ${photo_title ? `<tr><td style="padding:6px 0;color:#888">Photo</td><td>${photo_title}</td></tr>` : ""}
                ${format_selected ? `<tr><td style="padding:6px 0;color:#888">Format</td><td>${format_selected}</td></tr>` : ""}
              </table>
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
              <p style="font-size:14px;line-height:1.6;white-space:pre-line">${message.trim()}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
              <p style="font-size:12px;color:#aaa">Répondre directement à <a href="mailto:${email.trim()}" style="color:#4a6741">${email.trim()}</a></p>
            </div>
          `,
        });
      } catch (mailErr) {
        // Ne pas bloquer la réponse si l'email échoue
        console.error("Email notification error:", mailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
