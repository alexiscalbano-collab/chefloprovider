import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Achat } from '@/types'
import { z } from 'zod'

const achatSchema = z.object({
  ingredient_id: z.number().int().positive(),
  ingredient_nom: z.string().min(1),
  quantite: z.number().positive(),
  unite: z.enum(['kg', 'litre', 'gramme']),
  prix: z.number().positive(),
})

export async function GET() {
  try {
    const achats = await sql`
      SELECT a.*, i.nom as ingredient_nom_ref
      FROM achats a
      LEFT JOIN ingredients i ON a.ingredient_id = i.id
      ORDER BY a.created_at DESC
    ` as Achat[]
    return NextResponse.json({ data: achats, success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = achatSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message, success: false }, { status: 400 })

    const { ingredient_id, ingredient_nom, quantite, unite, prix } = parsed.data

    const result = await sql`
      INSERT INTO achats (ingredient_id, ingredient_nom, quantite, unite, prix)
      VALUES (${ingredient_id}, ${ingredient_nom}, ${quantite}, ${unite}, ${prix})
      RETURNING *
    ` as Achat[]

    return NextResponse.json({ data: result[0], success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}
