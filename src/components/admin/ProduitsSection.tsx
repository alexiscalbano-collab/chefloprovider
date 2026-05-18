'use client'
import { useState, useEffect } from 'react'
import { Produit } from '@/types'

export default function ProduitsSection() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [nom, setNom] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Produit | null>(null)

  const load = () => fetch('/api/produits').then(r => r.json()).then(j => setProduits(j.data || []))
  useEffect(() => { load() }, [])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/produits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom }) })
    const json = await res.json()
    if (!json.success) { setError(json.error); return }
    setNom(''); setShowForm(false); load()
  }

  async function del(p: Produit) {
    await fetch(`/api/produits/${p.id}`, { method: 'DELETE' })
    setConfirmDelete(null); load()
  }

  return (
    <>
      <style>{`
        .ps-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .ps-title { font-size: 18px; font-weight: 600; color: #0a0f1e; }
        .ps-count { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .ps-add-btn { padding: 9px 18px; background: #0a0f1e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .ps-add-btn:hover { background: #1e3a5f; }
        .ps-form { background: #f8f7f4; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .ps-label { display: block; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .ps-input { width: 100%; padding: 10px 12px; background: white; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0a0f1e; outline: none; transition: all 0.15s; margin-bottom: 12px; }
        .ps-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
        .ps-actions { display: flex; gap: 8px; }
        .ps-btn-save { padding: 9px 20px; background: #0a0f1e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ps-btn-cancel { padding: 9px 20px; background: white; color: #6b7280; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ps-error { font-size: 12px; color: #dc2626; margin-bottom: 8px; }
        .ps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .ps-card { background: #f8f7f4; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; display: flex; align-items: center; justify-content: space-between; }
        .ps-card-name { font-size: 14px; font-weight: 600; color: #0a0f1e; }
        .ps-btn-del { padding: 5px 10px; background: #fef2f2; color: #dc2626; border: none; border-radius: 6px; font-size: 11px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ps-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
        .ps-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .ps-modal { background: white; border-radius: 16px; padding: 28px; max-width: 400px; width: 100%; margin: 16px; }
        .ps-modal-title { font-size: 16px; font-weight: 600; color: #0a0f1e; margin-bottom: 8px; }
        .ps-modal-text { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
        .ps-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
      `}</style>

      <div className="ps-header">
        <div>
          <div className="ps-title">Produits</div>
          <div className="ps-count">{produits.length} produit{produits.length > 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => setShowForm(true)} className="ps-add-btn">+ Ajouter</button>
      </div>

      {showForm && (
        <div className="ps-form">
          <form onSubmit={add}>
            <label className="ps-label">Nom du produit *</label>
            <input value={nom} onChange={e => setNom(e.target.value)} required className="ps-input" placeholder="Ex: Caesar Salad" />
            {error && <div className="ps-error">⚠ {error}</div>}
            <div className="ps-actions">
              <button type="submit" className="ps-btn-save">Ajouter</button>
              <button type="button" onClick={() => setShowForm(false)} className="ps-btn-cancel">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {produits.length === 0 ? (
        <div className="ps-empty">Aucun produit pour le moment</div>
      ) : (
        <div className="ps-grid">
          {produits.map(p => (
            <div key={p.id} className="ps-card">
              <div className="ps-card-name">{p.nom}</div>
              <button onClick={() => setConfirmDelete(p)} className="ps-btn-del">Supprimer</button>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="ps-modal-bg">
          <div className="ps-modal">
            <div className="ps-modal-title">Supprimer ce produit ?</div>
            <div className="ps-modal-text">Supprimer <strong>{confirmDelete.nom}</strong> ?</div>
            <div className="ps-modal-actions">
              <button onClick={() => setConfirmDelete(null)} className="ps-btn-cancel">Annuler</button>
              <button onClick={() => del(confirmDelete)} className="ps-btn-del">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}