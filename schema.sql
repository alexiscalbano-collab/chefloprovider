-- ============================================================
-- CHEFLOPROVIDER — Schéma base de données Neon (PostgreSQL)
-- Conversion Firebase Firestore → PostgreSQL relationnel
-- ============================================================

-- CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  adress      VARCHAR(500) NOT NULL UNIQUE,
  phone_number VARCHAR(20),
  pay_time    VARCHAR(100),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- PRODUITS
CREATE TABLE IF NOT EXISTS produits (
  id         SERIAL PRIMARY KEY,
  nom        VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PRIX PRODUITS (prix par client et par produit)
CREATE TABLE IF NOT EXISTS prix_produits (
  id          SERIAL PRIMARY KEY,
  client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  produit_id  INTEGER NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  prix        NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (client_id, produit_id)
);

-- INGREDIENTS
CREATE TABLE IF NOT EXISTS ingredients (
  id         SERIAL PRIMARY KEY,
  nom        VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RECETTES
CREATE TABLE IF NOT EXISTS recettes (
  id         SERIAL PRIMARY KEY,
  nom        VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RECETTES <-> INGREDIENTS (relation many-to-many)
CREATE TABLE IF NOT EXISTS recette_ingredients (
  recette_id    INTEGER NOT NULL REFERENCES recettes(id) ON DELETE CASCADE,
  ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  PRIMARY KEY (recette_id, ingredient_id)
);

-- ACHATS
CREATE TABLE IF NOT EXISTS achats (
  id             SERIAL PRIMARY KEY,
  ingredient_id  INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  ingredient_nom VARCHAR(255) NOT NULL,
  quantite       NUMERIC(10,3) NOT NULL,
  unite          VARCHAR(20) NOT NULL CHECK (unite IN ('kg', 'litre', 'gramme')),
  prix           NUMERIC(10,2) NOT NULL,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- LIVRAISONS
CREATE TABLE IF NOT EXISTS livraisons (
  id           SERIAL PRIMARY KEY,
  client_id    INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_nom   VARCHAR(255) NOT NULL,
  date_livraison TIMESTAMP DEFAULT NOW(),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- LIGNES DE LIVRAISON (produits par livraison)
CREATE TABLE IF NOT EXISTS livraison_produits (
  id              SERIAL PRIMARY KEY,
  livraison_id    INTEGER NOT NULL REFERENCES livraisons(id) ON DELETE CASCADE,
  produit_nom     VARCHAR(255) NOT NULL,
  quantity_repris INTEGER NOT NULL DEFAULT 0,
  quantity_rayon  INTEGER NOT NULL DEFAULT 0,
  quantity_remis  INTEGER NOT NULL DEFAULT 0
);

-- USERS (NextAuth)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role          VARCHAR(50) NOT NULL DEFAULT 'livreur' CHECK (role IN ('admin', 'livreur', 'achat')),
  name          VARCHAR(255),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_livraisons_client ON livraisons(client_id);
CREATE INDEX IF NOT EXISTS idx_achats_ingredient ON achats(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_prix_client ON prix_produits(client_id);
CREATE INDEX IF NOT EXISTS idx_prix_produit ON prix_produits(produit_id);
