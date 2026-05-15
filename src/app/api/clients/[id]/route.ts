import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { Client } from '@/types'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`SELECT * FROM clients WHERE id = ${params.id}` as Client[]
    if (!result[0]) return NextResponse.json({ error: 'Client introuvable', success: false }, { status: 404 })
    return NextResponse.json({ data: result[0], success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, adress, phone_number } = await req.json()
    const result = await sql`
      UPDATE clients SET name = ${name}, adress = ${adress}, phone_number = ${phone_number ?? null}
      WHERE id = ${params.id} RETURNING *
    ` as Client[]
    if (!result[0]) return NextResponse.json({ error: 'Client introuvable', success: false }, { status: 404 })
    return NextResponse.json({ data: result[0], success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM clients WHERE id = ${params.id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}
