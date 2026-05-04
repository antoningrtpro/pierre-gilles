import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "pierre.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initializeSchema(_db);
  return _db;
}

function initializeSchema(db: Database.Database) {
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

    CREATE TABLE IF NOT EXISTS photo_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      position INTEGER DEFAULT 0
    );
  `);

  // Seed default settings if not present
  const settingsCount = (
    db.prepare("SELECT COUNT(*) as c FROM settings").get() as { c: number }
  ).c;
  if (settingsCount === 0) {
    const insertSetting = db.prepare(
      "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
    );
    const seedSettings = db.transaction(() => {
      insertSetting.run("photographer_name", "Pierre G.");
      insertSetting.run(
        "tagline",
        "La nature dans ses instants les plus silencieux."
      );
      insertSetting.run(
        "about_text",
        "Photographe naturaliste basé en France, Pierre G. parcourt les paysages sauvages à la recherche de la lumière fugace, du silence habité et des beautés discrètes du monde vivant."
      );
      insertSetting.run("instagram_url", "https://instagram.com/pierreg_photography");
    });
    seedSettings();
  }
}

// ─── Typed query helpers ────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  cover_image: string | null;
  position: number;
  created_at: string;
  photo_count?: number;
}

export interface Photo {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category_id: number | null;
  filename: string;
  featured: number;
  position: number;
  created_at: string;
  category_name?: string;
  category_slug?: string;
  min_price?: number;
}

export interface Format {
  id: number;
  photo_id: number;
  label: string;
  price: number;
}

export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  subject: string;
  photo_title: string | null;
  format_selected: string | null;
  message: string;
  read: number;
  created_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
}

export interface PhotoImage {
  id: number;
  photo_id: number;
  filename: string;
  position: number;
}

export interface Settings {
  [key: string]: string;
}
