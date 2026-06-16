'use client'
import { useState, useEffect } from 'react'
import { Ingredient } from '@/types'

export default function IngredientsSection() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [nom, setNom] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const load = () => fetch('/api/ingredients').then(r => r.json()).then(j => setIngredients(j.data || []))
  useEffect(() => { load() }, [])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/ingredients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom }) })
    const json = await res.json()
    if (!json.success) { setError(json.error); return }
    setNom(''); setShowForm(false); load()
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        .is-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .is-title { font-size: 18px; font-weight: 600; color: #0a0f1e; }
        .is-count { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .is-add-btn { padding: 9px 18px; background: #0a0f1e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .is-add-btn:hover { background: #1e3a5f; }
        .is-form { background: #f8f7f4; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .is-label { display: block; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .is-input { width: 100%; padding: 10px 12px; background: white; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0a0f1e; outline: none; transition: all 0.15s; margin-bottom: 12px; }
        .is-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
        .is-actions { display: flex; gap: 8px; }
        .is-btn-save { padding: 9px 20px; background: #0a0f1e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .is-btn-cancel { padding: 9px 20px; background: white; color: #6b7280; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .is-error { font-size: 12px; color: #dc2626; margin-bottom: 8px; }
        .is-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .is-tag { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 500; color: #0369a1; }
        .is-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
      `}</style>

      <div className="is-header">
        <div>
          <div className="is-title">Ingrédients</div>
          <div className="is-count">{ingredients.length} ingrédient{ingredients.length > 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => setShowForm(true)} className="is-add-btn">+ Ajouter</button>
      </div>

      {showForm && (
        <div className="is-form">
          <form onSubmit={add}>
            <label className="is-label">Nom de l'ingrédient *</label>
            <input value={nom} onChange={e => setNom(e.target.value)} required className="is-input" placeholder="Ex: Lettuce" />
            {error && <div className="is-error">⚠ {error}</div>}
            <div className="is-actions">
              <button type="submit" className="is-btn-save">Ajouter</button>
              <button type="button" onClick={() => setShowForm(false)} className="is-btn-cancel">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {ingredients.length === 0 ? (
        <div className="is-empty">Aucun ingrédient pour le moment</div>
      ) : (
        <div className="is-grid">
          {ingredients.map(i => (
            <div key={i.id} className="is-tag">{i.nom}</div>
          ))}
        </div>
      )}
    </>
  )
}