'use client'

import { useState } from 'react'
import ClientsSection from '@/components/admin/ClientsSection'
import ProduitsSection from '@/components/admin/ProduitsSection'
import IngredientsSection from '@/components/admin/IngredientsSection'
import RecettesSection from '@/components/admin/RecettesSection'
import LivraisonsSection from '@/components/admin/LivraisonsSection'
import AchatsSection from '@/components/admin/AchatsSection'
import StatistiquesSection from '@/components/admin/StatistiquesSection'
import PlanningSection from '@/components/admin/PlanningSection'

const SECTIONS = [
  { id: 'clients', label: 'Clients', icon: '👥' },
  { id: 'produits', label: 'Produits', icon: '🥗' },
  { id: 'ingredients', label: 'Ingrédients', icon: '🧂' },
  { id: 'recettes', label: 'Recettes', icon: '📋' },
  { id: 'livraisons', label: 'Livraisons', icon: '🚚' },
  { id: 'achats', label: 'Achats', icon: '🛒' },
  { id: 'statistiques', label: 'Statistiques', icon: '📊' },
  { id: 'planning', label: 'Planning', icon: '📅' },
]

export default function AdminPage() {
  const [active, setActive] = useState('clients')

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'DM Sans', sans-serif; background: #f4f3f0; }
        .admin-layout { min-height: 100vh; display: grid; grid-template-columns: 260px 1fr; }
        .sidebar { background: #0a0f1e; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .sidebar-brand { padding: 28px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 12px; }
        .sidebar-logo { width: 36px; height: 36px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-family: 'DM Serif Display', serif; font-size: 16px; box-shadow: 0 4px 16px rgba(59,130,246,0.3); flex-shrink: 0; }
        .sidebar-name { font-family: 'DM Serif Display', serif; font-size: 18px; color: #fff; }
        .sidebar-nav { padding: 16px 12px; flex: 1; }
        .nav-label { font-size: 10px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; padding: 0 12px; margin-bottom: 8px; margin-top: 8px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: all 0.15s; margin-bottom: 2px; font-size: 14px; color: rgba(255,255,255,0.5); font-weight: 400; border: none; background: none; width: 100%; text-align: left; }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .nav-item.active { background: rgba(59,130,246,0.15); color: #93c5fd; font-weight: 500; }
        .nav-icon { font-size: 16px; opacity: 0.6; }
        .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; color: rgba(255,255,255,0.4); background: none; border: none; width: 100%; text-align: left; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .logout-btn:hover { background: rgba(239,68,68,0.1); color: #fca5a5; }
        .main { padding: 40px 48px; overflow-y: auto; }
        .main-header { margin-bottom: 36px; }
        .main-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: #0a0f1e; letter-spacing: -0.5px; margin-bottom: 4px; }
        .main-sub { font-size: 14px; color: #9ca3af; }
        .content-card { background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 32px; min-height: 500px; }
      `}</style>

      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-logo">C</div>
            <span className="sidebar-name">ChefloProvider</span>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-label">Navigation</div>
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)} className={`nav-item ${active === s.id ? 'active' : ''}`}>
                <span className="nav-icon">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <a href="/login" className="logout-btn">
              <span>→</span> Déconnexion
            </a>
          </div>
        </aside>

        <main className="main">
          <div className="main-header">
            <h1 className="main-title">{SECTIONS.find(s => s.id === active)?.label}</h1>
            <p className="main-sub">Gestion et administration — ChefloProvider</p>
          </div>
          <div className="content-card">
            {active === 'clients' && <ClientsSection />}
            {active === 'produits' && <ProduitsSection />}
            {active === 'ingredients' && <IngredientsSection />}
            {active === 'recettes' && <RecettesSection />}
            {active === 'livraisons' && <LivraisonsSection />}
            {active === 'achats' && <AchatsSection />}
            {active === 'statistiques' && <StatistiquesSection />}
            {active === 'planning' && <PlanningSection />}
          </div>
        </main>
      </div>
    </>
  )
}