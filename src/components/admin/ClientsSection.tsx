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

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-gray-900">Clients</h2>
        <button
          onClick={() => { setShowForm(true); setEditingClient(null); setForm({ name: '', adress: '', phone_number: '', pay_time: '' }) }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">{editingClient ? 'Modifier le client' : 'Nouveau client'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              placeholder="Nom *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Adresse *"
              value={form.adress}
              onChange={(e) => setForm({ ...form, adress: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Téléphone"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Délai de paiement"
              value={form.pay_time}
              onChange={(e) => setForm({ ...form, pay_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                {editingClient ? 'Enregistrer' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <p className="text-sm text-gray-500">Chargement...</p>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <div key={client.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{client.name}</p>
                <p className="text-xs text-gray-500">{client.adress}{client.phone_number ? ` · ${client.phone_number}` : ''}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(client)} className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50">Modifier</button>
                <button onClick={() => setConfirmDelete(client)} className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50">Supprimer</button>
              </div>
            </div>
          ))}
          {clients.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucun client pour le moment</p>}
        </div>
      )}

      {/* Modal confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full mx-4">
            <h3 className="font-medium text-gray-900 mb-2">Supprimer ce client ?</h3>
            <p className="text-sm text-gray-600 mb-4">Cette action supprimera définitivement <strong>{confirmDelete.name}</strong>.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Annuler</button>
              <button onClick={() => handleDelete(confirmDelete)} className="text-sm px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
