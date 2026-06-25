import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { z } from 'zod'

const achatSchema = z.object({
  ingredient_id: z.number().int().positive().optional(),
  ingredient_nom: z.string().min(1).optional(),
  quantite: z.number().positive().optional(),
  unite: z.enum(['kg', 'litre', 'gramme']).optional(),
  prix: z.number().positive().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`SELECT * FROM achats WHERE id = ${params.id}`
    if (!result.length) return NextResponse.json({ error: 'Achat non trouvé', success: false }, { status: 404 })
    return NextResponse.json({ data: result[0], success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const parsed = achatSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message, success: false }, { status: 400 })

    const { ingredient_id, ingredient_nom, quantite, unite, prix } = parsed.data

    const result = await sql`
      UPDATE achats SET
        ingredient_id  = COALESCE(${ingredient_id ?? null}, ingredient_id),
        ingredient_nom = COALESCE(${ingredient_nom ?? null}, ingredient_nom),
        quantite       = COALESCE(${quantite ?? null}, quantite),
        unite          = COALESCE(${unite ?? null}::text, unite::text)::varchar,
        prix           = COALESCE(${prix ?? null}, prix)
      WHERE id = ${params.id}
      RETURNING *
    `
    if (!result.length) return NextResponse.json({ error: 'Achat non trouvé', success: false }, { status: 404 })
    return NextResponse.json({ data: result[0], success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`DELETE FROM achats WHERE id = ${params.id} RETURNING id`
    if (!result.length) return NextResponse.json({ error: 'Achat non trouvé', success: false }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}