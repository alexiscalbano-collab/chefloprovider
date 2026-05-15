'use client'
// ProduitsSection.tsx — même pattern que ClientsSection
import { useState, useEffect } from 'react'
import { Produit } from '@/types'

export default function ProduitsSection() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [nom, setNom] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Produit | null>(null)

  useEffect(() => { fetch('/api/produits').then(r => r.json()).then(j => setProduits(j.data || [])) }, [])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/produits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom }) })
    const json = await res.json()
    if (!json.success) { setError(json.error); return }
    setNom(''); setShowForm(false)
    fetch('/api/produits').then(r => r.json()).then(j => setProduits(j.data || []))
  }

  async function del(p: Produit) {
    await fetch(`/api/produits/${p.id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    fetch('/api/produits').then(r => r.json()).then(j => setProduits(j.data || []))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-gray-900">Produits</h2>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Ajouter</button>
      </div>
      {showForm && (
        <form onSubmit={add} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <input placeholder="Nom du produit *" value={nom} onChange={e => setNom(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg">Ajouter</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-lg border border-gray-300">Annuler</button>
          </div>
        </form>
      )}
      <div className="space-y-2">
        {produits.map(p => (
          <div key={p.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50">
            <span className="text-sm font-medium text-gray-900">{p.nom}</span>
            <button onClick={() => setConfirmDelete(p)} className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50">Supprimer</button>
          </div>
        ))}
        {produits.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucun produit</p>}
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full mx-4">
            <p className="text-sm text-gray-600 mb-4">Supprimer <strong>{confirmDelete.nom}</strong> ?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="text-sm px-4 py-2 rounded-lg border border-gray-300">Annuler</button>
              <button onClick={() => del(confirmDelete)} className="text-sm px-4 py-2 rounded-lg bg-red-600 text-white">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
