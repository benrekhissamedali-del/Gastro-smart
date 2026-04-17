import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'

const categories = ['Entrées', 'Plats', 'Desserts', 'Boissons']

const plats = {
  'Entrées': [
    { id: 1, nom: 'Brick à l\'œuf', prix: 8, dispo: true },
    { id: 2, nom: 'Salade tunisienne', prix: 9, dispo: true },
    { id: 3, nom: 'Chorba', prix: 7, dispo: false },
  ],
  'Plats': [
    { id: 4, nom: 'Couscous royal', prix: 36, dispo: true },
    { id: 5, nom: 'Tajine agneau', prix: 34, dispo: true },
    { id: 6, nom: 'Merguez grillées', prix: 28, dispo: true },
    { id: 7, nom: 'Poisson grillé', prix: 32, dispo: false },
  ],
  'Desserts': [
    { id: 8, nom: 'Baklawa', prix: 6, dispo: true },
    { id: 9, nom: 'Zlabia', prix: 5, dispo: true },
  ],
  'Boissons': [
    { id: 10, nom: 'Eau minérale', prix: 2, dispo: true },
    { id: 11, nom: 'Jus frais', prix: 5, dispo: true },
    { id: 12, nom: 'Café', prix: 3, dispo: true },
  ],
}

export default function Menu() {
  const [categorie, setCategorie] = useState('Plats')

  return (
    <div className="p-4 pb-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-serif text-2xl text-[#d4a574]">Menu</h1>
        <button className="flex items-center gap-1.5 bg-[#d4a574] text-[#0a0a0a] text-sm font-semibold px-3 py-2 rounded-xl">
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategorie(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categorie === cat
                ? 'bg-[#d4a574] text-[#0a0a0a]'
                : 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {plats[categorie].map(plat => (
          <div key={plat.id} className="flex items-center bg-[#1a1a1a] rounded-2xl px-4 py-3 border border-[#2a2a2a]">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#f5f0e8]">{plat.nom}</p>
              <p className="text-[#d4a574] text-sm font-bold mt-0.5">{plat.prix} DT</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                plat.dispo
                  ? 'bg-green-900/40 text-green-400'
                  : 'bg-red-900/40 text-red-400'
              }`}>
                {plat.dispo ? 'Dispo' : 'Indispo'}
              </span>
              <button className="text-[#555] hover:text-[#d4a574] transition-colors">
                <Pencil size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
