// src/app/api/produits/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Produit } from '@/types'

export async function GET() {
  try {
    const produits = await sql`SELECT * FROM produits ORDER BY nom ASC` as Produit[]
    return NextResponse.json({ data: produits, success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nom } = await req.json()
    if (!nom) return NextResponse.json({ error: 'Nom requis', success: false }, { status: 400 })

    const existing = await sql`SELECT id FROM produits WHERE nom = ${nom} LIMIT 1`
    if (existing.length > 0) return NextResponse.json({ error: 'Produit existant', success: false }, { status: 409 })

    const result = await sql`INSERT INTO produits (nom) VALUES (${nom}) RETURNING *` as Produit[]
    return NextResponse.json({ data: result[0], success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}
