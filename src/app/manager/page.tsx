'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────
interface Achat {
  id: number
  ingredient_id: number
  ingredient_nom: string
  quantite: number
  unite: 'kg' | 'litre' | 'gramme'
  prix: number
  created_at: string
}
interface LivraisonProduit {
  id?: number
  produit_nom: string
  quantity_repris: number
  quantity_rayon: number
  quantity_remis: number
}
interface Livraison {
  id: number
  client_id: number
  client_nom: string
  date_livraison: string
  statut?: string
  total?: number
  produits?: LivraisonProduit[]
}
interface Produit {
  id: number
  nom: string
}
interface Ingredient {
  id: number
  nom: string
}

// ── Helpers ────────────────────────────────────────────────
const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const STATUT_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  livree:   { bg: '#dcfce7', color: '#16a34a', label: 'Livrée' },
  en_cours: { bg: '#fef9c3', color: '#ca8a04', label: 'En cours' },
  annulee:  { bg: '#fee2e2', color: '#dc2626', label: 'Annulée' },
}

const TABS = [
  { key: 'livraisons', label: 'Livraisons', icon: '🚚' },
  { key: 'achats',     label: 'Achats',     icon: '🛒' },
  { key: 'produits',   label: 'Produits',   icon: '📦' },
]

// ── Styles communs ─────────────────────────────────────────
const btn = (bg: string, color = 'white') => ({
  padding: '8px 14px', border: 'none', borderRadius: '8px',
  background: bg, color, fontSize: '13px', fontWeight: '600' as const,
  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
})
const input = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
  borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
  outline: 'none', boxSizing: 'border-box' as const,
}
const th = {
  padding: '13px 18px', textAlign: 'left' as const,
  fontSize: '11px', fontWeight: '600' as const,
  color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.5px',
}
const td = (i: number) => ({
  padding: '13px 18px', borderTop: '1px solid #f3f4f6',
  background: i % 2 ? '#fafafa' : 'white', fontSize: '14px',
})

export default function ManagerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'livraisons' | 'achats' | 'produits'>('livraisons')
  const [livraisons, setLivraisons]     = useState<Livraison[]>([])
  const [achats, setAchats]             = useState<Achat[]>([])
  const [produits, setProduits]         = useState<Produit[]>([])
  const [ingredients, setIngredients]   = useState<Ingredient[]>([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [confirm, setConfirm]           = useState<{ type: string; id: number } | null>(null)

  // Modals
  const [modalLiv, setModalLiv]         = useState<Livraison | null>(null)
  const [modalAchat, setModalAchat]     = useState<Achat | null>(null)
  const [modalProduit, setModalProduit] = useState<Produit | null>(null)
  const [addModal, setAddModal]         = useState<'achat' | 'produit' | 'livraison' | null>(null)

  // Form states
  const [livForm, setLivForm] = useState({ client_nom: '', statut: 'en_cours', date_livraison: '', produits: [] as LivraisonProduit[] })
  const [achatForm, setAchatForm] = useState({ ingredient_id: 0, ingredient_nom: '', quantite: 0, unite: 'kg' as 'kg'|'litre'|'gramme', prix: 0 })
  const [produitForm, setProduitForm] = useState({ nom: '' })

  // Auth check
  useEffect(() => {
    if (status === 'loading') return
    const role = (session?.user as { role?: string })?.role
    if (!session || (role !== 'manager' && role !== 'admin')) router.push('/manager/login')
  }, [session, status, router])

  // Load data
  const loadAll = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/livraisons').then(r => r.json()),
      fetch('/api/achats').then(r => r.json()),
      fetch('/api/produits').then(r => r.json()),
      fetch('/api/ingredients').then(r => r.json()),
    ]).then(([liv, ach, prod, ing]) => {
      setLivraisons(liv.data || [])
      setAchats(ach.data || [])
      setProduits(prod.data || [])
      setIngredients(ing.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { if (status === 'authenticated') loadAll() }, [status])

  // ── Stats ──────────────────────────────────────────────────
  const coutAchats = achats.reduce((s, a) => s + (a.prix * a.quantite), 0)

  // ── DELETE ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm) return
    setSaving(true)
    const url = confirm.type === 'livraison' ? `/api/livraisons/${confirm.id}`
              : confirm.type === 'achat'     ? `/api/achats/${confirm.id}`
              : `/api/produits/${confirm.id}`
    await fetch(url, { method: 'DELETE' })
    setConfirm(null)
    setSaving(false)
    loadAll()
  }

  // ── UPDATE LIVRAISON ───────────────────────────────────────
  const handleUpdateLiv = async () => {
    if (!modalLiv) return
    setSaving(true)
    await fetch(`/api/livraisons/${modalLiv.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_nom: livForm.client_nom,
        statut: livForm.statut,
        date_livraison: livForm.date_livraison,
        produits: livForm.produits,
      }),
    })
    setModalLiv(null)
    setSaving(false)
    loadAll()
  }

  // ── UPDATE ACHAT ───────────────────────────────────────────
  const handleUpdateAchat = async () => {
    if (!modalAchat) return
    setSaving(true)
    await fetch(`/api/achats/${modalAchat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achatForm),
    })
    setModalAchat(null)
    setSaving(false)
    loadAll()
  }

  // ── UPDATE PRODUIT ─────────────────────────────────────────
  const handleUpdateProduit = async () => {
    if (!modalProduit) return
    setSaving(true)
    await fetch(`/api/produits/${modalProduit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: produitForm.nom }),
    })
    setModalProduit(null)
    setSaving(false)
    loadAll()
  }

  // ── ADD ────────────────────────────────────────────────────
  const handleAdd = async () => {
    setSaving(true)
    if (addModal === 'achat') {
      await fetch('/api/achats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achatForm),
      })
    } else if (addModal === 'produit') {
      await fetch('/api/produits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: produitForm.nom }),
      })
    }
    setAddModal(null)
    setSaving(false)
    loadAll()
  }

  if (status === 'loading') return null

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f5f0eb', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <header style={{ background: '#0a0f1e', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#2563eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '16px' }}>C</div>
          <div>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>ChefloProvider</span>
            <span style={{ marginLeft: '10px', background: '#1e3a5f', color: '#60a5fa', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px' }}>MANAGER</span>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/manager/login' })} style={{ ...btn('rgba(255,255,255,0.1)'), border: '1px solid rgba(255,255,255,0.2)' }}>
          Déconnexion
        </button>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Titre */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0a0f1e', margin: '0 0 4px' }}>Tableau de bord</h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>Bonjour {session?.user?.name || 'Manager'} 👋</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Livraisons', value: livraisons.length, icon: '🚚', color: '#2563eb' },
            { label: 'Coût achats', value: `$${coutAchats.toFixed(2)}`, icon: '🛒', color: '#16a34a' },
            { label: 'Produits', value: produits.length, icon: '📦', color: '#ca8a04' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'white', padding: '6px', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: 'fit-content' }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: activeTab === tab.key ? '#0a0f1e' : 'transparent', color: activeTab === tab.key ? 'white' : '#666', fontWeight: '600', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Bouton ajouter */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          {activeTab === 'achats' && (
            <button onClick={() => { setAchatForm({ ingredient_id: 0, ingredient_nom: '', quantite: 0, unite: 'kg', prix: 0 }); setAddModal('achat') }}
              style={{ ...btn('#0a0f1e') }}>+ Ajouter un achat</button>
          )}
          {activeTab === 'produits' && (
            <button onClick={() => { setProduitForm({ nom: '' }); setAddModal('produit') }}
              style={{ ...btn('#0a0f1e') }}>+ Ajouter un produit</button>
          )}
        </div>

        {/* Tableau */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#0a0f1e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            Chargement...
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            {/* ── LIVRAISONS ── */}
            {activeTab === 'livraisons' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Magasin', 'Date', 'Statut', 'Total', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {livraisons.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Aucune livraison</td></tr>
                    : livraisons.map((l, i) => {
                      const s = STATUT_STYLE[l.statut || 'en_cours'] || STATUT_STYLE.en_cours
                      return (
                        <tr key={l.id}>
                          <td style={td(i)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '30px', height: '30px', background: '#0a0f1e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700' }}>{l.client_nom?.charAt(0)}</div>
                              <span style={{ fontWeight: '600', color: '#0a0f1e' }}>{l.client_nom}</span>
                            </div>
                          </td>
                          <td style={td(i)}>{fmt(l.date_livraison)}</td>
                          <td style={td(i)}>
                            <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{s.label}</span>
                          </td>
                          <td style={{ ...td(i), fontWeight: '700', color: '#16a34a' }}>{l.total ? `$${Number(l.total).toFixed(2)}` : '—'}</td>
                          <td style={td(i)}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => {
                                setModalLiv(l)
                                setLivForm({ client_nom: l.client_nom, statut: l.statut || 'en_cours', date_livraison: l.date_livraison?.split('T')[0] || '', produits: l.produits || [] })
                              }} style={{ ...btn('#f3f4f6', '#333') }}>✏️</button>
                              <button onClick={() => setConfirm({ type: 'livraison', id: l.id })} style={{ ...btn('#fee2e2', '#dc2626') }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            )}

            {/* ── ACHATS ── */}
            {activeTab === 'achats' && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Ingrédient', 'Quantité', 'Prix unitaire', 'Total', 'Date', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {achats.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Aucun achat</td></tr>
                    : achats.map((a, i) => (
                      <tr key={a.id}>
                        <td style={{ ...td(i), fontWeight: '600', color: '#0a0f1e' }}>{a.ingredient_nom}</td>
                        <td style={td(i)}>
                          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{a.quantite} {a.unite}</span>
                        </td>
                        <td style={td(i)}>${Number(a.prix).toFixed(2)}</td>
                        <td style={{ ...td(i), fontWeight: '700', color: '#16a34a' }}>${(a.prix * a.quantite).toFixed(2)}</td>
                        <td style={{ ...td(i), color: '#888' }}>{fmt(a.created_at)}</td>
                        <td style={td(i)}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => {
                              setModalAchat(a)
                              setAchatForm({ ingredient_id: a.ingredient_id, ingredient_nom: a.ingredient_nom, quantite: a.quantite, unite: a.unite, prix: a.prix })
                            }} style={{ ...btn('#f3f4f6', '#333') }}>✏️</button>
                            <button onClick={() => setConfirm({ type: 'achat', id: a.id })} style={{ ...btn('#fee2e2', '#dc2626') }}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
                {achats.length > 0 && (
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                      <td colSpan={3} style={{ padding: '13px 18px', fontWeight: '700', color: '#0a0f1e' }}>Total</td>
                      <td style={{ padding: '13px 18px', fontWeight: '700', color: '#16a34a', fontSize: '16px' }}>${coutAchats.toFixed(2)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            )}

            {/* ── PRODUITS ── */}
            {activeTab === 'produits' && (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                  {produits.length === 0
                    ? <p style={{ color: '#888', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Aucun produit</p>
                    : produits.map(p => (
                      <div key={p.id} style={{ background: '#f9fafb', borderRadius: '14px', padding: '16px', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', background: '#0a0f1e', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: '700' }}>{p.nom.charAt(0)}</div>
                          <span style={{ fontWeight: '600', color: '#0a0f1e', fontSize: '14px' }}>{p.nom}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setModalProduit(p); setProduitForm({ nom: p.nom }) }} style={{ ...btn('#f3f4f6', '#333') }}>✏️</button>
                          <button onClick={() => setConfirm({ type: 'produit', id: p.id })} style={{ ...btn('#fee2e2', '#dc2626') }}>🗑️</button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL EDIT LIVRAISON ── */}
      {modalLiv && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0a0f1e', marginBottom: '20px' }}>Modifier la livraison</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Magasin</label>
                <input style={input} value={livForm.client_nom} onChange={e => setLivForm(f => ({ ...f, client_nom: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Statut</label>
                <select style={{ ...input }} value={livForm.statut} onChange={e => setLivForm(f => ({ ...f, statut: e.target.value }))}>
                  <option value="en_cours">En cours</option>
                  <option value="livree">Livrée</option>
                  <option value="annulee">Annulée</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Date</label>
                <input type="date" style={input} value={livForm.date_livraison} onChange={e => setLivForm(f => ({ ...f, date_livraison: e.target.value }))} />
              </div>
              {livForm.produits.length > 0 && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '10px' }}>Produits</label>
                  {livForm.produits.map((p, i) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                      <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', color: '#0a0f1e' }}>{p.produit_nom}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        {(['quantity_repris', 'quantity_rayon', 'quantity_remis'] as const).map(field => (
                          <div key={field}>
                            <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>
                              {field === 'quantity_repris' ? 'Repris' : field === 'quantity_rayon' ? 'Rayon' : 'Remis'}
                            </label>
                            <input type="number" style={{ ...input, padding: '6px 10px' }}
                              value={p[field]}
                              onChange={e => {
                                const newProd = [...livForm.produits]
                                newProd[i] = { ...newProd[i], [field]: Number(e.target.value) }
                                setLivForm(f => ({ ...f, produits: newProd }))
                              }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setModalLiv(null)} style={{ ...btn('white', '#333'), flex: 1, border: '1.5px solid #e5e7eb' }}>Annuler</button>
              <button onClick={handleUpdateLiv} disabled={saving} style={{ ...btn('#0a0f1e'), flex: 1 }}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT ACHAT ── */}
      {modalAchat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0a0f1e', marginBottom: '20px' }}>Modifier l'achat</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Ingrédient</label>
                <select style={{ ...input }} value={achatForm.ingredient_id}
                  onChange={e => {
                    const ing = ingredients.find(i => i.id === Number(e.target.value))
                    setAchatForm(f => ({ ...f, ingredient_id: Number(e.target.value), ingredient_nom: ing?.nom || '' }))
                  }}>
                  <option value={0}>Sélectionner...</option>
                  {ingredients.map(i => <option key={i.id} value={i.id}>{i.nom}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Quantité</label>
                  <input type="number" style={input} value={achatForm.quantite} onChange={e => setAchatForm(f => ({ ...f, quantite: Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Unité</label>
                  <select style={{ ...input }} value={achatForm.unite} onChange={e => setAchatForm(f => ({ ...f, unite: e.target.value as 'kg'|'litre'|'gramme' }))}>
                    <option value="kg">kg</option>
                    <option value="litre">litre</option>
                    <option value="gramme">gramme</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Prix unitaire ($)</label>
                <input type="number" step="0.01" style={input} value={achatForm.prix} onChange={e => setAchatForm(f => ({ ...f, prix: Number(e.target.value) }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setModalAchat(null)} style={{ ...btn('white', '#333'), flex: 1, border: '1.5px solid #e5e7eb' }}>Annuler</button>
              <button onClick={handleUpdateAchat} disabled={saving} style={{ ...btn('#0a0f1e'), flex: 1 }}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDIT PRODUIT ── */}
      {modalProduit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0a0f1e', marginBottom: '20px' }}>Modifier le produit</h3>
            <input style={input} value={produitForm.nom} onChange={e => setProduitForm({ nom: e.target.value })} placeholder="Nom du produit" />
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setModalProduit(null)} style={{ ...btn('white', '#333'), flex: 1, border: '1.5px solid #e5e7eb' }}>Annuler</button>
              <button onClick={handleUpdateProduit} disabled={saving} style={{ ...btn('#0a0f1e'), flex: 1 }}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AJOUTER ── */}
      {addModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0a0f1e', marginBottom: '20px' }}>
              {addModal === 'achat' ? 'Ajouter un achat' : 'Ajouter un produit'}
            </h3>
            {addModal === 'achat' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Ingrédient</label>
                  <select style={{ ...input }} value={achatForm.ingredient_id}
                    onChange={e => {
                      const ing = ingredients.find(i => i.id === Number(e.target.value))
                      setAchatForm(f => ({ ...f, ingredient_id: Number(e.target.value), ingredient_nom: ing?.nom || '' }))
                    }}>
                    <option value={0}>Sélectionner...</option>
                    {ingredients.map(i => <option key={i.id} value={i.id}>{i.nom}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Quantité</label>
                    <input type="number" style={input} value={achatForm.quantite} onChange={e => setAchatForm(f => ({ ...f, quantite: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Unité</label>
                    <select style={{ ...input }} value={achatForm.unite} onChange={e => setAchatForm(f => ({ ...f, unite: e.target.value as 'kg'|'litre'|'gramme' }))}>
                      <option value="kg">kg</option>
                      <option value="litre">litre</option>
                      <option value="gramme">gramme</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#0a0f1e', display: 'block', marginBottom: '6px' }}>Prix unitaire ($)</label>
                  <input type="number" step="0.01" style={input} value={achatForm.prix} onChange={e => setAchatForm(f => ({ ...f, prix: Number(e.target.value) }))} />
                </div>
              </div>
            )}
            {addModal === 'produit' && (
              <input style={input} value={produitForm.nom} onChange={e => setProduitForm({ nom: e.target.value })} placeholder="Nom du produit" />
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setAddModal(null)} style={{ ...btn('white', '#333'), flex: 1, border: '1.5px solid #e5e7eb' }}>Annuler</button>
              <button onClick={handleAdd} disabled={saving} style={{ ...btn('#0a0f1e'), flex: 1 }}>{saving ? 'Ajout...' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMATION SUPPRESSION ── */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🗑️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0a0f1e', marginBottom: '8px' }}>Confirmer la suppression</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirm(null)} style={{ ...btn('white', '#333'), flex: 1, border: '1.5px solid #e5e7eb' }}>Annuler</button>
              <button onClick={handleDelete} disabled={saving} style={{ ...btn('#dc2626'), flex: 1 }}>{saving ? 'Suppression...' : 'Supprimer'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}