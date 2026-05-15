// ============================================================
// TYPES TYPESCRIPT — chefloprovider
// ============================================================

export interface Client {
  id: number
  name: string
  adress: string
  phone_number?: string
  pay_time?: string
  created_at?: string
}

export interface Produit {
  id: number
  nom: string
  created_at?: string
}

export interface PrixProduit {
  id: number
  client_id: number
  produit_id: number
  prix: number
  client_nom?: string
  produit_nom?: string
}

export interface Ingredient {
  id: number
  nom: string
  created_at?: string
}

export interface Recette {
  id: number
  nom: string
  ingredients?: Ingredient[]
  created_at?: string
}

export interface Achat {
  id: number
  ingredient_id: number
  ingredient_nom: string
  quantite: number
  unite: 'kg' | 'litre' | 'gramme'
  prix: number
  created_at?: string
}

export interface Livraison {
  id: number
  client_id: number
  client_nom: string
  date_livraison: string
  produits?: LivraisonProduit[]
  created_at?: string
}

export interface LivraisonProduit {
  id: number
  livraison_id: number
  produit_nom: string
  quantity_repris: number
  quantity_rayon: number
  quantity_remis: number
}

export interface User {
  id: number
  email: string
  role: 'admin' | 'livreur' | 'achat'
  name?: string
}

// Formulaire livraison (step-by-step)
export interface LivraisonFormData {
  client_nom: string
  produits: {
    nom: string
    quantity_repris: number
    quantity_rayon: number
    quantity_remis: number
  }[]
}

// API Response générique
export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}
