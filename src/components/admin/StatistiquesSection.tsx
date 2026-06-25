'use client'
import { useState, useEffect } from 'react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts'

interface CaParClient { client_nom: string; ca: string }
interface CaParMois { mois: string; ca: string; nb_livraisons: string }
interface LivraisonsParMois { mois: string; total: string; livrees: string; en_cours: string; annulees: string }
interface TopProduit { produit_nom: string; quantite_nette: string; ca: string }
interface Compteurs {
  nb_livraisons: string; nb_livrees: string; nb_en_cours: string; nb_annulees: string
  nb_clients: string; nb_produits: string; nb_achats: string
}
interface StatsData {
  ca_total: number
  cout_achats: number
  marge_brute: number
  ratio_marge: number
  ca_par_client: CaParClient[]
  ca_par_mois: CaParMois[]
  livraisons_par_mois: LivraisonsParMois[]
  top_produits: TopProduit[]
  compteurs: Compteurs
}

const COLORS = ['#3b82f6','#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444','#84cc16','#a855f7']

function fmtMois(mois: string) {
  const [y, m] = mois.split('-')
  const noms = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
  return `${noms[parseInt(m) - 1]} ${y}`
}

export default function StatistiquesSection() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/statistiques').then(r => r.json()).then(j => {
      setStats(j.data || null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{textAlign:'center',padding:'60px',color:'#9ca3af'}}>Chargement des statistiques...</div>
  if (!stats) return <div style={{textAlign:'center',padding:'60px',color:'#9ca3af'}}>Impossible de charger les statistiques</div>

  const caParMoisData = stats.ca_par_mois.map(m => ({ mois: fmtMois(m.mois), ca: Number(m.ca) }))
  const livraisonsParMoisData = stats.livraisons_par_mois.map(m => ({
    mois: fmtMois(m.mois),
    Livrées: Number(m.livrees),
    'En cours': Number(m.en_cours),
    Annulées: Number(m.annulees),
  }))
  const caParClientData = stats.ca_par_client.map(c => ({ name: c.client_nom, value: Number(c.ca) }))
  const topProduitsData = stats.top_produits.map(p => ({ produit: p.produit_nom, quantite: Number(p.quantite_nette) }))

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'28px'}}>
        {[
          { label: 'CA total', value: `$${stats.ca_total.toFixed(2)}`, color: '#16a34a', sub: 'livraisons livrées' },
          { label: 'Coût achats', value: `$${stats.cout_achats.toFixed(2)}`, color: '#dc2626', sub: 'ingrédients' },
          { label: 'Marge brute', value: `$${stats.marge_brute.toFixed(2)}`, color: stats.marge_brute >= 0 ? '#16a34a' : '#dc2626', sub: 'CA − achats' },
          { label: 'Ratio marge', value: `${stats.ratio_marge.toFixed(1)}%`, color: '#ca8a04', sub: 'marge / CA' },
        ].map(k => (
          <div key={k.label} style={{background:'#f9fafb',border:'1px solid #f3f4f6',borderRadius:'14px',padding:'18px'}}>
            <div style={{fontSize:'12px',color:'#9ca3af',marginBottom:'8px'}}>{k.label}</div>
            <div style={{fontSize:'28px',fontFamily:"'DM Serif Display',serif",color:k.color}}>{k.value}</div>
            <div style={{fontSize:'11px',color:'#c4c4c4',marginTop:'4px'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'12px',marginBottom:'28px'}}>
        {[
          { v: stats.compteurs.nb_livraisons, l: 'Livraisons', c: '#0a0f1e' },
          { v: stats.compteurs.nb_livrees, l: 'Livrées', c: '#16a34a' },
          { v: stats.compteurs.nb_en_cours, l: 'En cours', c: '#ca8a04' },
          { v: stats.compteurs.nb_annulees, l: 'Annulées', c: '#dc2626' },
          { v: stats.compteurs.nb_clients, l: 'Clients', c: '#0a0f1e' },
          { v: stats.compteurs.nb_produits, l: 'Produits', c: '#0a0f1e' },
          { v: stats.compteurs.nb_achats, l: 'Achats', c: '#0a0f1e' },
        ].map(s => (
          <div key={s.l} style={{background:'#f9fafb',border:'1px solid #f3f4f6',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:s.c}}>{s.v}</div>
            <div style={{fontSize:'11px',color:'#9ca3af',marginTop:'2px'}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{background:'#f9fafb',border:'1px solid #f3f4f6',borderRadius:'14px',padding:'20px',marginBottom:'28px'}}>
        <div style={{fontSize:'13px',fontWeight:'600',color:'#6b7280',marginBottom:'16px'}}>CA par mois</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={caParMoisData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="mois" tick={{fontSize:12,fill:'#9ca3af'}} />
            <YAxis tick={{fontSize:12,fill:'#9ca3af'}} />
            <Tooltip formatter={(v: unknown) => `$${(v as number).toFixed(2)}`} />
            <Line type="monotone" dataKey="ca" stroke="#16a34a" strokeWidth={2} name="CA ($)" dot={{r:3}} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'28px'}}>
        <div style={{background:'#f9fafb',border:'1px solid #f3f4f6',borderRadius:'14px',padding:'20px'}}>
          <div style={{fontSize:'13px',fontWeight:'600',color:'#6b7280',marginBottom:'16px'}}>Livraisons par mois</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={livraisonsParMoisData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="mois" tick={{fontSize:11,fill:'#9ca3af'}} />
              <YAxis tick={{fontSize:12,fill:'#9ca3af'}} />
              <Tooltip />
              <Legend wrapperStyle={{fontSize:'12px'}} />
              <Bar dataKey="Livrées" stackId="a" fill="#16a34a" />
              <Bar dataKey="En cours" stackId="a" fill="#facc15" />
              <Bar dataKey="Annulées" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{background:'#f9fafb',border:'1px solid #f3f4f6',borderRadius:'14px',padding:'20px'}}>
          <div style={{fontSize:'13px',fontWeight:'600',color:'#6b7280',marginBottom:'16px'}}>Top 10 clients par CA</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={caParClientData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                label={({name, percent}) => `${name.slice(0,8)} ${(percent*100).toFixed(0)}%`}
                labelLine={false} fontSize={10}>
                {caParClientData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: unknown) => `$${(v as number).toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{background:'#f9fafb',border:'1px solid #f3f4f6',borderRadius:'14px',padding:'20px'}}>
        <div style={{fontSize:'13px',fontWeight:'600',color:'#6b7280',marginBottom:'16px'}}>Top 10 produits les plus livrés</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProduitsData} layout="vertical" margin={{left:20}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis type="number" tick={{fontSize:12,fill:'#9ca3af'}} />
            <YAxis type="category" dataKey="produit" tick={{fontSize:11,fill:'#6b7280'}} width={140} />
            <Tooltip />
            <Bar dataKey="quantite" fill="#3b82f6" radius={[0,4,4,0]} name="Quantité nette" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
