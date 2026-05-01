# Pierre G. — Portfolio photographique

Portfolio naturaliste full-stack construit avec **Next.js 14 (App Router)**, **SQLite (better-sqlite3)**, **Tailwind CSS**.

---

## Démarrage rapide

### Prérequis

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
cd photo-pierre
npm install
```

### Peupler la base de données (demo)

```bash
npm run seed
```

Cela crée :
- L'utilisateur admin (`admin` / `changeme123`)
- 3 catégories (Paysages, Faune sauvage, Lumières)
- 8 photos avec formats et tarifs
- 1 message de contact de démonstration

### Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## Identifiants par défaut

| Champ | Valeur |
|-------|--------|
| URL admin | `http://localhost:3000/admin` |
| Identifiant | `admin` |
| Mot de passe | `changeme123` |

**Changez le mot de passe immédiatement** via `/admin/settings` → "Changer le mot de passe".

---

## Structure du projet

```
photo-pierre/
├── app/
│   ├── (public)/          # Site public (layout avec navbar/footer)
│   │   ├── page.tsx       # Homepage
│   │   ├── gallery/       # /gallery + /gallery/[slug]
│   │   ├── photo/[slug]/  # Page produit
│   │   ├── about/         # À propos
│   │   └── contact/       # Contact
│   ├── admin/             # Interface d'administration
│   │   ├── login/
│   │   ├── photos/
│   │   ├── categories/
│   │   ├── contacts/
│   │   └── settings/
│   └── api/               # API routes
│       ├── contact/
│       └── admin/
├── components/
│   ├── public/            # Composants publics
│   └── admin/             # Composants admin
├── lib/
│   ├── db.ts              # Connexion SQLite + schéma
│   ├── auth.ts            # JWT session (jose)
│   └── utils.ts           # Helpers (slugify, formatPrice…)
├── scripts/
│   └── seed.ts            # Script de peuplement
├── public/
│   └── uploads/           # Images uploadées
└── data/
    └── pierre.db          # Base SQLite (auto-créée)
```

---

## Gestion du contenu

### Ajouter une photo

1. Aller sur `/admin/photos` → **+ Ajouter**
2. Renseigner titre, galerie, description
3. Uploader l'image (drag & drop) ou coller une URL Picsum
4. Ajouter les formats / prix
5. Cocher **Mise en avant** pour l'afficher sur la homepage
6. **Créer la photo**

### Créer une galerie

1. Aller sur `/admin/categories`
2. Renseigner nom, slug (auto-généré), image de couverture
3. **Créer la galerie**

### Lire les messages de contact

1. Aller sur `/admin/contacts`
2. Cliquer sur un message pour le lire
3. Bouton **Répondre par email** ouvre le client mail avec l'adresse pré-remplie

### Modifier les paramètres du site

`/admin/settings` → modifier le nom, la tagline, le texte de présentation, le lien Instagram, et le mot de passe admin.

---

## Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# Clé secrète JWT (changez en production !)
JWT_SECRET=une-cle-secrete-tres-longue-et-aleatoire

# Chemin de la base de données (optionnel, défaut: ./data/pierre.db)
# DB_PATH=./data/pierre.db
```

---

## Build de production

```bash
npm run build
npm start
```

---

## Déploiement

### Option 1 — Serveur Node.js (recommandée pour SQLite)

SQLite stocke les données dans un fichier local (`data/pierre.db`). Il faut un serveur avec **stockage persistant**.

```bash
# Sur le serveur
npm ci --omit=dev
npm run build
npm run seed   # première fois uniquement
npm start
```

Utiliser **PM2** pour garder le process en vie :

```bash
npm install -g pm2
pm2 start "npm start" --name pierre-portfolio
pm2 save
```

### Option 2 — Vercel (avec limitations)

⚠️ **SQLite n'est pas compatible avec les déploiements serverless Vercel** (le système de fichiers est éphémère). Pour déployer sur Vercel, il faudrait migrer vers une base externe (ex: Turso, PlanetScale, Supabase).

Pour un déploiement Vercel rapide avec SQLite read-only (base commitée) :
- Builder le projet localement avec la base seeded
- Commiter `data/pierre.db` dans le dépôt (en retirant du `.gitignore`)
- Les **écritures** (uploads, contacts) ne persisteront pas entre les déploiements

### Option 3 — Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
RUN npm run seed
EXPOSE 3000
CMD ["npm", "start"]
```

Monter un volume pour `/app/data` et `/app/public/uploads` pour la persistance.

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript |
| Base de données | SQLite via better-sqlite3 |
| Styles | Tailwind CSS |
| Auth | JWT via jose, cookie httpOnly |
| Mots de passe | bcryptjs (cost factor 12) |
| Images | Next.js Image (optimisation auto) |
| Fonts | DM Serif Display + Jost (Google Fonts) |

---

## Notes de design

- **Palette** : `#F7F5F2` (crème), `#1A1A18` (encre), `#7C8C6E` (mousse)
- **Typography** : DM Serif Display (titres) + Jost (corps)
- **Animations** : fade-in au scroll, `prefers-reduced-motion` respecté
- **Images** : ratio 3:2 (paysage) ou 4:5 (portrait), lazy-loading natif

---

*Portfolio créé pour Pierre G. — @pierreg_photography*
