import { NextRequest, NextResponse } from "next/server";
import { adminDb, FieldValue } from "@/lib/firebase-admin";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, photo_title, format_selected, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Nom et email sont requis." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    const validSubjects = ["Tirage", "Achat", "Collaboration", "Autre"];
    const resolvedSubject = subject && validSubjects.includes(subject) ? subject : "Autre";

    await adminDb.collection("contact_requests").add({
      name: name.trim(),
      email: email.trim(),
      subject: resolvedSubject,
      photo_title: photo_title?.trim() || null,
      format_selected: format_selected?.trim() || null,
      message: message?.trim() || "",
      read: false,
      created_at: FieldValue.serverTimestamp(),
    });

    // Email notification
    const settingsDoc = await adminDb.collection("config").doc("settings").get();
    const settings = settingsDoc.data() || {};
    const notificationEmail = settings.notification_email;

    if (notificationEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Portfolio Pierre G. <onboarding@resend.dev>",
          to: notificationEmail,
          replyTo: `${name.trim()} <${email.trim()}>`,
          subject: `📩 Nouvelle demande — ${resolvedSubject}${photo_title ? ` · ${photo_title}` : ""}`,
          html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a18">
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
            <p style="font-size:14px;line-height:1.6;white-space:pre-line">${message?.trim() || ""}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
            <p style="font-size:12px;color:#aaa">Répondre directement à <a href="mailto:${email.trim()}" style="color:#4a6741">${email.trim()}</a></p>
          </div>`,
        });
      } catch (mailErr) {
        console.error("Email notification error:", mailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
