'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const role = (session.user as any)?.role
    if (role === 'admin') router.push('/admin')
    else if (role === 'livreur') router.push('/livraison')
    else if (role === 'achat') router.push('/achat')
    else router.push('/login')
  }, [session, status, router])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0a0f1e; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .loader { text-align: center; }
        .loader-logo { width: 56px; height: 56px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-family: 'DM Serif Display', serif; font-size: 24px; color: white; margin: 0 auto 20px; box-shadow: 0 8px 32px rgba(59,130,246,0.3); animation: pulse 1.5s ease-in-out infinite; }
        .loader-text { font-family: 'DM Serif Display', serif; font-size: 20px; color: white; margin-bottom: 6px; }
        .loader-sub { font-size: 13px; color: rgba(255,255,255,0.35); }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.95); opacity: 0.8; } }
      `}</style>
      <div className="loader">
        <div className="loader-logo">C</div>
        <div className="loader-text">ChefloProvider</div>
        <div className="loader-sub">Chargement en cours...</div>
      </div>
    </>
  )
}