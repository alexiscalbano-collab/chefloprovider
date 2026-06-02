'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface LigneLivraison {
  produit: string
  quantite_reprise: number
  quantite_rayon: number
  quantite_remise: number
  prix_unitaire: number
}

interface Livraison {
  id: string
  client: string
  date: string
  statut: 'en_cours' | 'livree' | 'annulee'
  total: number
  notes?: string
  lignes?: LigneLivraison[]
}

interface GroupedLivraisons {
  [date: string]: Livraison[]
}

const STATUT_CONFIG = {
  en_cours: { label: 'En cours', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  livree:   { label: 'Livrée',   color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400' },
  annulee:  { label: 'Annulée',  color: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-400'   },
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatHeure(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function groupByDate(livraisons: Livraison[]): GroupedLivraisons {
  return livraisons.reduce((acc, liv) => {
    const key = new Date(liv.date).toISOString().split('T')[0]
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
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/livraisons')
      .then(r => r.json())
      .then(j => {
        setLivraisons(j.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Filtrage par période
  const filtered = livraisons.filter(liv => {
    const date = new Date(liv.date)
    const now = new Date()

    if (filtre === 'aujourd_hui') {
      if (date.toDateString() !== now.toDateString()) return false
    } else if (filtre === 'semaine') {
      const debut = new Date(now)
      debut.setDate(now.getDate() - now.getDay() + 1)
      debut.setHours(0,0,0,0)
      const fin = new Date(debut)
      fin.setDate(debut.getDate() + 6)
      fin.setHours(23,59,59,999)
      if (date < debut || date > fin) return false
    } else if (filtre === 'mois') {
      if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false
    }

    if (filtreStatut !== 'tous' && liv.statut !== filtreStatut) return false
    if (search && !liv.client.toLowerCase().includes(search.toLowerCase())) return false

    return true
  })

  const grouped = groupByDate(filtered)
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  // Stats résumé
  const total = filtered.length
  const livrees = filtered.filter(l => l.statut === 'livree').length
  const enCours = filtered.filter(l => l.statut === 'en_cours').length
  const annulees = filtered.filter(l => l.statut === 'annulee').length
  const ca = filtered.filter(l => l.statut === 'livree').reduce((s, l) => s + (l.total || 0), 0)

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      {/* Header */}
      <header className="bg-[#0a0f1e] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">C</div>
          <span className="font-semibold text-lg">ChefloProvider</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/livraison" className="text-sm text-gray-300 hover:text-white transition-colors">
            ← Nouvelle livraison
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Titre */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a0f1e] mb-1">Planning des livraisons</h1>
          <p className="text-gray-500 text-sm">Historique complet de toutes les livraisons</p>
        </div>

        {/* Cartes résumé */}
        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-[#0a0f1e]">{total}</p>
            <p className="text-xs text-gray-400">livraisons</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Livrées</p>
            <p className="text-2xl font-bold text-green-600">{livrees}</p>
            <p className="text-xs text-gray-400">terminées</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">En cours</p>
            <p className="text-2xl font-bold text-amber-500">{enCours}</p>
            <p className="text-xs text-gray-400">en attente</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">CA total</p>
            <p className="text-2xl font-bold text-[#0a0f1e]">${ca.toFixed(2)}</p>
            <p className="text-xs text-gray-400">livraisons livrées</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          {/* Recherche */}
          <input
            type="text"
            placeholder="Rechercher un magasin..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#0a0f1e] focus:border-transparent"
          />

          {/* Filtre période */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {[
              { key: 'tout',        label: 'Tout' },
              { key: 'aujourd_hui', label: "Aujourd'hui" },
              { key: 'semaine',     label: 'Cette semaine' },
              { key: 'mois',        label: 'Ce mois' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFiltre(f.key as typeof filtre)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filtre === f.key
                    ? 'bg-[#0a0f1e] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Filtre statut */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'tous',     label: 'Tous les statuts' },
              { key: 'en_cours', label: 'En cours' },
              { key: 'livree',   label: 'Livrées' },
              { key: 'annulee',  label: 'Annulées' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFiltreStatut(f.key as typeof filtreStatut)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filtreStatut === f.key
                    ? 'bg-[#0a0f1e] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste groupée par jour */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-[#0a0f1e] rounded-full animate-spin mx-auto mb-4" />
            Chargement...
          </div>
        ) : dates.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">Aucune livraison trouvée</p>
            <p className="text-sm mt-1">Essaie un autre filtre</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dates.map(date => {
              const livsJour = grouped[date]
              const totalJour = livsJour
                .filter(l => l.statut === 'livree')
                .reduce((s, l) => s + (l.total || 0), 0)

              return (
                <div key={date}>
                  {/* En-tête du jour */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#0a0f1e]" />
                      <h2 className="font-semibold text-[#0a0f1e] capitalize">
                        {formatDate(date)}
                      </h2>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {livsJour.length} livraison{livsJour.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    {totalJour > 0 && (
                      <span className="text-sm font-semibold text-green-600">${totalJour.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Cards du jour */}
                  <div className="space-y-2">
                    {livsJour.map(liv => {
                      const cfg = STATUT_CONFIG[liv.statut]
                      const isOpen = expanded === liv.id

                      return (
                        <div
                          key={liv.id}
                          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                          {/* Ligne principale */}
                          <button
                            onClick={() => setExpanded(isOpen ? null : liv.id)}
                            className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-xl bg-[#0a0f1e] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {liv.client.charAt(0)}
                            </div>

                            {/* Infos */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#0a0f1e] truncate">{liv.client}</p>
                              <p className="text-xs text-gray-400">{formatHeure(liv.date)}</p>
                            </div>

                            {/* Statut */}
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${cfg.color}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dot}`} />
                              {cfg.label}
                            </span>

                            {/* Total */}
                            {liv.total > 0 && (
                              <span className="text-sm font-bold text-[#0a0f1e] flex-shrink-0">
                                ${liv.total.toFixed(2)}
                              </span>
                            )}

                            {/* Chevron */}
                            <span className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                              ▾
                            </span>
                          </button>

                          {/* Détail expandable */}
                          {isOpen && (
                            <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                              {liv.notes && (
                                <p className="text-sm text-gray-500 mb-3 italic">📝 {liv.notes}</p>
                              )}

                              {liv.lignes && liv.lignes.length > 0 ? (
                                <div>
                                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                    Détail des produits
                                  </p>
                                  <div className="space-y-2">
                                    {liv.lignes.map((ligne, i) => (
                                      <div key={i} className="bg-white rounded-xl px-4 py-3 border border-gray-100">
                                        <div className="flex items-center justify-between mb-1">
                                          <p className="font-medium text-sm text-[#0a0f1e]">{ligne.produit}</p>
                                          <p className="font-semibold text-sm text-green-600">
                                            ${((ligne.quantite_remise - ligne.quantite_reprise) * ligne.prix_unitaire).toFixed(2)}
                                          </p>
                                        </div>
                                        <div className="flex gap-4 text-xs text-gray-400">
                                          <span>↩ Repris : {ligne.quantite_reprise}</span>
                                          <span>📦 Rayon : {ligne.quantite_rayon}</span>
                                          <span>✅ Remis : {ligne.quantite_remise}</span>
                                          <span>💰 {ligne.prix_unitaire}$/u</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400">Aucun détail de produit disponible</p>
                              )}

                              <p className="text-xs text-gray-400 mt-3">ID : {liv.id}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}