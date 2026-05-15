'use client'

import { useState, useEffect } from 'react'
import { Client, Produit } from '@/types'

type Step = 'client' | 'repris' | 'rayon' | 'remis' | 'confirmation'
const STEPS: Step[] = ['client', 'repris', 'rayon', 'remis', 'confirmation']
const STEP_LABELS: Record<Step, string> = {
  client: 'Sélectionner le magasin',
  repris: 'Quantités reprises',
  rayon: 'Quantités en rayon',
  remis: 'Quantités remises',
  confirmation: 'Confirmation',
}

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
    const body = {
      client_id: selectedClient.id,
      client_nom: selectedClient.name,
      produits: produits.map((p, i) => ({
        produit_nom: p.nom,
        quantity_repris: quantitesRepris[i],
        quantity_rayon: quantitesRayon[i],
        quantity_remis: quantitesRemis[i],
      })),
    }
    await fetch('/api/livraisons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
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
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-sm w-full">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('Livraison enregistrée', 'Delivery saved')}</h2>
          <p className="text-sm text-gray-500 mb-6">{t('La livraison a été ajoutée avec succès.', 'The delivery has been successfully added.')}</p>
          <button onClick={reset} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
            {t('Nouvelle livraison', 'New delivery')}
          </button>
        </div>
      </div>
    )
  }

  const step = STEPS[currentStep]

  function QuantityRow({ nom, qty, onPlus, onMinus }: { nom: string; qty: number; onPlus: () => void; onMinus: () => void }) {
    return (
      <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100">
        <span className="text-sm text-gray-900 flex-1">{nom}</span>
        <div className="flex items-center gap-3">
          <button onClick={onMinus} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">−</button>
          <span className="text-sm font-medium w-6 text-center">{qty}</span>
          <button onClick={onPlus} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">+</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-base font-semibold text-gray-900">ChefloProvider</h1>
          <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50">
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex gap-1 mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-500">{t('Étape', 'Step')} {currentStep + 1} / {STEPS.length} — {STEP_LABELS[step]}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {/* Étape 1 : Sélection client */}
          {step === 'client' && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-4">{t('Sélectionner le magasin', 'Select store')}</h2>
              <div className="space-y-2">
                {clients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClient(c)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                      selectedClient?.id === c.id ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              {selectedClient && <p className="text-xs text-gray-500 mt-3">{t('Sélectionné :', 'Selected:')} <strong>{selectedClient.name}</strong></p>}
            </div>
          )}

          {/* Étapes quantités */}
          {(step === 'repris' || step === 'rayon' || step === 'remis') && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-4">
                {step === 'repris' && t('Quantités reprises', 'Return quantities')}
                {step === 'rayon' && t('Quantités en rayon', 'Shelf quantities')}
                {step === 'remis' && t('Quantités remises', 'Delivered quantities')}
              </h2>
              <div className="space-y-2">
                {produits.map((p, i) => {
                  const arr = step === 'repris' ? quantitesRepris : step === 'rayon' ? quantitesRayon : quantitesRemis
                  const setArr = step === 'repris' ? setQuantitesRepris : step === 'rayon' ? setQuantitesRayon : setQuantitesRemis
                  return <QuantityRow key={p.id} nom={p.nom} qty={arr[i]} onPlus={() => adjust(arr, setArr, i, 1)} onMinus={() => adjust(arr, setArr, i, -1)} />
                })}
              </div>
            </div>
          )}

          {/* Confirmation */}
          {step === 'confirmation' && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-4">{t('Récapitulatif', 'Summary')}</h2>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800"><strong>{t('Magasin :', 'Store:')} </strong>{selectedClient?.name}</p>
              </div>
              <div className="space-y-2">
                {produits.map((p, i) => (
                  <div key={p.id} className="text-sm py-2 border-b border-gray-100 last:border-0">
                    <p className="font-medium text-gray-900">{p.nom}</p>
                    <p className="text-gray-500 text-xs">
                      {t('Repris', 'Return')}: {quantitesRepris[i]} · {t('Rayon', 'Shelf')}: {quantitesRayon[i]} · {t('Remis', 'Delivered')}: {quantitesRemis[i]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-4">
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(s => s - 1)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              {t('Retour', 'Back')}
            </button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={() => {
                if (step === 'client' && !selectedClient) return
                setCurrentStep(s => s + 1)
              }}
              disabled={step === 'client' && !selectedClient}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t('Continuer', 'Continue')}
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? t('Envoi...', 'Sending...') : t('Ajouter la livraison', 'Add delivery')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
