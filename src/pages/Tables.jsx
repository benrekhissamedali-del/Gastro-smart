import { useState } from 'react'
import { Users, Clock } from 'lucide-react'

const initialTables = [
  { id: 1, statut: 'libre', couverts: 4, commande: null },
  { id: 2, statut: 'occupee', couverts: 2, commande: { total: 87, heure: '19:30' } },
  { id: 3, statut: 'occupee', couverts: 6, commande: { total: 215, heure: '19:15' } },
  { id: 4, statut: 'reservee', couverts: 4, commande: { heure: '21:00' } },
  { id: 5, statut: 'libre', couverts: 2, commande: null },
  { id: 6, statut: 'occupee', couverts: 4, commande: { total: 142, heure: '20:00' } },
  { id: 7, statut: 'libre', couverts: 8, commande: null },
  { id: 8, statut: 'reservee', couverts: 2, commande: { heure: '20:30' } },
]

const statutConfig = {
  libre: { label: 'Libre', bg: 'bg-[#1a2a1a]', border: 'border-green-800', dot: 'bg-green-400', text: 'text-green-400' },
  occupee: { label: 'Occupée', bg: 'bg-[#2a1a10]', border: 'border-[#d4a574]', dot: 'bg-[#d4a574]', text: 'text-[#d4a574]' },
  reservee: { label: 'Réservée', bg: 'bg-[#1a1a2a]', border: 'border-blue-700', dot: 'bg-blue-400', text: 'text-blue-400' },
}

export default function Tables() {
  const [tables] = useState(initialTables)
  const libre = tables.filter(t => t.statut === 'libre').length
  const occupee = tables.filter(t => t.statut === 'occupee').length

  return (
    <div className="p-4 pb-6">
      <h1 className="font-serif text-2xl text-[#d4a574] mb-1">Tables</h1>
      <p className="text-[#888] text-sm mb-5">{occupee} occupées · {libre} libres</p>

      <div className="grid grid-cols-2 gap-3">
        {tables.map(table => {
          const cfg = statutConfig[table.statut]
          return (
            <div
              key={table.id}
              className={`rounded-2xl p-4 border ${cfg.bg} ${cfg.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-white">Table {table.id}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              </div>

              <div className="flex items-center gap-1 text-[#888] text-xs mb-1">
                <Users size={12} />
                <span>{table.couverts} couverts</span>
              </div>

              {table.commande?.heure && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  <Clock size={12} className={cfg.text} />
                  <span className={cfg.text}>{table.commande.heure}</span>
                </div>
              )}

              {table.commande?.total && (
                <p className="text-sm font-semibold text-[#d4a574] mt-2">{table.commande.total} DT</p>
              )}

              <p className={`text-xs mt-2 font-medium ${cfg.text}`}>{cfg.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
