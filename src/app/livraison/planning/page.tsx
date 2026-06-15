'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface LigneLivraison {
  id?: number
  produit_nom: string
  quantity_repris: number
  quantity_rayon: number
  quantity_remis: number
  prix_unitaire?: number
}

interface Livraison {
  id: number
  client_nom: string
  date_livraison: string
  statut?: 'en_cours' | 'livree' | 'annulee'
  total?: number
  produits?: LigneLivraison[]
}

interface GroupedLivraisons {
  [date: string]: Livraison[]
}

const STATUT_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  en_cours: { label: 'En cours', bg: 'rgba(202,138,4,0.1)',  color: '#ca8a04', dot: '#facc15' },
  livree:   { label: 'Livrée',   bg: 'rgba(34,197,94,0.1)',  color: '#16a34a', dot: '#4ade80' },
  annulee:  { label: 'Annulée',  bg: 'rgba(239,68,68,0.1)',  color: '#dc2626', dot: '#f87171' },
}

function formatDateFull(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}
function groupByDate(livraisons: Livraison[]): GroupedLivraisons {
  return livraisons.reduce((acc, liv) => {
    const key = new Date(liv.date_livraison).toISOString().split('T')[0]
    if (!acc[key]) acc[key] = []
    acc[key].push(liv)
    return acc
  }, {} as GroupedLivraisons)
}

export default function PlanningPage() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState<'tout' | 'aujourd_hui' | 'semaine' | 'mois'>('tout')
  const [filtreStatut, setFiltreStatut] = useState<'tous' | 'en_cours' | 'livree' | 'annulee'>('tous')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/livraisons?limit=200')
      .then(r => r.json())
      .then(j => { setLivraisons(j.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = livraisons.filter(liv => {
    const date = new Date(liv.date_livraison)
    const now = new Date()

    if (filtre === 'aujourd_hui') {
      if (date.toDateString() !== now.toDateString()) return false
    } else if (filtre === 'semaine') {
      const debut = new Date(now); debut.setDate(now.getDate() - now.getDay() + 1); debut.setHours(0,0,0,0)
      const fin = new Date(debut); fin.setDate(debut.getDate() + 6); fin.setHours(23,59,59,999)
      if (date < debut || date > fin) return false
    } else if (filtre === 'mois') {
      if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false
    }

    if (filtreStatut !== 'tous' && (liv.statut || 'en_cours') !== filtreStatut) return false
    if (search && !liv.client_nom.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const grouped = groupByDate(filtered)
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const total = filtered.length
  const livrees = filtered.filter(l => l.statut === 'livree').length
  const enCours = filtered.filter(l => (l.statut || 'en_cours') === 'en_cours').length
  const ca = filtered.filter(l => l.statut === 'livree').reduce((s, l) => s + Number(l.total || 0), 0)

  return (
    <div className="pl-page">
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'DM Sans', sans-serif; background: #f4f3f0; }

        .pl-page { min-height: 100vh; background: #f4f3f0; }

        .pl-header { background: #0a0f1e; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
        .pl-brand { display: flex; align-items: center; gap: 12px; }
        .pl-logo { width: 36px; height: 36px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-family: 'DM Serif Display', serif; font-size: 16px; box-shadow: 0 4px 16px rgba(59,130,246,0.3); flex-shrink: 0; }
        .pl-brand-name { font-family: 'DM Serif Display', serif; font-size: 18px; color: #fff; }
        .pl-back { padding: 8px 14px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; transition: all 0.15s; }
        .pl-back:hover { background: rgba(255,255,255,0.15); color: #fff; }

        .pl-container { max-width: 920px; margin: 0 auto; padding: 40px 24px; }

        .pl-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: #0a0f1e; letter-spacing: -0.5px; margin-bottom: 4px; }
        .pl-subtitle { font-size: 14px; color: #9ca3af; margin-bottom: 32px; }

        .pl-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
        .pl-stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px; }
        .pl-stat-label { font-size: 12px; color: #9ca3af; margin-bottom: 6px; }
        .pl-stat-value { font-family: 'DM Serif Display', serif; font-size: 26px; color: #0a0f1e; }
        .pl-stat-value.green { color: #16a34a; }
        .pl-stat-value.amber { color: #ca8a04; }
        .pl-stat-sub { font-size: 11px; color: #c4c4c4; margin-top: 2px; }

        .pl-filters { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px; margin-bottom: 24px; }
        .pl-search { width: 100%; padding: 11px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; margin-bottom: 14px; transition: border-color 0.15s; background: #faf9f7; }
        .pl-search:focus { border-color: #93c5fd; background: #fff; }
        .pl-filter-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
        .pl-filter-row:last-child { margin-bottom: 0; }
        .pl-chip { padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; border: none; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; background: #f4f3f0; color: #6b7280; }
        .pl-chip:hover { background: #e5e7eb; }
        .pl-chip.active { background: #0a0f1e; color: #fff; }

        .pl-day { margin-bottom: 28px; }
        .pl-day-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 0 4px; }
        .pl-day-title { display: flex; align-items: center; gap: 10px; }
        .pl-day-dot { width: 6px; height: 6px; border-radius: 50%; background: #0a0f1e; }
        .pl-day-name { font-family: 'DM Serif Display', serif; font-size: 17px; color: #0a0f1e; text-transform: capitalize; }
        .pl-day-count { font-size: 11px; background: #f4f3f0; color: #9ca3af; padding: 3px 9px; border-radius: 20px; font-weight: 500; }
        .pl-day-total { font-size: 14px; font-weight: 600; color: #16a34a; }

        .pl-cards { display: flex; flex-direction: column; gap: 8px; }
        .pl-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; transition: border-color 0.15s; }
        .pl-card:hover { border-color: #d1d5db; }
        .pl-card-row { width: 100%; padding: 14px 18px; display: flex; align-items: center; gap: 14px; background: none; border: none; cursor: pointer; text-align: left; font-family: 'DM Sans', sans-serif; }
        .pl-avatar { width: 36px; height: 36px; border-radius: 10px; background: #0a0f1e; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
        .pl-card-info { flex: 1; min-width: 0; }
        .pl-card-client { font-size: 14px; font-weight: 600; color: #0a0f1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pl-card-date { font-size: 12px; color: #b0b0b0; margin-top: 2px; }
        .pl-badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap; display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
        .pl-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
        .pl-card-total { font-size: 14px; font-weight: 700; color: #16a34a; flex-shrink: 0; }
        .pl-chevron { color: #c4c4c4; flex-shrink: 0; transition: transform 0.15s; font-size: 12px; }
        .pl-chevron.open { transform: rotate(180deg); }

        .pl-detail { border-top: 1px solid #f4f3f0; padding: 16px 18px; background: #faf9f7; }
        .pl-detail-label { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .pl-line { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; }
        .pl-line:last-child { margin-bottom: 0; }
        .pl-line-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .pl-line-name { font-size: 13px; font-weight: 600; color: #0a0f1e; }
        .pl-line-total { font-size: 13px; font-weight: 700; color: #16a34a; }
        .pl-line-meta { display: flex; gap: 14px; font-size: 11px; color: #9ca3af; flex-wrap: wrap; }

        .pl-empty { text-align: center; padding: 80px 20px; color: #9ca3af; }
        .pl-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .pl-empty-title { font-size: 15px; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
        .pl-empty-sub { font-size: 13px; }

        .pl-spinner { width: 28px; height: 28px; border: 3px solid #e5e7eb; border-top-color: #0a0f1e; border-radius: 50%; animation: pl-spin 0.8s linear infinite; margin: 0 auto 16px; }
        @keyframes pl-spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .pl-stats { grid-template-columns: repeat(2, 1fr); }
          .pl-container { padding: 24px 16px; }
        }
      `}</style>

      {/* Header */}
      <header className="pl-header">
        <div className="pl-brand">
          <div className="pl-logo">C</div>
          <span className="pl-brand-name">ChefloProvider</span>
        </div>
        <Link href="/livraison" className="pl-back">← Nouvelle livraison</Link>
      </header>

      <div className="pl-container">
        <h1 className="pl-title">Planning des livraisons</h1>
        <p className="pl-subtitle">Historique complet de toutes les livraisons</p>

        {/* Stats */}
        <div className="pl-stats">
          <div className="pl-stat-card">
            <div className="pl-stat-label">Total</div>
            <div className="pl-stat-value">{total}</div>
            <div className="pl-stat-sub">livraisons</div>
          </div>
          <div className="pl-stat-card">
            <div className="pl-stat-label">Livrées</div>
            <div className="pl-stat-value green">{livrees}</div>
            <div className="pl-stat-sub">terminées</div>
          </div>
          <div className="pl-stat-card">
            <div className="pl-stat-label">En cours</div>
            <div className="pl-stat-value amber">{enCours}</div>
            <div className="pl-stat-sub">en attente</div>
          </div>
          <div className="pl-stat-card">
            <div className="pl-stat-label">CA total</div>
            <div className="pl-stat-value green">${ca.toFixed(2)}</div>
            <div className="pl-stat-sub">livrées</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="pl-filters">
          <input
            type="text"
            className="pl-search"
            placeholder="Rechercher un magasin..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="pl-filter-row">
            {[
              { key: 'tout', label: 'Tout' },
              { key: 'aujourd_hui', label: "Aujourd'hui" },
              { key: 'semaine', label: 'Cette semaine' },
              { key: 'mois', label: 'Ce mois' },
            ].map(f => (
              <button key={f.key} className={`pl-chip ${filtre === f.key ? 'active' : ''}`} onClick={() => setFiltre(f.key as typeof filtre)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="pl-filter-row">
            {[
              { key: 'tous', label: 'Tous les statuts' },
              { key: 'en_cours', label: 'En cours' },
              { key: 'livree', label: 'Livrées' },
              { key: 'annulee', label: 'Annulées' },
            ].map(f => (
              <button key={f.key} className={`pl-chip ${filtreStatut === f.key ? 'active' : ''}`} onClick={() => setFiltreStatut(f.key as typeof filtreStatut)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="pl-empty">
            <div className="pl-spinner" />
            Chargement...
          </div>
        ) : dates.length === 0 ? (
          <div className="pl-empty">
            <div className="pl-empty-icon">📭</div>
            <div className="pl-empty-title">Aucune livraison trouvée</div>
            <div className="pl-empty-sub">Essaie un autre filtre</div>
          </div>
        ) : (
          dates.map(date => {
            const livsJour = grouped[date]
            const totalJour = livsJour.filter(l => l.statut === 'livree').reduce((s, l) => s + Number(l.total || 0), 0)

            return (
              <div className="pl-day" key={date}>
                <div className="pl-day-header">
                  <div className="pl-day-title">
                    <span className="pl-day-dot" />
                    <span className="pl-day-name">{formatDateFull(date)}</span>
                    <span className="pl-day-count">{livsJour.length} livraison{livsJour.length > 1 ? 's' : ''}</span>
                  </div>
                  {totalJour > 0 && <span className="pl-day-total">${totalJour.toFixed(2)}</span>}
                </div>

                <div className="pl-cards">
                  {livsJour.map(liv => {
                    const cfg = STATUT_CONFIG[liv.statut || 'en_cours']
                    const isOpen = expanded === liv.id
                    return (
                      <div className="pl-card" key={liv.id}>
                        <button className="pl-card-row" onClick={() => setExpanded(isOpen ? null : liv.id)}>
                          <div className="pl-avatar">{liv.client_nom?.charAt(0)}</div>
                          <div className="pl-card-info">
                            <div className="pl-card-client">{liv.client_nom}</div>
                            <div className="pl-card-date">{formatDateShort(liv.date_livraison)}</div>
                          </div>
                          <span className="pl-badge" style={{ background: cfg.bg, color: cfg.color }}>
                            <span className="pl-badge-dot" style={{ background: cfg.dot }} />
                            {cfg.label}
                          </span>
                          {!!liv.total && <span className="pl-card-total">${Number(liv.total).toFixed(2)}</span>}
                          <span className={`pl-chevron ${isOpen ? 'open' : ''}`}>▾</span>
                        </button>

                        {isOpen && (
                          <div className="pl-detail">
                            {liv.produits && liv.produits.length > 0 ? (
                              <>
                                <div className="pl-detail-label">Détail des produits</div>
                                {liv.produits.map((p, i) => (
                                  <div className="pl-line" key={i}>
                                    <div className="pl-line-top">
                                      <span className="pl-line-name">{p.produit_nom}</span>
                                      {!!p.prix_unitaire && (
                                        <span className="pl-line-total">
                                          ${((p.quantity_remis - p.quantity_repris) * p.prix_unitaire).toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="pl-line-meta">
                                      <span>↩ Repris : {p.quantity_repris}</span>
                                      <span>📦 Rayon : {p.quantity_rayon}</span>
                                      <span>✅ Remis : {p.quantity_remis}</span>
                                    </div>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <p style={{ fontSize: '13px', color: '#9ca3af' }}>Aucun détail de produit disponible</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}