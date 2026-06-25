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
    await fetch('/api/recettes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom, ingredient_ids: selectedIngs }) })
    setNom(''); setSelectedIngs([]); setShowForm(false); load()
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        .rs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .rs-title { font-size: 18px; font-weight: 600; color: #0a0f1e; }
        .rs-count { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .rs-add-btn { padding: 9px 18px; background: #0a0f1e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .rs-form { background: #f8f7f4; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .rs-label { display: block; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .rs-input { width: 100%; padding: 10px 12px; background: white; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0a0f1e; outline: none; margin-bottom: 16px; }
        .rs-input:focus { border-color: #3b82f6; }
        .rs-ing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; max-height: 200px; overflow-y: auto; }
        .rs-ing-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: white; border: 1.5px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.1s; }
        .rs-ing-item.selected { border-color: #3b82f6; background: #eff6ff; }
        .rs-ing-item input { accent-color: #3b82f6; }
        .rs-ing-label { font-size: 12px; color: #374151; }
        .rs-actions { display: flex; gap: 8px; }
        .rs-btn-save { padding: 9px 20px; background: #0a0f1e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .rs-btn-cancel { padding: 9px 20px; background: white; color: #6b7280; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .rs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .rs-card { background: #f8f7f4; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
        .rs-card-name { font-size: 15px; font-weight: 600; color: #0a0f1e; margin-bottom: 4px; }
        .rs-card-sub { font-size: 12px; color: #9ca3af; }
        .rs-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
      `}</style>

      <div className="rs-header">
        <div>
          <div className="rs-title">Recettes</div>
          <div className="rs-count">{recettes.length} recette{recettes.length > 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => setShowForm(true)} className="rs-add-btn">+ Ajouter</button>
      </div>

      {showForm && (
        <div className="rs-form">
          <form onSubmit={add}>
            <label className="rs-label">Nom de la recette *</label>
            <input value={nom} onChange={e => setNom(e.target.value)} required className="rs-input" placeholder="Ex: Caesar Salad" />
            <label className="rs-label">Ingrédients</label>
            <div className="rs-ing-grid">
              {ingredients.map(i => (
                <div key={i.id} className={`rs-ing-item ${selectedIngs.includes(i.id) ? 'selected' : ''}`} onClick={() => toggleIng(i.id)}>
                  <input type="checkbox" checked={selectedIngs.includes(i.id)} onChange={() => {}} />
                  <span className="rs-ing-label">{i.nom}</span>
                </div>
              ))}
            </div>
            <div className="rs-actions">
              <button type="submit" className="rs-btn-save">Ajouter</button>
              <button type="button" onClick={() => setShowForm(false)} className="rs-btn-cancel">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {recettes.length === 0 ? (
        <div className="rs-empty">Aucune recette pour le moment</div>
      ) : (
        <div className="rs-grid">
          {recettes.map(r => (
            <div key={r.id} className="rs-card">
              <div className="rs-card-name">{r.nom}</div>
              <div className="rs-card-sub">Recette enregistrée</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}