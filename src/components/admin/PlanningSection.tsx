'use client'
import { useState, useEffect } from 'react'

interface Produit { id: number; nom: string }
interface Client { id: number; name: string; store_number?: number }
interface PlanningProduit { produit_nom: string; quantite: number }
interface PlanningEntry {
  planning_id: string
  client_id: number
  client_nom: string
  store_number?: number
  ordre: number
  jour: number
  produits: PlanningProduit[] | null
}

const JOURS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function PlanningSection() {
  const [jourActif, setJourActif] = useState(1)
  const [planning, setPlanning] = useState<PlanningEntry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [produits, setProduits] = useState<Produit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<PlanningEntry | null>(null)
  const [form, setForm] = useState({
    client_id: 0,
    ordre: 0,
    produits: [] as PlanningProduit[]
  })

  const loadPlanning = (jour: number) => {
    setLoading(true)
    fetch(`/api/planning?jour=${jour}`)
      .then(r => r.json())
      .then(j => { setPlanning(j.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(r => r.json()),
      fetch('/api/produits').then(r => r.json()),
    ]).then(([cli, prod]) => {
      setClients(cli.data || [])
      setProduits(prod.data || [])
    })
    loadPlanning(1)
  }, [])

  useEffect(() => { loadPlanning(jourActif) }, [jourActif])

  const handleSave = async () => {
    if (!form.client_id) return
    setSaving(true)
    await fetch('/api/planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: form.client_id, jour: jourActif, ordre: form.ordre, produits: form.produits }),
    })
    setModal(null)
    setSaving(false)
    loadPlanning(jourActif)
  }

  const handleDelete = async (planningId: string) => {
    await fetch(`/api/planning?id=${planningId}`, { method: 'DELETE' })
    loadPlanning(jourActif)
  }

  const addProduit = () => setForm(f => ({ ...f, produits: [...f.produits, { produit_nom: '', quantite: 0 }] }))
  const removeProduit = (i: number) => setForm(f => ({ ...f, produits: f.produits.filter((_, idx) => idx !== i) }))

  return (
    <>
      <style suppressHydrationWarning>{`
        .ps-jours { display: flex; gap: 6px; margin-bottom: 24px; flex-wrap: wrap; }
        .ps-jour { padding: 8px 16px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; background: #f4f3f0; color: #6b7280; transition: all 0.15s; }
        .ps-jour.active { background: #0a0f1e; color: white; }
        .ps-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .ps-title { font-size: 16px; font-weight: 600; color: #0a0f1e; }
        .ps-count { font-size: 13px; color: #9ca3af; }
        .ps-add-btn { padding: 9px 18px; background: #0a0f1e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ps-table { width: 100%; border-collapse: collapse; }
        .ps-th { text-align: left; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; padding: 0 12px 12px; border-bottom: 1px solid #f3f4f6; }
        .ps-tr { border-bottom: 1px solid #f9fafb; }
        .ps-tr:hover { background: #fafafa; }
        .ps-td { padding: 14px 12px; font-size: 13px; color: #374151; vertical-align: middle; }
        .ps-badge { display: inline-block; padding: 2px 8px; background: #dbeafe; color: #1d4ed8; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 4px; margin-bottom: 2px; }
        .ps-btn { padding: 6px 12px; border-radius: 6px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ps-btn-edit { background: #f3f4f6; color: #374151; }
        .ps-btn-del { background: #fee2e2; color: #dc2626; }
        .ps-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
        .ps-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
        .ps-modal { background: white; border-radius: 20px; padding: 32px; width: 100%; max-width: 500px; max-height: 85vh; overflow-y: auto; }
        .ps-modal-title { font-size: 18px; font-weight: 700; color: #0a0f1e; margin-bottom: 20px; }
        .ps-label { font-size: 13px; font-weight: 600; color: #0a0f1e; display: block; margin-bottom: 6px; }
        .ps-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; box-sizing: border-box; margin-bottom: 14px; }
        .ps-produit-row { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; margin-bottom: 8px; }
        .ps-produit-grid { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; }
        .ps-modal-actions { display: flex; gap: 10px; margin-top: 24px; }
        .ps-btn-cancel { flex: 1; padding: 12px; border: 1.5px solid #e5e7eb; border-radius: 12px; background: white; color: #374151; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ps-btn-save { flex: 1; padding: 12px; border: none; border-radius: 12px; background: #0a0f1e; color: white; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .ps-add-produit { width: 100%; padding: 8px; border: 1.5px dashed #e5e7eb; border-radius: 8px; background: white; color: #6b7280; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-bottom: 8px; }
      `}</style>

      {/* Sélecteur de jour */}
      <div className="ps-jours">
        {JOURS.slice(1).map((j, i) => (
          <button key={i+1} className={`ps-jour ${jourActif === i+1 ? 'active' : ''}`} onClick={() => setJourActif(i+1)}>
            {j}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="ps-header">
        <div>
          <div className="ps-title">Planning du {JOURS[jourActif]}</div>
          <div className="ps-count">{planning.length} shop{planning.length > 1 ? 's' : ''}</div>
        </div>
        <button className="ps-add-btn" onClick={() => {
          setForm({ client_id: 0, ordre: planning.length, produits: [] })
          setModal('add')
        }}>+ Ajouter un shop</button>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="ps-empty">Chargement...</div>
      ) : planning.length === 0 ? (
        <div className="ps-empty">Aucun shop planifié ce jour</div>
      ) : (
        <table className="ps-table">
          <thead>
            <tr>
              {['Ordre', 'Shop', 'Produits', 'Actions'].map(h => (
                <th key={h} className="ps-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planning.map((p, i) => (
              <tr key={p.planning_id} className="ps-tr">
                <td className="ps-td" style={{ fontWeight: 700, color: '#0a0f1e' }}>#{p.ordre + 1}</td>
                <td className="ps-td">
                  <div style={{ fontWeight: 600, color: '#0a0f1e' }}>{p.client_nom}</div>
                  {p.store_number && <div style={{ fontSize: '11px', color: '#9ca3af' }}>Store #{p.store_number}</div>}
                </td>
                <td className="ps-td">
                  {p.produits && p.produits.length > 0
                    ? p.produits.map((pr, j) => (
                      <span key={j} className="ps-badge">{pr.produit_nom} ×{pr.quantite}</span>
                    ))
                    : <span style={{ color: '#c4c4c4', fontSize: '12px' }}>Aucun produit</span>
                  }
                </td>
                <td className="ps-td">
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="ps-btn ps-btn-edit" onClick={() => {
                      setSelected(p)
                      setForm({ client_id: p.client_id, ordre: p.ordre, produits: p.produits || [] })
                      setModal('edit')
                    }}>✏️</button>
                    <button className="ps-btn ps-btn-del" onClick={() => handleDelete(p.planning_id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal ajout / édition */}
      {modal && (
        <div className="ps-overlay">
          <div className="ps-modal">
            <div className="ps-modal-title">
              {modal === 'add' ? `Ajouter un shop — ${JOURS[jourActif]}` : `Modifier — ${selected?.client_nom}`}
            </div>

            <label className="ps-label">Shop</label>
            <select className="ps-input" value={form.client_id}
              onChange={e => setForm(f => ({ ...f, client_id: Number(e.target.value) }))}>
              <option value={0}>Sélectionner un shop...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label className="ps-label">Ordre de livraison</label>
            <input type="number" className="ps-input" value={form.ordre}
              onChange={e => setForm(f => ({ ...f, ordre: Number(e.target.value) }))} />

            <label className="ps-label">Produits livrés</label>
            {form.produits.map((p, i) => (
              <div key={i} className="ps-produit-row">
                <div className="ps-produit-grid">
                  <select className="ps-input" style={{ marginBottom: 0 }} value={p.produit_nom}
                    onChange={e => {
                      const np = [...form.produits]
                      np[i] = { ...np[i], produit_nom: e.target.value }
                      setForm(f => ({ ...f, produits: np }))
                    }}>
                    <option value="">Sélectionner...</option>
                    {produits.map(pr => <option key={pr.id} value={pr.nom}>{pr.nom}</option>)}
                  </select>
                  <input type="number" min="0" style={{ width: '60px', padding: '10px 8px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
                    value={p.quantite}
                    onChange={e => {
                      const np = [...form.produits]
                      np[i] = { ...np[i], quantite: Number(e.target.value) }
                      setForm(f => ({ ...f, produits: np }))
                    }} />
                  <button onClick={() => removeProduit(i)} style={{ padding: '8px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>✕</button>
                </div>
              </div>
            ))}
            <button className="ps-add-produit" onClick={addProduit}>+ Ajouter un produit</button>

            <div className="ps-modal-actions">
              <button className="ps-btn-cancel" onClick={() => setModal(null)}>Annuler</button>
              <button className="ps-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}