import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // ── CA total (livraisons livrées) ────────────────────────
    const caTotalResult = await sql`
      SELECT COALESCE(SUM(total), 0) as ca_total
      FROM livraisons
      WHERE statut = 'livree'
    `
    const ca_total = Number(caTotalResult[0]?.ca_total || 0)

    // ── Coût achats total ─────────────────────────────────────
    const coutAchatsResult = await sql`
      SELECT COALESCE(SUM(prix * quantite), 0) as cout_total
      FROM achats
    `
    const cout_achats = Number(coutAchatsResult[0]?.cout_total || 0)

    // ── Marge brute ────────────────────────────────────────────
    const marge_brute = ca_total - cout_achats
    const ratio_marge = ca_total > 0 ? (marge_brute / ca_total) * 100 : 0

    // ── CA par client (top 10) ───────────────────────────────
    const caParClient = await sql`
      SELECT client_nom, COALESCE(SUM(total), 0) as ca
      FROM livraisons
      WHERE statut = 'livree'
      GROUP BY client_nom
      ORDER BY ca DESC
      LIMIT 10
    `

    // ── CA par mois ────────────────────────────────────────────
    const caParMois = await sql`
      SELECT 
        TO_CHAR(date_trunc('month', date_livraison), 'YYYY-MM') as mois,
        COALESCE(SUM(total), 0) as ca,
        COUNT(*) as nb_livraisons
      FROM livraisons
      WHERE statut = 'livree'
      GROUP BY date_trunc('month', date_livraison)
      ORDER BY date_trunc('month', date_livraison)
    `

    // ── Nombre de livraisons par mois (tous statuts) ─────────
    const livraisonsParMois = await sql`
      SELECT 
        TO_CHAR(date_trunc('month', date_livraison), 'YYYY-MM') as mois,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut = 'livree') as livrees,
        COUNT(*) FILTER (WHERE statut = 'en_cours') as en_cours,
        COUNT(*) FILTER (WHERE statut = 'annulee') as annulees
      FROM livraisons
      GROUP BY date_trunc('month', date_livraison)
      ORDER BY date_trunc('month', date_livraison)
    `

    // ── Top produits les plus livrés ─────────────────────────
    const topProduits = await sql`
      SELECT 
        lp.produit_nom,
        SUM(lp.quantity_remis - lp.quantity_repris) as quantite_nette,
        SUM((lp.quantity_remis - lp.quantity_repris) * COALESCE(lp.prix_unitaire, 0)) as ca
      FROM livraison_produits lp
      JOIN livraisons l ON l.id = lp.livraison_id
      WHERE l.statut = 'livree'
      GROUP BY lp.produit_nom
      ORDER BY quantite_nette DESC
      LIMIT 10
    `

    // ── CA par produit (top 10) ───────────────────────────────
    const caParProduit = await sql`
      SELECT 
        lp.produit_nom,
        SUM((lp.quantity_remis - lp.quantity_repris) * COALESCE(lp.prix_unitaire, 0)) as ca
      FROM livraison_produits lp
      JOIN livraisons l ON l.id = lp.livraison_id
      WHERE l.statut = 'livree'
      GROUP BY lp.produit_nom
      ORDER BY ca DESC
      LIMIT 10
    `

    // ── Compteurs globaux ──────────────────────────────────────
    const compteurs = await sql`
      SELECT
        (SELECT COUNT(*) FROM livraisons) as nb_livraisons,
        (SELECT COUNT(*) FROM livraisons WHERE statut = 'livree') as nb_livrees,
        (SELECT COUNT(*) FROM livraisons WHERE statut = 'en_cours') as nb_en_cours,
        (SELECT COUNT(*) FROM livraisons WHERE statut = 'annulee') as nb_annulees,
        (SELECT COUNT(*) FROM clients) as nb_clients,
        (SELECT COUNT(*) FROM produits) as nb_produits,
        (SELECT COUNT(*) FROM achats) as nb_achats
    `

    return NextResponse.json({
      data: {
        ca_total,
        cout_achats,
        marge_brute,
        ratio_marge,
        ca_par_client: caParClient,
        ca_par_mois: caParMois,
        livraisons_par_mois: livraisonsParMois,
        top_produits: topProduits,
        ca_par_produit: caParProduit,
        compteurs: compteurs[0],
      },
      success: true,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur', success: false }, { status: 500 })
  }
}