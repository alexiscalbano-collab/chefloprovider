import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { z } from 'zod'

const livraisonUpdateSchema = z.object({
  client_id:      z.number().int().positive().optional(),
  client_nom:     z.string().min(1).optional(),
  statut:         z.enum(['en_cours', 'livree', 'annulee']).optional(),
  date_livraison: z.string().optional(),
  produits: z.array(z.object({
    id:              z.number().int().optional(),
    produit_nom:     z.string().min(1),
    quantity_repris: z.number().int().min(0),
    quantity_rayon:  z.number().int().min(0),
    quantity_remis:  z.number().int().min(0),
  })).optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`SELECT * FROM livraisons WHERE id = ${params.id}`
    if (!result.length) return NextResponse.json({ error: 'Livraison non trouvée', success: false }, { status: 404 })
    const livraison = result[0]
    livraison.produits = await sql`SELECT * FROM livraison_produits WHERE livraison_id = ${params.id}`
    return NextResponse.json({ data: livraison, success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const parsed = livraisonUpdateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message, success: false }, { status: 400 })

    const { client_id, client_nom, statut, date_livraison, produits } = parsed.data

    // Mise à jour de la livraison
    const result = await sql`
      UPDATE livraisons SET
        client_id      = COALESCE(${client_id ?? null}, client_id),
        client_nom     = COALESCE(${client_nom ?? null}, client_nom),
        statut         = COALESCE(${statut ?? null}, statut),
        date_livraison = COALESCE(${date_livraison ?? null}::timestamptz, date_livraison)
      WHERE id = ${params.id}
      RETURNING *
    `
    if (!result.length) return NextResponse.json({ error: 'Livraison non trouvée', success: false }, { status: 404 })

    // Mise à jour des produits si fournis
    if (produits && produits.length > 0) {
      await sql`DELETE FROM livraison_produits WHERE livraison_id = ${params.id}`
      for (const p of produits) {
        await sql`
          INSERT INTO livraison_produits (livraison_id, produit_nom, quantity_repris, quantity_rayon, quantity_remis)
          VALUES (${params.id}, ${p.produit_nom}, ${p.quantity_repris}, ${p.quantity_rayon}, ${p.quantity_remis})
        `
      }
    }

    return NextResponse.json({ data: result[0], success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Supprimer d'abord les produits liés
    await sql`DELETE FROM livraison_produits WHERE livraison_id = ${params.id}`
    const result = await sql`DELETE FROM livraisons WHERE id = ${params.id} RETURNING id`
    if (!result.length) return NextResponse.json({ error: 'Livraison non trouvée', success: false }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}