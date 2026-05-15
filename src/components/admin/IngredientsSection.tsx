'use client'
import { useState, useEffect } from 'react'
import { Ingredient } from '@/types'

export default function IngredientsSection() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [nom, setNom] = useState('')
  const [showForm, setShowForm] = useState(false)

  const load = () => fetch('/api/ingredients').then(r => r.json()).then(j => setIngredients(j.data || []))
  useEffect(() => { load() }, [])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/ingredients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom }) })
    setNom(''); setShowForm(false); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-gray-900">Ingrédients</h2>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Ajouter</button>
      </div>
      {showForm && (
        <form onSubmit={add} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <input placeholder="Nom de l'ingrédient *" value={nom} onChange={e => setNom(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg">Ajouter</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-lg border border-gray-300">Annuler</button>
          </div>
        </form>
      )}
      <div className="space-y-2">
        {ingredients.map(i => (
          <div key={i.id} className="py-3 px-4 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-900">{i.nom}</span>
          </div>
        ))}
        {ingredients.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucun ingrédient</p>}
      </div>
    </div>
  )
}
