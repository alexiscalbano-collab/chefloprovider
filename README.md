# ChefloProvider — Next.js

Application web de gestion de livraisons de produits frais (salades, sandwichs) vers des shops partenaires au Cambodge. Migration complète depuis AppSheet / Google Sheets + Flutter / Firebase vers une stack web unifiée.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend + Backend | Next.js 14 (App Router) + TypeScript |
| Base de données | Neon (PostgreSQL serverless, 3 GB gratuit) |
| Authentification | NextAuth.js (credentials + JWT) |
| Style | Tailwind CSS |
| Déploiement | Netlify (Vercel interdit usage commercial sur plan gratuit) |
| Région BDD | AWS Asia Pacific — Singapore (proximité Cambodge) |

## Structure du projet

src/
├── app/
│   ├── admin/               → Dashboard Admin (CRUD complet)
│   ├── manager/             → Dashboard Manager (Livraisons, Achats, Produits)
│   │   └── login/           → Page de connexion Manager
│   ├── livraison/           → App Livraison (formulaire multi-étapes 5 étapes)
│   │   └── planning/        → Planning & historique des livraisons
│   ├── achat/               → App Achat (enregistrement achats ingrédients)
│   ├── login/               → Page de connexion principale
│   ├── api/                 → Routes API REST
│   │   ├── clients/
│   │   │   └── [id]/
│   │   ├── produits/
│   │   │   └── [id]/
│   │   ├── ingredients/
│   │   ├── achats/
│   │   │   └── [id]/
│   │   ├── livraisons/
│   │   │   └── [id]/
│   │   └── recettes/
│   └── layout.tsx
├── components/
│   └── admin/
│       ├── ClientsSection.tsx
│       ├── AchatsSection.tsx
│       ├── LivraisonsSection.tsx
│       ├── ProduitsSection.tsx
│       ├── IngredientsSection.tsx
│       └── RecettesSection.tsx
├── lib/
│   ├── db.ts
│   └── auth.ts
├── types/
│   └── index.ts
└── middleware.ts

## Démarrage rapide

### 1. Cloner et installer
```bash
git clone https://github.com/alexiscalbano-collab/chefloprovider.git
cd chefloprovider
npm install
```

### 2. Configurer les variables d'environnement
```bash
cp .env.example .env.local
```

Remplir `.env.local` :
```env
DATABASE_URL=postgresql://...@...neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=votre-secret
NEXTAUTH_URL=http://localhost:3000
```

Générer `NEXTAUTH_SECRET` :
```bash
openssl rand -base64 32
```

### 3. Lancer en développement
```bash
# Démarrage standard
npm run dev

# Démarrage rapide avec Turbopack (recommandé)
npm run dev -- --turbo
```

## Rôles utilisateurs

| Rôle | Accès | URL |
|------|-------|-----|
| `admin` | Dashboard complet — CRUD sur tout | `/login` → `/admin` |
| `manager` | Livraisons + Achats + Produits | `/manager/login` → `/manager` |
| `livreur` | Formulaire livraison uniquement | `/login` → `/livraison` |
| `achat` | Saisie achats uniquement | `/login` → `/achat` |

### Créer un utilisateur
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('mot-de-passe', 10).then(h => console.log(h))"
```

```sql
INSERT INTO users (email, password_hash, role, name)
VALUES ('email@example.com', '$2a$10$...', 'admin', 'Nom');
```

## Routes API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/clients` | Liste tous les clients |
| POST | `/api/clients` | Crée un client |
| PUT | `/api/clients/[id]` | Modifie un client |
| DELETE | `/api/clients/[id]` | Supprime un client |
| GET | `/api/livraisons?limit=50&offset=0` | Liste les livraisons paginées |
| POST | `/api/livraisons` | Crée une livraison |
| PUT | `/api/livraisons/[id]` | Modifie une livraison |
| DELETE | `/api/livraisons/[id]` | Supprime une livraison |
| GET | `/api/achats` | Liste tous les achats |
| POST | `/api/achats` | Crée un achat |
| PUT | `/api/achats/[id]` | Modifie un achat |
| DELETE | `/api/achats/[id]` | Supprime un achat |
| GET | `/api/produits` | Liste tous les produits |
| POST | `/api/produits` | Crée un produit |
| PUT | `/api/produits/[id]` | Modifie un produit |
| DELETE | `/api/produits/[id]` | Supprime un produit |

## Schéma base de données

- `users` — utilisateurs avec rôles
- `clients` — 87 magasins partenaires au Cambodge
- `produits` — produits livrés
- `ingredients` — ingrédients
- `achats` — achats d'ingrédients
- `livraisons` — livraisons (en_cours, livree, annulee)
- `livraison_produits` — lignes de livraison
- `recettes` — recettes
- `prix_produits` — prix par client et produit

## Déploiement Netlify

```bash
git push origin main
```

Variables d'environnement dans le dashboard Netlify :
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Branches Git

| Branche | Rôle |
|---------|------|
| `main` | Production |
| `feature/redesign-ui` | Développements en cours |
| `develop` | Intégration |

## Correspondance Flutter → Next.js

| Flutter / Firebase | Next.js / PostgreSQL |
|--------------------|---------------------|
| Collection `clients` | Table `clients` + `/api/clients` |
| Collection `produits` | Table `produits` + `/api/produits` |
| Collection `incrediants` | Table `ingredients` (faute corrigée) |
| Collection `achats` | Table `achats` + `/api/achats` |
| Collection `livraisons` | Table `livraisons` + `livraison_produits` |
| Collection `recettes` | Table `recettes` |
| App livraison Flutter | `/livraison` — 5 étapes |
| App achat Flutter | `/achat` |
| App admin Flutter | `/admin` |
| — | `/manager` — nouveau rôle |
| — | `/livraison/planning` — historique |