import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Livraison } from '@/types'
import { z } from 'zod'

const livraisonSchema = z.object({
  client_id: z.number().int().positive(),
  client_nom: z.string().min(1),
  produits: z.array(z.object({
    produit_nom: z.string().min(1),
    quantity_repris: z.number().int().min(0),
    quantity_rayon: z.number().int().min(0),
    quantity_remis: z.number().int().min(0),
  })),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('client_id')

    const livraisons = clientId
      ? await sql`SELECT * FROM livraisons WHERE client_id = ${clientId} ORDER BY date_livraison DESC` as Livraison[]
      : await sql`SELECT * FROM livraisons ORDER BY date_livraison DESC` as Livraison[]

    // Récupérer les produits pour chaque livraison
    for (const liv of livraisons) {
      liv.produits = await sql`
        SELECT * FROM livraison_produits WHERE livraison_id = ${liv.id}
      ` as any[]
    }

    return NextResponse.json({ data: livraisons, success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = livraisonSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message, success: false }, { status: 400 })

    const { client_id, client_nom, produits } = parsed.data

    // Créer la livraison
    const livResult = await sql`
      INSERT INTO livraisons (client_id, client_nom)
      VALUES (${client_id}, ${client_nom})
      RETURNING *
    ` as Livraison[]
    const livraison = livResult[0]

    // Insérer les lignes produits
    for (const p of produits) {
      await sql`
        INSERT INTO livraison_produits (livraison_id, produit_nom, quantity_repris, quantity_rayon, quantity_remis)
        VALUES (${livraison.id}, ${p.produit_nom}, ${p.quantity_repris}, ${p.quantity_rayon}, ${p.quantity_remis})
      `
    }

    return NextResponse.json({ data: livraison, success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}
