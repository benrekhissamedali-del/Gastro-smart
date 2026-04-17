import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const stats = [
  { label: 'Chiffre du jour', value: '1 840 DT', icon: DollarSign, trend: '+12%' },
  { label: 'Commandes', value: '34', icon: ShoppingBag, trend: '+5' },
  { label: 'Clients', value: '87', icon: Users, trend: '+8' },
  { label: 'Ticket moyen', value: '54 DT', icon: TrendingUp, trend: '+3%' },
]

const weekData = [
  { jour: 'Lun', ca: 1200 },
  { jour: 'Mar', ca: 1800 },
  { jour: 'Mer', ca: 1400 },
  { jour: 'Jeu', ca: 2100 },
  { jour: 'Ven', ca: 2600 },
  { jour: 'Sam', ca: 3100 },
  { jour: 'Dim', ca: 1840 },
]

export default function Dashboard() {
  return (
    <div className="p-4 pb-6">
      <div className="mb-6">
        <p className="text-[#888] text-sm">Dimanche 17 Avril 2026</p>
        <h1 className="font-serif text-2xl text-[#d4a574] mt-1">RestoGest</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(({ label, value, icon: Icon, trend }) => (
          <div key={label} className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-2">
              <Icon size={18} className="text-[#d4a574]" />
              <span className="text-xs text-green-400">{trend}</span>
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-[#888] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
        <h2 className="text-sm font-semibold text-[#f5f0e8] mb-4">CA cette semaine</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekData} barSize={24}>
            <XAxis dataKey="jour" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#222', border: 'none', borderRadius: 8, color: '#f5f0e8', fontSize: 12 }}
              cursor={{ fill: '#ffffff10' }}
            />
            <Bar dataKey="ca" fill="#d4a574" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
        <h2 className="text-sm font-semibold text-[#f5f0e8] mb-3">Plats populaires</h2>
        {[
          { nom: 'Couscous royal', cmds: 18, ca: '648 DT' },
          { nom: 'Tajine agneau', cmds: 14, ca: '504 DT' },
          { nom: 'Brick à l\'œuf', cmds: 22, ca: '176 DT' },
        ].map(({ nom, cmds, ca }) => (
          <div key={nom} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
            <span className="text-sm text-[#f5f0e8]">{nom}</span>
            <div className="text-right">
              <p className="text-xs text-[#d4a574] font-semibold">{ca}</p>
              <p className="text-xs text-[#666]">{cmds} cmd</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
