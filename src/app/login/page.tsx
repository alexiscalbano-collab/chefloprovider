'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) { setError('Email ou mot de passe incorrect'); return }
    router.push('/dashboard')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'DM Sans', sans-serif; }
        .wrap { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
        .left { background: linear-gradient(135deg, #0a0f1e 0%, #0d1f3c 60%, #0a1628 100%); display: flex; flex-direction: column; justify-content: space-between; padding: 56px 64px; position: relative; overflow: hidden; }
        .left::before { content:''; position:absolute; top:-200px; left:-200px; width:600px; height:600px; background:radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%); }
        .brand { display:flex; align-items:center; gap:14px; z-index:1; position:relative; }
        .logo { width:44px; height:44px; background:linear-gradient(135deg,#3b82f6,#6366f1); border-radius:12px; display:flex; align-items:center; justify-content:center; color:white; font-family:'DM Serif Display',serif; font-size:20px; box-shadow:0 8px 32px rgba(59,130,246,0.3); }
        .brand-name { font-family:'DM Serif Display',serif; font-size:22px; color:#fff; }
        .tagline { font-family:'DM Serif Display',serif; font-size:52px; line-height:1.1; color:#fff; margin-bottom:24px; letter-spacing:-1px; z-index:1; position:relative; }
        .tagline em { font-style:italic; color:#93c5fd; }
        .desc { font-size:16px; color:rgba(255,255,255,0.4); line-height:1.7; max-width:340px; font-weight:300; z-index:1; position:relative; }
        .stats { display:flex; gap:40px; z-index:1; position:relative; }
        .stat { border-top:1px solid rgba(255,255,255,0.1); padding-top:20px; }
        .stat-n { font-family:'DM Serif Display',serif; font-size:32px; color:#fff; margin-bottom:4px; }
        .stat-l { font-size:12px; color:rgba(255,255,255,0.35); text-transform:uppercase; letter-spacing:0.5px; font-weight:500; }
        .right { background:#f8f7f4; display:flex; align-items:center; justify-content:center; padding:64px; }
        .card { width:100%; max-width:400px; }
        .sub { font-size:13px; color:#9ca3af; text-transform:uppercase; letter-spacing:1.5px; font-weight:500; margin-bottom:12px; }
        .title { font-family:'DM Serif Display',serif; font-size:36px; color:#0a0f1e; letter-spacing:-0.5px; margin-bottom:48px; }
        .fg { margin-bottom:20px; }
        .fl { display:block; font-size:12px; font-weight:600; color:#374151; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.3px; }
        .fi { width:100%; padding:14px 16px; background:#fff; border:1.5px solid #e5e7eb; border-radius:10px; font-size:15px; font-family:'DM Sans',sans-serif; color:#0a0f1e; outline:none; transition:all 0.2s; }
        .fi:focus { border-color:#3b82f6; box-shadow:0 0 0 4px rgba(59,130,246,0.08); }
        .fi::placeholder { color:#d1d5db; }
        .err { background:#fef2f2; border:1px solid #fecaca; color:#dc2626; font-size:13px; padding:12px 14px; border-radius:8px; margin-bottom:20px; }
        .btn { width:100%; padding:15px; background:#0a0f1e; color:#fff; border:none; border-radius:10px; font-size:15px; font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer; transition:all 0.2s; margin-top:8px; letter-spacing:0.3px; }
        .btn:hover:not(:disabled) { background:#1e3a5f; transform:translateY(-1px); box-shadow:0 8px 24px rgba(10,15,30,0.25); }
        .btn:disabled { opacity:0.6; cursor:not-allowed; }
        .div { height:1px; background:#e5e7eb; margin:32px 0; }
        .roles { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .rb { text-align:center; padding:10px 8px; background:#fff; border:1px solid #e5e7eb; border-radius:8px; }
        .rd { width:6px; height:6px; border-radius:50%; margin:0 auto 6px; }
        .rl { font-size:11px; color:#6b7280; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; }
        @media(max-width:768px){.wrap{grid-template-columns:1fr}.left{display:none}.right{padding:40px 24px;background:#0a0f1e}.title{color:#fff}.sub{color:rgba(255,255,255,0.4)}.fi{background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);color:#fff}.fl{color:rgba(255,255,255,0.6)}.btn{background:#3b82f6}.div{background:rgba(255,255,255,0.1)}.rb{background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1)}.rl{color:rgba(255,255,255,0.4)}}
      `}</style>
      <div className="wrap">
        <div className="left">
          <div className="brand">
            <div className="logo">C</div>
            <span className="brand-name">ChefloProvider</span>
          </div>
          <div>
            <h1 className="tagline">Gérez vos<br/>livraisons <em>avec</em><br/>précision.</h1>
            <p className="desc">Plateforme unifiée de gestion des livraisons, achats et administration pour les magasins Lucky au Cambodge.</p>
          </div>
          <div className="stats">
            <div className="stat"><div className="stat-n">78+</div><div className="stat-l">Magasins</div></div>
            <div className="stat"><div className="stat-n">3</div><div className="stat-l">Applications</div></div>
            <div className="stat"><div className="stat-n">100%</div><div className="stat-l">Web</div></div>
          </div>
        </div>
        <div className="right">
          <div className="card">
            <p className="sub">Espace sécurisé</p>
            <h2 className="title">Connexion</h2>
            <form onSubmit={handleSubmit}>
              <div className="fg">
                <label className="fl">Adresse email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="fi" placeholder="votre@email.com"/>
              </div>
              <div className="fg">
                <label className="fl">Mot de passe</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="fi" placeholder="••••••••"/>
              </div>
              {error && <div className="err">⚠ {error}</div>}
              <button type="submit" disabled={loading} className="btn">{loading?'Connexion...':'Se connecter →'}</button>
            </form>
            <div className="div"/>
            <div className="roles">
              <div className="rb"><div className="rd" style={{background:'#3b82f6'}}/><div className="rl">Admin</div></div>
              <div className="rb"><div className="rd" style={{background:'#10b981'}}/><div className="rl">Livreur</div></div>
              <div className="rb"><div className="rd" style={{background:'#f59e0b'}}/><div className="rl">Acheteur</div></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
