'use client'

import { useState, useEffect } from 'react'
import { Client } from '@/types'

export default function ClientsSection() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form, setForm] = useState({ name: '', adress: '', phone_number: '', pay_time: '' })
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null)

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    setLoading(true)
    const res = await fetch('/api/clients')
    const json = await res.json()
    setClients(json.data || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients'
    const method = editingClient ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const json = await res.json()
    if (!json.success) { setError(json.error); return }
    setShowForm(false)
    setEditingClient(null)
    setForm({ name: '', adress: '', phone_number: '', pay_time: '' })
    fetchClients()
  }

  async function handleDelete(client: Client) {
    await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    fetchClients()
  }

  function openEdit(client: Client) {
    setEditingClient(client)
    setForm({ name: client.name, adress: client.adress, phone_number: client.phone_number || '', pay_time: client.pay_time || '' })
    setShowForm(true)
  }

  return (
    <>
      <style>{`
        .cs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .cs-title { font-size: 18px; font-weight: 600; color: #0a0f1e; }
        .cs-count { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .cs-add-btn { display: flex; align-items: center; gap: 6px; padding: 9px 18px; background: #0a0f1e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .cs-add-btn:hover { background: #1e3a5f; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(10,15,30,0.2); }
        .cs-form { background: #f8f7f4; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
        .cs-form-title { font-size: 14px; font-weight: 600; color: #0a0f1e; margin-bottom: 16px; }
        .cs-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .cs-label { display: block; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .cs-input { width: 100%; padding: 10px 12px; background: white; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0a0f1e; outline: none; transition: all 0.15s; }
        .cs-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
        .cs-form-actions { display: flex; gap: 8px; }
        .cs-btn-save { padding: 9px 20px; background: #0a0f1e; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .cs-btn-save:hover { background: #1e3a5f; }
        .cs-btn-cancel { padding: 9px 20px; background: white; color: #6b7280; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .cs-btn-cancel:hover { background: #f3f4f6; }
        .cs-error { font-size: 12px; color: #dc2626; margin-top: 8px; }
        .cs-table { width: 100%; border-collapse: collapse; }
        .cs-th { text-align: left; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; padding: 0 12px 12px; border-bottom: 1px solid #f3f4f6; }
        .cs-tr { border-bottom: 1px solid #f9fafb; transition: background 0.1s; }
        .cs-tr:hover { background: #fafafa; }
        .cs-td { padding: 14px 12px; font-size: 13px; color: #374151; vertical-align: middle; }
        .cs-name { font-weight: 600; color: #0a0f1e; margin-bottom: 2px; }
        .cs-addr { font-size: 12px; color: #9ca3af; }
        .cs-badge { display: inline-block; padding: 3px 8px; background: #f0fdf4; color: #15803d; border-radius: 4px; font-size: 11px; font-weight: 500; }
        .cs-actions { display: flex; gap: 6px; justify-content: flex-end; }
        .cs-btn-edit { padding: 6px 12px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .cs-btn-edit:hover { background: #e5e7eb; }
        .cs-btn-del { padding: 6px 12px; background: #fef2f2; color: #dc2626; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .cs-btn-del:hover { background: #fee2e2; }
        .cs-loading { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
        .cs-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
        .cs-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .cs-modal { background: white; border-radius: 16px; padding: 28px; max-width: 400px; width: 100%; margin: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .cs-modal-title { font-size: 16px; font-weight: 600; color: #0a0f1e; margin-bottom: 8px; }
        .cs-modal-text { font-size: 14px; color: #6b7280; margin-bottom: 24px; line-height: 1.5; }
        .cs-modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
      `}</style>

      <div className="cs-header">
        <div>
          <div className="cs-title">Clients</div>
          <div className="cs-count">{clients.length} magasin{clients.length > 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => { setShowForm(true); setEditingClient(null); setForm({ name: '', adress: '', phone_number: '', pay_time: '' }) }} className="cs-add-btn">
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="cs-form">
          <div className="cs-form-title">{editingClient ? 'Modifier le client' : 'Nouveau client'}</div>
          <form onSubmit={handleSubmit}>
            <div className="cs-form-grid">
              <div>
                <label className="cs-label">Nom *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="cs-input" placeholder="Nom du magasin" />
              </div>
              <div>
                <label className="cs-label">Adresse *</label>
                <input value={form.adress} onChange={e => setForm({...form, adress: e.target.value})} required className="cs-input" placeholder="Adresse" />
              </div>
              <div>
                <label className="cs-label">Téléphone</label>
                <input value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} className="cs-input" placeholder="Numéro de téléphone" />
              </div>
              <div>
                <label className="cs-label">Délai paiement</label>
                <input value={form.pay_time} onChange={e => setForm({...form, pay_time: e.target.value})} className="cs-input" placeholder="Ex: Tuesday/Friday" />
              </div>
            </div>
            {error && <div className="cs-error">⚠ {error}</div>}
            <div className="cs-form-actions">
              <button type="submit" className="cs-btn-save">{editingClient ? 'Enregistrer' : 'Ajouter'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="cs-btn-cancel">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="cs-loading">Chargement...</div>
      ) : (
        <table className="cs-table">
          <thead>
            <tr>
              <th className="cs-th">Magasin</th>
              <th className="cs-th">Paiement</th>
              <th className="cs-th" style={{textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} className="cs-tr">
                <td className="cs-td">
                  <div className="cs-name">{client.name}</div>
                  <div className="cs-addr">{client.adress}{client.phone_number ? ` · ${client.phone_number}` : ''}</div>
                </td>
                <td className="cs-td">
                  {client.pay_time ? <span className="cs-badge">{client.pay_time}</span> : <span style={{color:'#d1d5db'}}>—</span>}
                </td>
                <td className="cs-td">
                  <div className="cs-actions">
                    <button onClick={() => openEdit(client)} className="cs-btn-edit">Modifier</button>
                    <button onClick={() => setConfirmDelete(client)} className="cs-btn-del">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && <tr><td colSpan={3} className="cs-empty">Aucun client</td></tr>}
          </tbody>
        </table>
      )}

      {confirmDelete && (
        <div className="cs-modal-bg">
          <div className="cs-modal">
            <div className="cs-modal-title">Supprimer ce client ?</div>
            <div className="cs-modal-text">Cette action supprimera définitivement <strong>{confirmDelete.name}</strong>. Cette opération est irréversible.</div>
            <div className="cs-modal-actions">
              <button onClick={() => setConfirmDelete(null)} className="cs-btn-cancel">Annuler</button>
              <button onClick={() => handleDelete(confirmDelete)} className="cs-btn-del">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}