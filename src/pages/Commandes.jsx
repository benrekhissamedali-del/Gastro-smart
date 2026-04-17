import { useState } from 'react'
import { CheckCircle, Clock, ChefHat } from 'lucide-react'

const commandes = [
  {
    id: 'CMD-034',
    table: 3,
    heure: '20:42',
    statut: 'en_cours',
    items: ['Couscous royal x2', 'Brick à l\'œuf x1', 'Jus frais x2'],
    total: 97,
  },
  {
    id: 'CMD-033',
    table: 2,
    heure: '20:35',
    statut: 'pret',
    items: ['Tajine agneau x1', 'Salade tunisienne x1'],
    total: 43,
  },
  {
    id: 'CMD-032',
    table: 6,
    heure: '20:20',
    statut: 'servi',
    items: ['Merguez grillées x2', 'Baklawa x2', 'Café x2'],
    total: 62,
  },
  {
    id: 'CMD-031',
    table: 1,
    heure: '20:10',
    statut: 'servi',
    items: ['Couscous royal x3', 'Eau minérale x3'],
    total: 114,
  },
]

const statutConfig = {
  en_cours: { label: 'En cuisine', icon: ChefHat, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  pret: { label: 'Prêt', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/30' },
  servi: { label: 'Servi', icon: CheckCircle, color: 'text-[#555]', bg: 'bg-[#1f1f1f]' },
}

export default function Commandes() {
  const [filtre, setFiltre] = useState('tous')

  const filtrees = filtre === 'tous'
    ? commandes
    : commandes.filter(c => c.statut === filtre)

  return (
    <div className="p-4 pb-6">
      <h1 className="font-serif text-2xl text-[#d4a574] mb-5">Commandes</h1>

      <div className="flex gap-2 mb-5">
        {[
          { id: 'tous', label: 'Toutes' },
          { id: 'en_cours', label: 'En cuisine' },
          { id: 'pret', label: 'Prêt' },
          { id: 'servi', label: 'Servi' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFiltre(f.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
              filtre === f.id
                ? 'bg-[#d4a574] text-[#0a0a0a]'
                : 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtrees.map(cmd => {
          const cfg = statutConfig[cmd.statut]
          const Icon = cfg.icon
          return (
            <div key={cmd.id} className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{cmd.id}</span>
                  <span className="text-xs text-[#888] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
                    Table {cmd.table}
                  </span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                  <Icon size={12} />
                  {cfg.label}
                </div>
              </div>

              <div className="space-y-0.5 mb-3">
                {cmd.items.map((item, i) => (
                  <p key={i} className="text-xs text-[#888]">• {item}</p>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-[#666]">
                  <Clock size={12} />
                  {cmd.heure}
                </div>
                <span className="text-[#d4a574] font-bold">{cmd.total} DT</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
