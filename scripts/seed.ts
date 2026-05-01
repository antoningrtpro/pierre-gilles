/**
 * Seed script — npm run seed
 *
 * Règles de sécurité :
 *  - Admin     : créé uniquement si absent (jamais écrasé)
 *  - Settings  : insérés uniquement si la clé n'existe pas encore (INSERT OR IGNORE)
 *  - Catégories & Photos : insérées UNIQUEMENT si la base est vierge (0 catégorie)
 *                          → ne reviennent jamais si vous les avez supprimées
 *
 * Pour forcer la réinitialisation complète : supprimez data/pierre.db puis relancez.
 */

import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "pierre.db");

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schéma ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    filename TEXT NOT NULL,
    featured BOOLEAN DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS formats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    price INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    photo_title TEXT,
    format_selected TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// ─── Admin (jamais écrasé) ────────────────────────────────────────────────────
const existingAdmin = db.prepare("SELECT id FROM admin WHERE id = 1").get();
if (!existingAdmin) {
  const hash = bcrypt.hashSync("changeme123", 12);
  db.prepare("INSERT INTO admin (id, username, password_hash) VALUES (1, 'admin', ?)").run(hash);
  console.log("✓ Admin créé — login: admin / changeme123");
} else {
  console.log("✓ Admin déjà présent (non modifié)");
}

// ─── Settings (INSERT OR IGNORE : ne touche pas aux valeurs déjà modifiées) ───
const insertSettingIfAbsent = db.prepare(
  "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
);
db.transaction(() => {
  insertSettingIfAbsent.run("photographer_name", "Pierre G.");
  insertSettingIfAbsent.run("tagline", "La nature dans ses instants les plus silencieux.");
  insertSettingIfAbsent.run(
    "about_text",
    "Photographe naturaliste basé en France, Pierre G. parcourt les paysages sauvages à la recherche de la lumière fugace, du silence habité et des beautés discrètes du monde vivant.\n\nFormé à l'école documentaire, il travaille essentiellement en lumière naturelle, privilégiant l'aube et le crépuscule — ces heures où la forêt retient son souffle et où la lumière devient matière.\n\nSes tirages Fine Art, réalisés sur papier Hahnemühle, sont disponibles en édition limitée."
  );
  insertSettingIfAbsent.run("instagram_url", "https://instagram.com/pierreg_photography");
  insertSettingIfAbsent.run("hero_image", "");
  insertSettingIfAbsent.run("hero_position", "center");
  insertSettingIfAbsent.run("portrait_image", "");
  insertSettingIfAbsent.run("notification_email", "");
})();
console.log("✓ Paramètres initialisés (valeurs existantes conservées)");

// ─── Catégories & Photos : UNIQUEMENT si la base est vierge ──────────────────
const categoryCount = (
  db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number }
).c;

if (categoryCount > 0) {
  console.log(
    `\n⚠️  ${categoryCount} galerie(s) déjà présente(s) — données de démo ignorées.`
  );
  console.log("   Vos données ne seront jamais écrasées par ce script.\n");
} else {
  console.log("\n📂 Base vierge détectée — insertion des données de démo…");

  // Catégories
  const insertCat = db.prepare(
    "INSERT INTO categories (name, slug, cover_image, position) VALUES (?, ?, ?, ?)"
  );
  const demoCategories = [
    { name: "Paysages",     slug: "paysages",     cover: "https://picsum.photos/seed/forest1/800/600",   pos: 0 },
    { name: "Faune sauvage",slug: "faune-sauvage", cover: "https://picsum.photos/seed/wildlife1/800/600", pos: 1 },
    { name: "Lumières",     slug: "lumieres",      cover: "https://picsum.photos/seed/fog1/800/600",      pos: 2 },
  ];
  for (const c of demoCategories) insertCat.run(c.name, c.slug, c.cover, c.pos);
  console.log("✓ 3 galeries de démo créées");

  // Helper
  const getCatId = (slug: string) =>
    (db.prepare("SELECT id FROM categories WHERE slug = ?").get(slug) as { id: number } | undefined)?.id;

  // Photos
  const insertPhoto = db.prepare(
    `INSERT INTO photos (title, slug, description, category_id, filename, featured, position)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const insertFormat = db.prepare(
    "INSERT INTO formats (photo_id, label, price) VALUES (?, ?, ?)"
  );

  const demoPhotos = [
    {
      title: "Forêt brumeuse", slug: "foret-brumeuse",
      desc: "Les hêtres se dressent dans le brouillard matinal, fantômes silencieux d'une forêt qui respire.",
      catSlug: "paysages", file: "https://picsum.photos/seed/forest1/800/600", featured: 1, pos: 0,
      formats: [{ label: "30×40 cm — Fine Art", price: 180 }, { label: "50×70 cm — Fine Art", price: 290 }, { label: "70×100 cm — Fine Art", price: 450 }],
    },
    {
      title: "Cime enneigée", slug: "cime-enneigee",
      desc: "La montagne garde le silence. Neige fraîche sur les crêtes, ciel sans nuage.",
      catSlug: "paysages", file: "https://picsum.photos/seed/snow1/800/600", featured: 1, pos: 1,
      formats: [{ label: "30×40 cm — Fine Art", price: 180 }, { label: "50×70 cm — Fine Art", price: 290 }],
    },
    {
      title: "Rivière d'automne", slug: "riviere-automne",
      desc: "L'eau court entre les feuilles ocre tombées. Un murmure que l'on n'entend qu'en s'arrêtant.",
      catSlug: "paysages", file: "https://picsum.photos/seed/river1/800/600", featured: 1, pos: 2,
      formats: [{ label: "30×40 cm — Fine Art", price: 150 }, { label: "50×70 cm — Fine Art", price: 260 }, { label: "60×90 cm — Fine Art", price: 380 }],
    },
    {
      title: "Vol de l'aigle", slug: "vol-de-l-aigle",
      desc: "Suspendu entre deux thermiques, l'aigle royal scrute la vallée.",
      catSlug: "faune-sauvage", file: "https://picsum.photos/seed/bird1/600/800", featured: 1, pos: 0,
      formats: [{ label: "40×50 cm — Fine Art", price: 220 }, { label: "60×80 cm — Fine Art", price: 350 }],
    },
    {
      title: "Regard du cerf", slug: "regard-du-cerf",
      desc: "À l'orée du bois, le cerf s'immobilise. Trois secondes d'éternité avant la fuite.",
      catSlug: "faune-sauvage", file: "https://picsum.photos/seed/wildlife1/600/800", featured: 1, pos: 1,
      formats: [{ label: "30×40 cm — Fine Art", price: 180 }, { label: "50×70 cm — Fine Art", price: 300 }],
    },
    {
      title: "Lumière rasante", slug: "lumiere-rasante",
      desc: "Cinq minutes chaque matin, la lumière traverse la brume à l'horizontale.",
      catSlug: "lumieres", file: "https://picsum.photos/seed/fog1/800/600", featured: 1, pos: 0,
      formats: [{ label: "30×40 cm — Fine Art", price: 150 }, { label: "50×70 cm — Fine Art", price: 260 }, { label: "70×100 cm — Fine Art", price: 420 }],
    },
    {
      title: "Mer étale", slug: "mer-etale",
      desc: "Entre deux marées, la mer retient son souffle.",
      catSlug: "paysages", file: "https://picsum.photos/seed/sea1/800/600", featured: 0, pos: 3,
      formats: [{ label: "30×40 cm — Fine Art", price: 160 }, { label: "50×70 cm — Fine Art", price: 270 }],
    },
    {
      title: "Montagne au crépuscule", slug: "montagne-crepuscule",
      desc: "Le sommet vire au rose-orangé. La vallée plonge dans l'ombre.",
      catSlug: "lumieres", file: "https://picsum.photos/seed/mountain1/800/600", featured: 0, pos: 1,
      formats: [{ label: "30×40 cm — Fine Art", price: 180 }, { label: "50×70 cm — Fine Art", price: 300 }, { label: "70×100 cm — Fine Art", price: 460 }],
    },
  ];

  db.transaction(() => {
    for (const p of demoPhotos) {
      const result = insertPhoto.run(p.title, p.slug, p.desc, getCatId(p.catSlug) ?? null, p.file, p.featured, p.pos);
      for (const fmt of p.formats) insertFormat.run(result.lastInsertRowid, fmt.label, fmt.price);
    }
  })();
  console.log(`✓ ${demoPhotos.length} photos de démo créées`);

  // Exemple de message de contact
  db.prepare(
    `INSERT INTO contact_requests (name, email, subject, photo_title, format_selected, message, read)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run("Marie Dupont", "marie.dupont@example.fr", "Achat", "Forêt brumeuse", "50×70 cm — Fine Art",
    "Bonjour Pierre,\n\nJe suis très intéressée par votre photo \"Forêt brumeuse\" en format 50×70 cm.\n\nCordialement,\nMarie", 0);
  console.log("✓ Message de contact de démo créé");
}

console.log("\n🌿 Seed terminé.");
console.log("   Admin : http://localhost:3000/admin");
console.log("   Login : admin / changeme123\n");

db.close();
