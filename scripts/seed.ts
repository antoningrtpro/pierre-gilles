/**
 * Seed script Firebase — npm run seed
 *
 * Règles de sécurité :
 *  - Admin     : créé uniquement si absent (jamais écrasé)
 *  - Settings  : insérés uniquement si la clé n'existe pas encore
 *  - Catégories & Photos : insérées UNIQUEMENT si la base est vierge (0 catégorie)
 *
 * Prérequis : renseigner FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY dans .env.local
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function seed() {
  // ─── Admin (jamais écrasé) ─────────────────────────────────────────────────
  const adminRef = db.collection("config").doc("admin");
  const adminDoc = await adminRef.get();
  if (!adminDoc.exists) {
    const hash = await bcrypt.hash("changeme123", 12);
    await adminRef.set({ username: "admin", password_hash: hash });
    console.log("✓ Admin créé — login: admin / changeme123");
  } else {
    console.log("✓ Admin déjà présent (non modifié)");
  }

  // ─── Settings (ne touche pas aux valeurs déjà modifiées) ──────────────────
  const settingsRef = db.collection("config").doc("settings");
  const settingsDoc = await settingsRef.get();
  const existingSettings = settingsDoc.data() || {};

  const defaultSettings: Record<string, string> = {
    photographer_name: "Pierre G.",
    hero_title: "Pierre G.",
    tagline: "Le monde vivant, saisi dans l'instant",
    about_text:
      "Photographe basé en France, Pierre G. développe un travail centré sur la recherche d'instants forts, où lumière, mouvement et composition se rejoignent.\n\nIl s'attache à saisir des moments rares — une scène fugace, une émotion ou un paysage qui transforme un instant ordinaire en image marquante.\n\nEn photographie animalière, son approche repose sur la patience et le respect du vivant, avec des images issues d'heures d'observation, sans intervention.",
    instagram_url: "https://instagram.com/pierreg_photography",
    hero_image: "",
    hero_position: "center",
    portrait_image: "",
    notification_email: "",
  };

  const toInsert: Record<string, string> = {};
  for (const [key, value] of Object.entries(defaultSettings)) {
    if (!(key in existingSettings)) toInsert[key] = value;
  }
  if (Object.keys(toInsert).length > 0) {
    await settingsRef.set(toInsert, { merge: true });
  }
  console.log("✓ Paramètres initialisés (valeurs existantes conservées)");

  console.log("\n🌿 Seed terminé.");
  console.log("   Admin : http://localhost:3000/admin");
  console.log("   Login : admin / changeme123\n");
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
