'use client'

import { useState, useEffect } from 'react'
import { Client, Produit } from '@/types'

type Step = 'client' | 'repris' | 'rayon' | 'remis' | 'confirmation'
const STEPS: Step[] = ['client', 'repris', 'rayon', 'remis', 'confirmation']

export default function LivraisonPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [produits, setProduits] = useState<Produit[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [quantitesRepris, setQuantitesRepris] = useState<number[]>([])
  const [quantitesRayon, setQuantitesRayon] = useState<number[]>([])
  const [quantitesRemis, setQuantitesRemis] = useState<number[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(j => setClients(j.data || []))
    fetch('/api/produits').then(r => r.json()).then(j => {
      const p = j.data || []
      setProduits(p)
      setQuantitesRepris(Array(p.length).fill(0))
      setQuantitesRayon(Array(p.length).fill(0))
      setQuantitesRemis(Array(p.length).fill(0))
    })
  }, [])

  function adjust(arr: number[], setArr: (v: number[]) => void, i: number, delta: number) {
    const next = [...arr]
    next[i] = Math.max(0, next[i] + delta)
    setArr(next)
  }

  async function submit() {
    if (!selectedClient) return
    setLoading(true)
    await fetch('/api/livraisons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: selectedClient.id,
        client_nom: selectedClient.name,
        produits: produits.map((p, i) => ({
          produit_nom: p.nom,
          quantity_repris: quantitesRepris[i],
          quantity_rayon: quantitesRayon[i],
          quantity_remis: quantitesRemis[i],
        })),
      }),
    })
    setLoading(false)
    setSuccess(true)
  }

  function reset() {
    setSelectedClient(null)
    setCurrentStep(0)
    setQuantitesRepris(Array(produits.length).fill(0))
    setQuantitesRayon(Array(produits.length).fill(0))
    setQuantitesRemis(Array(produits.length).fill(0))
    setSuccess(false)
    setSearch('')
  }

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const step = STEPS[currentStep]

  const STEP_LABELS: Record<Step, [string, string]> = {
    client: [t('Sélectionner le magasin', 'Select store'), ''],
    repris: [t('Quantités reprises', 'Return quantities'), ''],
    rayon: [t('Quantités en rayon', 'Shelf quantities'), ''],
    remis: [t('Quantités remises', 'Delivered quantities'), ''],
    confirmation: [t('Confirmation', 'Confirmation'), ''],
  }

  if (success) {
    return (
      <>
        <style suppressHydrationWarning>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', sans-serif; background: #f4f3f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .success-card { background: white; border-radius: 20px; padding: 48px 40px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
          .success-icon { width: 64px; height: 64px; background: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 28px; }
          .success-title { font-family: 'DM Serif Display', serif; font-size: 26px; color: #0a0f1e; margin-bottom: 8px; }
          .success-sub { font-size: 14px; color: #9ca3af; margin-bottom: 32px; line-height: 1.6; }
          .success-client { background: #f8f7f4; border-radius: 10px; padding: 12px 16px; margin-bottom: 32px; font-size: 14px; font-weight: 600; color: #0a0f1e; }
          .success-btn { width: 100%; padding: 14px; background: #0a0f1e; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        `}</style>
        <div className="success-card">
          <div className="success-icon">✓</div>
          <div className="success-title">{t('Livraison enregistrée', 'Delivery saved')}</div>
          <div className="success-sub">{t('La livraison a été ajoutée avec succès.', 'The delivery has been successfully added.')}</div>
          {selectedClient && <div className="success-client">{selectedClient.name}</div>}
          <button onClick={reset} className="success-btn">{t('Nouvelle livraison', 'New delivery')}</button>
        </div>
      </>
    )
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f4f3f0; min-height: 100vh; }

        .lv-header { background: #0a0f1e; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; }
        .lv-brand { display: flex; align-items: center; gap: 10px; }
        .lv-logo { width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-family: 'DM Serif Display', serif; font-size: 14px; }
        .lv-brand-name { font-family: 'DM Serif Display', serif; font-size: 16px; color: white; }
        .lv-lang-btn { padding: 6px 12px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .lv-lang-btn:hover { background: rgba(255,255,255,0.2); }

        .lv-progress { background: white; border-bottom: 1px solid #e5e7eb; padding: 16px 20px; }
        .lv-steps { display: flex; gap: 0; margin-bottom: 10px; }
        .lv-step { flex: 1; height: 3px; background: #e5e7eb; border-radius: 2px; margin-right: 4px; transition: background 0.3s; }
        .lv-step.done { background: #0a0f1e; }
        .lv-step.active { background: #3b82f6; }
        .lv-step-info { display: flex; align-items: center; justify-content: space-between; }
        .lv-step-label { font-size: 13px; font-weight: 600; color: #0a0f1e; }
        .lv-step-count { font-size: 12px; color: #9ca3af; }

        .lv-content { padding: 20px; max-width: 600px; margin: 0 auto; }

        .lv-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #0a0f1e; margin-bottom: 16px; }

        .lv-search { width: 100%; padding: 11px 14px; background: white; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0a0f1e; outline: none; margin-bottom: 12px; transition: all 0.15s; }
        .lv-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }

        .lv-client-list { display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto; }
        .lv-client-item { padding: 14px 16px; background: white; border: 1.5px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: space-between; }
        .lv-client-item:hover { border-color: #93c5fd; background: #f0f9ff; }
        .lv-client-item.selected { border-color: #3b82f6; background: #eff6ff; }
        .lv-client-name { font-size: 14px; font-weight: 600; color: #0a0f1e; }
        .lv-client-check { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; transition: all 0.15s; }
        .lv-client-item.selected .lv-client-check { background: #3b82f6; border-color: #3b82f6; }

        .lv-qty-list { display: flex; flex-direction: column; gap: 8px; }
        .lv-qty-item { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
        .lv-qty-name { font-size: 14px; font-weight: 600; color: #0a0f1e; }
        .lv-qty-controls { display: flex; align-items: center; gap: 12px; }
        .lv-qty-btn { width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #e5e7eb; background: white; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; color: #374151; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .lv-qty-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
        .lv-qty-val { font-size: 16px; font-weight: 700; color: #0a0f1e; min-width: 28px; text-align: center; }

        .lv-summary { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .lv-summary-header { background: #0a0f1e; padding: 14px 16px; }
        .lv-summary-client { font-family: 'DM Serif Display', serif; font-size: 18px; color: white; }
        .lv-summary-date { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .lv-summary-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
        .lv-summary-row:last-child { border-bottom: none; }
        .lv-summary-prod { font-size: 14px; font-weight: 600; color: #0a0f1e; }
        .lv-summary-stats { display: flex; gap: 16px; }
        .lv-summary-stat { text-align: center; }
        .lv-summary-stat-val { font-size: 14px; font-weight: 700; color: #0a0f1e; }
        .lv-summary-stat-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }

        .lv-nav { display: flex; gap: 10px; margin-top: 20px; padding-bottom: 20px; }
        .lv-btn-back { flex: 1; padding: 14px; background: white; color: #374151; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .lv-btn-back:hover { background: #f3f4f6; }
        .lv-btn-next { flex: 2; padding: 14px; background: #0a0f1e; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .lv-btn-next:hover:not(:disabled) { background: #1e3a5f; }
        .lv-btn-next:disabled { opacity: 0.4; cursor: not-allowed; }
        .lv-btn-submit { flex: 2; padding: 14px; background: #15803d; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .lv-btn-submit:hover:not(:disabled) { background: #166534; }
        .lv-btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div>
        <header className="lv-header">
          <div className="lv-brand">
            <div className="lv-logo">C</div>
            <span className="lv-brand-name">ChefloProvider</span>
          </div>
          <a href="/livraison/planning" className="lv-lang-btn" style={{marginRight: "8px"}}>📅 Planning</a>
          <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} className="lv-lang-btn">
            {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </button>
        </header>

        <div className="lv-progress">
          <div className="lv-steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`lv-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`} />
            ))}
          </div>
          <div className="lv-step-info">
            <span className="lv-step-label">{STEP_LABELS[step][0]}</span>
            <span className="lv-step-count">{t('Étape', 'Step')} {currentStep + 1} / {STEPS.length}</span>
          </div>
        </div>

        <div className="lv-content">
          {step === 'client' && (
            <div>
              <h2 className="lv-section-title">{t('Quel magasin ?', 'Which store?')}</h2>
              <input
                className="lv-search"
                placeholder={t('Rechercher un magasin...', 'Search a store...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="lv-client-list">
                {filteredClients.map(c => (
                  <div key={c.id} className={`lv-client-item ${selectedClient?.id === c.id ? 'selected' : ''}`} onClick={() => setSelectedClient(c)}>
                    <span className="lv-client-name">{c.name}</span>
                    <div className="lv-client-check">{selectedClient?.id === c.id ? '✓' : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(step === 'repris' || step === 'rayon' || step === 'remis') && (
            <div>
              <h2 className="lv-section-title">
                {step === 'repris' && t('Quantités reprises', 'Return quantities')}
                {step === 'rayon' && t('Quantités en rayon', 'Shelf quantities')}
                {step === 'remis' && t('Quantités remises', 'Delivered quantities')}
              </h2>
              <div className="lv-qty-list">
                {produits.map((p, i) => {
                  const arr = step === 'repris' ? quantitesRepris : step === 'rayon' ? quantitesRayon : quantitesRemis
                  const setArr = step === 'repris' ? setQuantitesRepris : step === 'rayon' ? setQuantitesRayon : setQuantitesRemis
                  return (
                    <div key={p.id} className="lv-qty-item">
                      <span className="lv-qty-name">{p.nom}</span>
                      <div className="lv-qty-controls">
                        <button className="lv-qty-btn" onClick={() => adjust(arr, setArr, i, -1)}>−</button>
                        <span className="lv-qty-val">{arr[i]}</span>
                        <button className="lv-qty-btn" onClick={() => adjust(arr, setArr, i, 1)}>+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div>
              <h2 className="lv-section-title">{t('Récapitulatif', 'Summary')}</h2>
              <div className="lv-summary">
                <div className="lv-summary-header">
                  <div className="lv-summary-client">{selectedClient?.name}</div>
                  <div className="lv-summary-date">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                {produits.map((p, i) => (
                  <div key={p.id} className="lv-summary-row">
                    <div className="lv-summary-prod">{p.nom}</div>
                    <div className="lv-summary-stats">
                      <div className="lv-summary-stat">
                        <div className="lv-summary-stat-val">{quantitesRepris[i]}</div>
                        <div className="lv-summary-stat-label">{t('Repris', 'Return')}</div>
                      </div>
                      <div className="lv-summary-stat">
                        <div className="lv-summary-stat-val">{quantitesRayon[i]}</div>
                        <div className="lv-summary-stat-label">{t('Rayon', 'Shelf')}</div>
                      </div>
                      <div className="lv-summary-stat">
                        <div className="lv-summary-stat-val">{quantitesRemis[i]}</div>
                        <div className="lv-summary-stat-label">{t('Remis', 'Deliv.')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="lv-nav">
            {currentStep > 0 && (
              <button className="lv-btn-back" onClick={() => setCurrentStep(s => s - 1)}>
                ← {t('Retour', 'Back')}
              </button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <button
                className="lv-btn-next"
                disabled={step === 'client' && !selectedClient}
                onClick={() => setCurrentStep(s => s + 1)}
              >
                {t('Continuer', 'Continue')} →
              </button>
            ) : (
              <button className="lv-btn-submit" disabled={loading} onClick={submit}>
                {loading ? t('Envoi...', 'Sending...') : t('✓ Enregistrer la livraison', '✓ Save delivery')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}