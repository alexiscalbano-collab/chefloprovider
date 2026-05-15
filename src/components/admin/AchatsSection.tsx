'use client'
import { useState, useEffect } from 'react'
import { Achat } from '@/types'

export default function AchatsSection() {
  const [achats, setAchats] = useState<Achat[]>([])

  useEffect(() => {
    fetch('/api/achats').then(r => r.json()).then(j => setAchats(j.data || []))
  }, [])

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-6">Achats</h2>
      <div className="space-y-2">
        {achats.map(a => (
          <div key={a.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">{a.ingredient_nom}</p>
              <p className="text-xs text-gray-500">{a.quantite} {a.unite} · {new Date(a.created_at!).toLocaleDateString('fr-FR')}</p>
            </div>
            <span className="text-sm font-semibold text-gray-900">{Number(a.prix).toFixed(2)} €</span>
          </div>
        ))}
        {achats.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucun achat</p>}
      </div>
    </div>
  )
}
