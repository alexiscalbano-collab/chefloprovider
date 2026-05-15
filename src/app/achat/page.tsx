'use client'

import { useState, useEffect } from 'react'
import { Ingredient } from '@/types'

export default function AchatPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [selected, setSelected] = useState<Ingredient | null>(null)
  const [quantite, setQuantite] = useState('')
  const [unite, setUnite] = useState<'kg' | 'litre' | 'gramme'>('kg')
  const [prix, setPrix] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/ingredients').then(r => r.json()).then(j => setIngredients(j.data || []))
  }, [])

  async function handleSubmit() {
    setError('')
    if (!selected || !quantite || !prix) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    const res = await fetch('/api/achats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredient_id: selected.id,
        ingredient_nom: selected.nom,
        quantite: parseFloat(quantite),
        unite,
        prix: parseFloat(prix),
      }),
    })
    const json = await res.json()
    setLoading(false)

    if (!json.success) { setError(json.error); return }

    setSuccess(true)
    setSelected(null)
    setQuantite('')
    setPrix('')
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-base font-semibold text-gray-900 text-center">Achats</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Achat enregistré avec succès !
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4">Sélectionnez un ingrédient pour enregistrer un achat.</p>

        <div className="space-y-2">
          {ingredients.map((ing) => (
            <button
              key={ing.id}
              onClick={() => { setSelected(ing); setShowModal(true); setSuccess(false) }}
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <span className="text-sm font-medium text-gray-900">{ing.nom}</span>
              <span className="text-lg text-blue-600">+</span>
            </button>
          ))}
          {ingredients.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Aucun ingrédient disponible</p>
          )}
        </div>

        {/* Modal saisie */}
        {showModal && selected && (
          <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-1">{selected.nom}</h3>
              <p className="text-sm text-gray-500 mb-4">Renseignez les informations d'achat</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantité</label>
                  <input
                    type="number"
                    value={quantite}
                    onChange={(e) => setQuantite(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unité</label>
                  <div className="flex gap-2">
                    {(['kg', 'litre', 'gramme'] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnite(u)}
                        className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                          unite === u ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prix (€)</label>
                  <input
                    type="number"
                    value={prix}
                    onChange={(e) => setPrix(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
                >
                  {loading ? 'Envoi...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
