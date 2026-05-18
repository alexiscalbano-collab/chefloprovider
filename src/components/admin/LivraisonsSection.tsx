'use client'
import { useState, useEffect } from 'react'
import { Livraison } from '@/types'

export default function LivraisonsSection() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/livraisons').then(r => r.json()).then(j => {
      setLivraisons(j.data || [])
      setLoading(false)
    })
  }, [])

  return (
    <>
      <style>{`
        .ls-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .ls-title { font-size: 18px; font-weight: 600; color: #0a0f1e; }
        .ls-count { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .ls-list { display: flex; flex-direction: column; gap: 8px; }
        .ls-item { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
        .ls-item-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer; background: white; transition: background 0.1s; }
        .ls-item-header:hover { background: #fafafa; }
        .ls-item-left { display: flex; align-items: center; gap: 12px; }
        .ls-avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 700; flex-shrink: 0; }
        .ls-name { font-size: 14px; font-weight: 600; color: #0a0f1e; }
        .ls-date { font-size: 12px; color: #9ca3af; margin-top: 2px; }
        .ls-chevron { font-size: 12px; color: #9ca3af; transition: transform 0.2s; }
        .ls-chevron.open { transform: rotate(180deg); }
        .ls-details { border-top: 1px solid #f3f4f6; background: #f8f7f4; padding: 12px 16px; }
        .ls-prod-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .ls-prod-row:last-child { border-bottom: none; }
        .ls-prod-name { font-size: 13px; font-weight: 500; color: #0a0f1e; }
        .ls-prod-stats { display: flex; gap: 12px; }
        .ls-stat { text-align: center; }
        .ls-stat-val { font-size: 13px; font-weight: 600; color: #0a0f1e; }
        .ls-stat-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
        .ls-loading { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
        .ls-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
      `}</style>

      <div className="ls-header">
        <div>
          <div className="ls-title">Livraisons</div>
          <div className="ls-count">{livraisons.length} livraison{livraisons.length > 1 ? 's' : ''}</div>
        </div>
      </div>

      {loading ? (
        <div className="ls-loading">Chargement...</div>
      ) : livraisons.length === 0 ? (
        <div className="ls-empty">Aucune livraison pour le moment</div>
      ) : (
        <div className="ls-list">
          {livraisons.map(l => (
            <div key={l.id} className="ls-item">
              <div className="ls-item-header" onClick={() => setExpanded(expanded === l.id ? null : l.id)}>
                <div className="ls-item-left">
                  <div className="ls-avatar">{l.client_nom.charAt(0)}</div>
                  <div>
                    <div className="ls-name">{l.client_nom}</div>
                    <div className="ls-date">{new Date(l.date_livraison).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
                <span className={`ls-chevron ${expanded === l.id ? 'open' : ''}`}>▼</span>
              </div>
              {expanded === l.id && l.produits && (
                <div className="ls-details">
                  {l.produits.map(p => (
                    <div key={p.id} className="ls-prod-row">
                      <div className="ls-prod-name">{p.produit_nom}</div>
                      <div className="ls-prod-stats">
                        <div className="ls-stat">
                          <div className="ls-stat-val">{p.quantity_repris}</div>
                          <div className="ls-stat-label">Repris</div>
                        </div>
                        <div className="ls-stat">
                          <div className="ls-stat-val">{p.quantity_rayon}</div>
                          <div className="ls-stat-label">Rayon</div>
                        </div>
                        <div className="ls-stat">
                          <div className="ls-stat-val">{p.quantity_remis}</div>
                          <div className="ls-stat-label">Remis</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}