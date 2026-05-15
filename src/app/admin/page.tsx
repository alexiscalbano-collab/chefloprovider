'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import ClientsSection from '@/components/admin/ClientsSection'
import ProduitsSection from '@/components/admin/ProduitsSection'
import IngredientsSection from '@/components/admin/IngredientsSection'
import RecettesSection from '@/components/admin/RecettesSection'
import LivraisonsSection from '@/components/admin/LivraisonsSection'
import AchatsSection from '@/components/admin/AchatsSection'

const SECTIONS = [
  { id: 'clients', label: 'Clients' },
  { id: 'produits', label: 'Produits' },
  { id: 'ingredients', label: 'Ingrédients' },
  { id: 'recettes', label: 'Recettes' },
  { id: 'livraisons', label: 'Livraisons' },
  { id: 'achats', label: 'Achats' },
]

export default function AdminPage() {
  const [active, setActive] = useState('clients')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Administration</h1>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-sm text-gray-500 hover:text-gray-700">Déconnexion</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar navigation */}
        <nav className="w-48 shrink-0">
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setActive(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active === s.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contenu principal */}
        <main className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {active === 'clients' && <ClientsSection />}
          {active === 'produits' && <ProduitsSection />}
          {active === 'ingredients' && <IngredientsSection />}
          {active === 'recettes' && <RecettesSection />}
          {active === 'livraisons' && <LivraisonsSection />}
          {active === 'achats' && <AchatsSection />}
        </main>
      </div>
    </div>
  )
}
