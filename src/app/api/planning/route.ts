import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/planning?jour=1  (1=lundi ... 7=dimanche)
// GET /api/planning?date=2026-06-25  (retourne les shops du jour de la semaine correspondant)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const jourParam = searchParams.get('jour')

    let jour: number

    if (date) {
      // Calculer le jour de la semaine depuis la date (1=lundi, 7=dimanche)
      const d = new Date(date)
      jour = d.getDay() === 0 ? 7 : d.getDay()
    } else if (jourParam) {
      jour = parseInt(jourParam)
    } else {
      // Par défaut : aujourd'hui
      const today = new Date()
      jour = today.getDay() === 0 ? 7 : today.getDay()
    }

    const planning = await sql`
      SELECT 
        p.id as planning_id,
        p.ordre,
        p.jour,
        c.id as client_id,
        c.name as client_nom,
        c.store_number,
        json_agg(
          json_build_object(
            'produit_nom', pp.produit_nom,
            'quantite', pp.quantite
          ) ORDER BY pp.produit_nom
        ) FILTER (WHERE pp.id IS NOT NULL) as produits
      FROM planning p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN planning_produits pp ON pp.planning_id = p.id
      WHERE p.jour = ${jour}
      GROUP BY p.id, p.ordre, p.jour, c.id, c.name, c.store_number
      ORDER BY p.ordre ASC, c.name ASC
    `

    return NextResponse.json({ data: planning, jour, success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { client_id, jour, ordre, produits } = body

    if (!client_id || !jour) {
      return NextResponse.json({ error: 'client_id et jour sont obligatoires', success: false }, { status: 400 })
    }

    // Créer ou mettre à jour l'entrée planning
    const result = await sql`
      INSERT INTO planning (client_id, jour, ordre)
      VALUES (${client_id}, ${jour}, ${ordre || 0})
      ON CONFLICT (client_id, jour) DO UPDATE SET ordre = ${ordre || 0}
      RETURNING id
    `
    const planningId = result[0].id

    // Mettre à jour les produits si fournis
    if (produits && produits.length > 0) {
      await sql`DELETE FROM planning_produits WHERE planning_id = ${planningId}`
      for (const p of produits) {
        await sql`
          INSERT INTO planning_produits (planning_id, produit_nom, quantite)
          VALUES (${planningId}, ${p.produit_nom}, ${p.quantite})
        `
      }
    }

    return NextResponse.json({ data: { planning_id: planningId }, success: true }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const planningId = searchParams.get('id')
    if (!planningId) return NextResponse.json({ error: 'id obligatoire', success: false }, { status: 400 })
    await sql`DELETE FROM planning WHERE id = ${planningId}`
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}