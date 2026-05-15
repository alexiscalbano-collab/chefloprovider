'use client'
import { useState, useEffect } from 'react'
import { Recette, Ingredient } from '@/types'

export default function RecettesSection() {
  const [recettes, setRecettes] = useState<Recette[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [nom, setNom] = useState('')
  const [selectedIngs, setSelectedIngs] = useState<number[]>([])
  const [showForm, setShowForm] = useState(false)

  const load = () => {
    fetch('/api/recettes').then(r => r.json()).then(j => setRecettes(j.data || []))
    fetch('/api/ingredients').then(r => r.json()).then(j => setIngredients(j.data || []))
  }
  useEffect(() => { load() }, [])

  function toggleIng(id: number) {
    setSelectedIngs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/recettes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, ingredient_ids: selectedIngs }),
    })
    setNom(''); setSelectedIngs([]); setShowForm(false); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-gray-900">Recettes</h2>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Ajouter</button>
      </div>
      {showForm && (
        <form onSubmit={add} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <input placeholder="Nom de la recette *" value={nom} onChange={e => setNom(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Ingrédients</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {ingredients.map(i => (
                <label key={i.id} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input type="checkbox" checked={selectedIngs.includes(i.id)} onChange={() => toggleIng(i.id)} className="rounded" />
                  <span className="text-sm text-gray-700">{i.nom}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg">Ajouter</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-lg border border-gray-300">Annuler</button>
          </div>
        </form>
      )}
      <div className="space-y-2">
        {recettes.map(r => (
          <div key={r.id} className="py-3 px-4 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-900">{r.nom}</span>
          </div>
        ))}
        {recettes.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucune recette</p>}
      </div>
    </div>
  )
}
