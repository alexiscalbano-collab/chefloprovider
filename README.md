# ChefloProvider — Next.js

Migration complète de 3 apps Flutter/Firebase vers une stack web unifiée.

## Stack technique
- **Frontend** : Next.js 14 (App Router) + TypeScript
- **Base de données** : Neon (PostgreSQL serverless, 3GB gratuit)
- **Auth** : NextAuth.js (credentials)
- **Style** : Tailwind CSS
- **Déploiement** : Vercel (recommandé)

## Structure du projet

```
src/
├── app/
│   ├── admin/          → App Admin (CRUD complet)
│   ├── livraison/      → App Livraison (formulaire multi-étapes)
│   ├── achat/          → App Achat (enregistrement achats)
│   ├── api/            → Routes API REST
│   │   ├── clients/
│   │   ├── produits/
│   │   ├── ingredients/
│   │   ├── achats/
│   │   ├── livraisons/
│   │   └── recettes/
│   ├── login/          → Page de connexion
│   └── layout.tsx
├── components/
│   └── admin/          → Composants CRUD admin
├── lib/
│   ├── db.ts           → Connexion Neon
│   └── auth.ts         → Configuration NextAuth
├── types/              → Types TypeScript globaux
└── middleware.ts       → Protection des routes par rôle
```

## Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer la base de données Neon
1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un nouveau projet
3. Copier la connection string
4. Créer `.env.local` depuis `.env.example`
5. Exécuter le schéma SQL :
```bash
# Depuis la console Neon ou psql
psql $DATABASE_URL -f schema.sql
```

### 3. Configurer les variables d'environnement
```bash
cp .env.example .env.local
# Remplir DATABASE_URL et NEXTAUTH_SECRET
```

Générer NEXTAUTH_SECRET :
```bash
openssl rand -base64 32
```

### 4. Créer le premier utilisateur admin
```sql
-- Dans la console Neon
INSERT INTO users (email, password_hash, role, name)
VALUES ('admin@cheflo.fr', '$2b$10$...', 'admin', 'Admin');
```

Pour générer le hash du mot de passe :
```js
const bcrypt = require('bcryptjs')
console.log(await bcrypt.hash('votre-mot-de-passe', 10))
```

### 5. Lancer en développement
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Rôles utilisateurs

| Rôle | Accès | URL |
|------|-------|-----|
| `admin` | Toute l'administration | `/admin` |
| `livreur` | App livraison uniquement | `/livraison` |
| `achat` | App achat uniquement | `/achat` |

## Déploiement Vercel

```bash
npm install -g vercel
vercel --prod
```

Ajouter les variables d'environnement dans le dashboard Vercel.

## Correspondance Flutter → Next.js

| Flutter | Next.js |
|---------|---------|
| Firebase Firestore | Neon PostgreSQL |
| `ClientService` | `GET/POST /api/clients` |
| `ProduitService` | `GET/POST /api/produits` |
| `IncrediantService` | `GET/POST /api/ingredients` |
| `AchatService` | `GET/POST /api/achats` |
| `LivraisonService` | `GET/POST /api/livraisons` |
| `RecetteService` | `GET/POST /api/recettes` |
| App livraison (Flutter) | `/livraison` (Next.js) |
| App achat (Flutter) | `/achat` (Next.js) |
| App admin (Flutter) | `/admin` (Next.js) |
