import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const recettes = await sql`SELECT * FROM recettes ORDER BY nom ASC`
    return NextResponse.json({ data: recettes, success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nom, ingredient_ids } = await req.json()
    if (!nom) return NextResponse.json({ error: 'Nom requis', success: false }, { status: 400 })

    const result = await sql`INSERT INTO recettes (nom) VALUES (${nom}) RETURNING *`
    const recette = result[0]

    if (ingredient_ids?.length > 0) {
      for (const id of ingredient_ids) {
        await sql`INSERT INTO recette_ingredients (recette_id, ingredient_id) VALUES (${recette.id}, ${id})`
      }
    }

    return NextResponse.json({ data: recette, success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}
