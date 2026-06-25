import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
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
    const offset = parseInt(searchParams.get('offset') || '0')

    const livraisons = clientId
      ? await sql`
          SELECT l.*, 
            json_agg(
              json_build_object(
                'id', lp.id,
                'produit_nom', lp.produit_nom,
                'quantity_repris', lp.quantity_repris,
                'quantity_rayon', lp.quantity_rayon,
                'quantity_remis', lp.quantity_remis
              )
            ) FILTER (WHERE lp.id IS NOT NULL) as produits
          FROM livraisons l
          LEFT JOIN livraison_produits lp ON lp.livraison_id = l.id
          WHERE l.client_id = ${clientId}
          GROUP BY l.id
          ORDER BY l.date_livraison DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      : await sql`
          SELECT l.*, 
            json_agg(
              json_build_object(
                'id', lp.id,
                'produit_nom', lp.produit_nom,
                'quantity_repris', lp.quantity_repris,
                'quantity_rayon', lp.quantity_rayon,
                'quantity_remis', lp.quantity_remis
              )
            ) FILTER (WHERE lp.id IS NOT NULL) as produits
          FROM livraisons l
          LEFT JOIN livraison_produits lp ON lp.livraison_id = l.id
          GROUP BY l.id
          ORDER BY l.date_livraison DESC
          LIMIT ${limit} OFFSET ${offset}
        `

    return NextResponse.json({ data: livraisons, success: true })
  } catch (e) {
    console.error(e)
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
    `
    const livraison = livResult[0]

    for (const p of produits) {
      await sql`
        INSERT INTO livraison_produits (livraison_id, produit_nom, quantity_repris, quantity_rayon, quantity_remis)
        VALUES (${livraison.id}, ${p.produit_nom}, ${p.quantity_repris}, ${p.quantity_rayon}, ${p.quantity_remis})
      `
    }
    return NextResponse.json({ data: livraison, success: true }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}
