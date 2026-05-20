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
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/ingredients').then(r => r.json()).then(j => setIngredients(j.data || []))
  }, [])

  async function handleSubmit() {
    setError('')
    if (!selected || !quantite || !prix) { setError('Veuillez remplir tous les champs'); return }
    setLoading(true)
    const res = await fetch('/api/achats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredient_id: selected.id, ingredient_nom: selected.nom, quantite: parseFloat(quantite), unite, prix: parseFloat(prix) }),
    })
    const json = await res.json()
    setLoading(false)
    if (!json.success) { setError(json.error); return }
    setSuccess(true)
    setSelected(null)
    setQuantite('')
    setPrix('')
    setShowModal(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  const filtered = ingredients.filter(i => i.nom.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f4f3f0; min-height: 100vh; }

        .ac-header { background: #0a0f1e; padding: 16px 20px; display: flex; align-items: center; gap: 10px; }
        .ac-logo { width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-family: 'DM Serif Display', serif; font-size: 14px; }
        .ac-brand-name { font-family: 'DM Serif Display', serif; font-size: 16px; color: white; }
        .ac-badge { margin-left: auto; padding: 4px 10px; background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); border-radius: 20px; font-size: 11px; font-weight: 600; }

        .ac-content { padding: 24px 20px; max-width: 600px; margin: 0 auto; }

        .ac-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-size: 14px; color: #15803d; font-weight: 500; }

        .ac-page-title { font-family: 'DM Serif Display', serif; font-size: 26px; color: #0a0f1e; margin-bottom: 4px; }
        .ac-page-sub { font-size: 13px; color: #9ca3af; margin-bottom: 20px; }

        .ac-search { width: 100%; padding: 11px 14px; background: white; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0a0f1e; outline: none; margin-bottom: 16px; transition: all 0.15s; }
        .ac-search:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }

        .ac-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .ac-item { background: white; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: space-between; }
        .ac-item:hover { border-color: #f59e0b; background: #fffbeb; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .ac-item-name { font-size: 14px; font-weight: 600; color: #0a0f1e; }
        .ac-item-icon { width: 32px; height: 32px; background: #fef3c7; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .ac-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }

        .ac-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; z-index: 50; padding: 0; }
        .ac-modal { background: white; border-radius: 20px 20px 0 0; width: 100%; max-width: 600px; padding: 28px 24px 40px; }
        .ac-modal-handle { width: 36px; height: 4px; background: #e5e7eb; border-radius: 2px; margin: 0 auto 20px; }
        .ac-modal-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #0a0f1e; margin-bottom: 4px; }
        .ac-modal-sub { font-size: 13px; color: #9ca3af; margin-bottom: 24px; }

        .ac-label { display: block; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .ac-input { width: 100%; padding: 12px 14px; background: #f8f7f4; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 15px; font-family: 'DM Sans', sans-serif; color: #0a0f1e; outline: none; transition: all 0.15s; margin-bottom: 16px; }
        .ac-input:focus { border-color: #f59e0b; background: white; box-shadow: 0 0 0 3px rgba(245,158,11,0.08); }

        .ac-units { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
        .ac-unit { padding: 10px; background: #f8f7f4; border: 1.5px solid #e5e7eb; border-radius: 8px; text-align: center; cursor: pointer; font-size: 13px; font-weight: 600; color: #6b7280; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .ac-unit.active { border-color: #f59e0b; background: #fffbeb; color: #92400e; }

        .ac-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 13px; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; }

        .ac-modal-actions { display: flex; gap: 10px; }
        .ac-btn-cancel { flex: 1; padding: 14px; background: #f3f4f6; color: #374151; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ac-btn-submit { flex: 2; padding: 14px; background: #0a0f1e; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .ac-btn-submit:hover:not(:disabled) { background: #1e3a5f; }
        .ac-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div>
        <header className="ac-header">
          <div className="ac-logo">C</div>
          <span className="ac-brand-name">ChefloProvider</span>
          <span className="ac-badge">Achats</span>
        </header>

        <div className="ac-content">
          {success && (
            <div className="ac-success">
              ✓ Achat enregistré avec succès !
            </div>
          )}

          <h1 className="ac-page-title">Enregistrer un achat</h1>
          <p className="ac-page-sub">Sélectionnez un ingrédient pour saisir un achat</p>

          <input
            className="ac-search"
            placeholder="Rechercher un ingrédient..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {filtered.length === 0 ? (
            <div className="ac-empty">Aucun ingrédient trouvé</div>
          ) : (
            <div className="ac-grid">
              {filtered.map(ing => (
                <div key={ing.id} className="ac-item" onClick={() => { setSelected(ing); setShowModal(true); setError('') }}>
                  <div className="ac-item-name">{ing.nom}</div>
                  <div className="ac-item-icon">+</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && selected && (
          <div className="ac-modal-bg" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="ac-modal">
              <div className="ac-modal-handle" />
              <div className="ac-modal-title">{selected.nom}</div>
              <div className="ac-modal-sub">Renseignez les informations d'achat</div>

              <label className="ac-label">Quantité</label>
              <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} placeholder="0" className="ac-input" />

              <label className="ac-label">Unité</label>
              <div className="ac-units">
                {(['kg', 'litre', 'gramme'] as const).map(u => (
                  <button key={u} onClick={() => setUnite(u)} className={`ac-unit ${unite === u ? 'active' : ''}`}>{u}</button>
                ))}
              </div>

              <label className="ac-label">Prix ($)</label>
              <input type="number" value={prix} onChange={e => setPrix(e.target.value)} placeholder="0.00" step="0.01" className="ac-input" />

              {error && <div className="ac-error">⚠ {error}</div>}

              <div className="ac-modal-actions">
                <button onClick={() => setShowModal(false)} className="ac-btn-cancel">Annuler</button>
                <button onClick={handleSubmit} disabled={loading} className="ac-btn-submit">
                  {loading ? 'Envoi...' : '✓ Ajouter l\'achat'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}