'use client'
import { useState, useEffect } from 'react'
import { Achat } from '@/types'

export default function AchatsSection() {
  const [achats, setAchats] = useState<Achat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/achats').then(r => r.json()).then(j => {
      setAchats(j.data || [])
      setLoading(false)
    })
  }, [])

  const total = achats.reduce((sum, a) => sum + Number(a.prix), 0)

  return (
    <>
      <style suppressHydrationWarning>{`
        .as-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .as-title { font-size: 18px; font-weight: 600; color: #0a0f1e; }
        .as-count { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .as-total { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
        .as-total-label { font-size: 13px; color: #15803d; font-weight: 500; }
        .as-total-val { font-size: 20px; font-weight: 700; color: #15803d; font-family: 'DM Serif Display', serif; }
        .as-table { width: 100%; border-collapse: collapse; }
        .as-th { text-align: left; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; padding: 0 12px 12px; border-bottom: 1px solid #f3f4f6; }
        .as-tr { border-bottom: 1px solid #f9fafb; }
        .as-tr:hover { background: #fafafa; }
        .as-td { padding: 14px 12px; font-size: 13px; color: #374151; vertical-align: middle; }
        .as-name { font-weight: 600; color: #0a0f1e; }
        .as-date { font-size: 12px; color: #9ca3af; margin-top: 2px; }
        .as-badge { display: inline-block; padding: 3px 8px; background: #f0f9ff; color: #0369a1; border-radius: 4px; font-size: 11px; font-weight: 500; }
        .as-price { font-weight: 700; color: #0a0f1e; font-size: 14px; }
        .as-loading { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
        .as-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
      `}</style>

      <div className="as-header">
        <div>
          <div className="as-title">Achats</div>
          <div className="as-count">{achats.length} achat{achats.length > 1 ? 's' : ''}</div>
        </div>
      </div>

      {achats.length > 0 && (
        <div className="as-total">
          <div className="as-total-label">Total des achats</div>
          <div className="as-total-val">{total.toFixed(2)} $</div>
        </div>
      )}

      {loading ? (
        <div className="as-loading">Chargement...</div>
      ) : achats.length === 0 ? (
        <div className="as-empty">Aucun achat pour le moment</div>
      ) : (
        <table className="as-table">
          <thead>
            <tr>
              <th className="as-th">Ingrédient</th>
              <th className="as-th">Quantité</th>
              <th className="as-th">Date</th>
              <th className="as-th" style={{textAlign:'right'}}>Prix</th>
            </tr>
          </thead>
          <tbody>
            {achats.map(a => (
              <tr key={a.id} className="as-tr">
                <td className="as-td"><div className="as-name">{a.ingredient_nom}</div></td>
                <td className="as-td"><span className="as-badge">{a.quantite} {a.unite}</span></td>
                <td className="as-td"><div className="as-date">{new Date(a.created_at!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</div></td>
                <td className="as-td" style={{textAlign:'right'}}><div className="as-price">{Number(a.prix).toFixed(2)} $</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}