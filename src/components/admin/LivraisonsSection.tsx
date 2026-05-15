'use client'
import { useState, useEffect } from 'react'
import { Livraison } from '@/types'

export function LivraisonsSection() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/livraisons').then(r => r.json()).then(j => setLivraisons(j.data || []))
  }, [])

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-6">Livraisons</h2>
      <div className="space-y-2">
        {livraisons.map(l => (
          <div key={l.id} className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === l.id ? null : l.id)}
              className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 text-left"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{l.client_nom}</p>
                <p className="text-xs text-gray-500">{new Date(l.date_livraison).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className="text-gray-400">{expanded === l.id ? '▲' : '▼'}</span>
            </button>
            {expanded === l.id && l.produits && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-1">
                {l.produits.map(p => (
                  <div key={p.id} className="text-xs text-gray-700 flex justify-between">
                    <span>{p.produit_nom}</span>
                    <span className="text-gray-500">Repris: {p.quantity_repris} · Rayon: {p.quantity_rayon} · Remis: {p.quantity_remis}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {livraisons.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucune livraison</p>}
      </div>
    </div>
  )
}

export default LivraisonsSection
