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
    const limit = parseInt(searchParams.get('limit') || '50')

    // Récupérer les livraisons avec leurs produits en une seule requête JOIN
    const rows = clientId
      ? await sql`
          SELECT l.id, l.client_id, l.client_nom, l.date_livraison, l.created_at,
                 lp.id as lp_id, lp.produit_nom, lp.quantity_repris, lp.quantity_rayon, lp.quantity_remis
          FROM livraisons l
          LEFT JOIN livraison_produits lp ON lp.livraison_id = l.id
          WHERE l.client_id = ${clientId}
          ORDER BY l.date_livraison DESC
          LIMIT ${limit * 10}
        `
      : await sql`
          SELECT l.id, l.client_id, l.client_nom, l.date_livraison, l.created_at,
                 lp.id as lp_id, lp.produit_nom, lp.quantity_repris, lp.quantity_rayon, lp.quantity_remis
          FROM livraisons l
          LEFT JOIN livraison_produits lp ON lp.livraison_id = l.id
          ORDER BY l.date_livraison DESC
          LIMIT ${limit * 10}
        `

    // Regrouper les produits par livraison
    const livraisonsMap = new Map<number, Livraison>()
    for (const row of rows as any[]) {
      if (!livraisonsMap.has(row.id)) {
        livraisonsMap.set(row.id, {
          id: row.id,
          client_id: row.client_id,
          client_nom: row.client_nom,
          date_livraison: row.date_livraison,
          created_at: row.created_at,
          produits: [],
        })
      }
      if (row.lp_id) {
        livraisonsMap.get(row.id)!.produits!.push({
          id: row.lp_id,
          livraison_id: row.id,
          produit_nom: row.produit_nom,
          quantity_repris: row.quantity_repris,
          quantity_rayon: row.quantity_rayon,
          quantity_remis: row.quantity_remis,
        })
      }
    }

    const livraisons = Array.from(livraisonsMap.values()).slice(0, limit)
    return NextResponse.json({ data: livraisons, success: true })
  } catch (error) {
    console.error('GET /api/livraisons error:', error)
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = livraisonSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message, success: false }, { status: 400 })

    const { client_id, client_nom, produits } = parsed.data

    const livResult = await sql`
      INSERT INTO livraisons (client_id, client_nom)
      VALUES (${client_id}, ${client_nom})
      RETURNING *
    ` as Livraison[]
    const livraison = livResult[0]

    for (const p of produits) {
      await sql`
        INSERT INTO livraison_produits (livraison_id, produit_nom, quantity_repris, quantity_rayon, quantity_remis)
        VALUES (${livraison.id}, ${p.produit_nom}, ${p.quantity_repris}, ${p.quantity_rayon}, ${p.quantity_remis})
      `
    }

    return NextResponse.json({ data: livraison, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/livraisons error:', error)
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}