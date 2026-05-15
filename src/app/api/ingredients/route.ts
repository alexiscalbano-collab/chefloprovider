// src/app/api/ingredients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Ingredient } from '@/types'

export async function GET() {
  try {
    const ingredients = await sql`SELECT * FROM ingredients ORDER BY nom ASC` as Ingredient[]
    return NextResponse.json({ data: ingredients, success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nom } = await req.json()
    if (!nom) return NextResponse.json({ error: 'Nom requis', success: false }, { status: 400 })

    const existing = await sql`SELECT id FROM ingredients WHERE nom = ${nom} LIMIT 1`
    if (existing.length > 0) return NextResponse.json({ error: 'Ingrédient existant', success: false }, { status: 409 })

    const result = await sql`INSERT INTO ingredients (nom) VALUES (${nom}) RETURNING *` as Ingredient[]
    return NextResponse.json({ data: result[0], success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}
