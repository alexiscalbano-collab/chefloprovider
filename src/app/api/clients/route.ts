import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Client } from '@/types'
import { z } from 'zod'

const clientSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  adress: z.string().min(1, 'Adresse requise'),
  phone_number: z.string().optional(),
  pay_time: z.string().optional(),
})

export async function GET() {
  try {
    const clients = await sql`
      SELECT * FROM clients ORDER BY name ASC
    ` as Client[]
    return NextResponse.json({ data: clients, success: true })
  } catch (error) {
    console.error('GET /api/clients error:', error)
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = clientSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message, success: false }, { status: 400 })
    }

    const { name, adress, phone_number, pay_time } = parsed.data

    // Vérification doublon (même logique que Flutter)
    const existing = await sql`
      SELECT id FROM clients WHERE name = ${name} OR adress = ${adress} LIMIT 1
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Un client avec ce nom ou cette adresse existe déjà', success: false }, { status: 409 })
    }

    const result = await sql`
      INSERT INTO clients (name, adress, phone_number, pay_time)
      VALUES (${name}, ${adress}, ${phone_number ?? null}, ${pay_time ?? null})
      RETURNING *
    ` as Client[]

    return NextResponse.json({ data: result[0], success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/clients error:', error)
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}
