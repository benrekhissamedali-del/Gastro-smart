const KEYS = {
  PRODUCTS: 'gs_products',
  MOVEMENTS: 'gs_movements',
  SUPPLIERS: 'gs_suppliers',
  RECIPES: 'gs_recipes',
  SALES: 'gs_sales',
  USERS: 'gs_users',
  SESSION: 'gs_session',
  SEEDED: 'gs_seeded',
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const now = () => new Date().toISOString();
const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const readOne = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const write = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const db = {
  products: {
    getAll: () => read(KEYS.PRODUCTS),
    save: (item) => {
      const items = read(KEYS.PRODUCTS);
      if (item.id) {
        const updated = items.map(i => i.id === item.id ? { ...i, ...item, updatedAt: now() } : i);
        write(KEYS.PRODUCTS, updated);
        return updated.find(i => i.id === item.id);
      }
      const newItem = { ...item, id: uid(), createdAt: now(), updatedAt: now() };
      write(KEYS.PRODUCTS, [...items, newItem]);
      return newItem;
    },
    delete: (id) => write(KEYS.PRODUCTS, read(KEYS.PRODUCTS).filter(i => i.id !== id)),
    getById: (id) => read(KEYS.PRODUCTS).find(i => i.id === id),
  },

  movements: {
    getAll: () => read(KEYS.MOVEMENTS),
    add: (movement) => {
      const items = read(KEYS.MOVEMENTS);
      const newItem = { ...movement, id: uid(), date: now() };
      write(KEYS.MOVEMENTS, [newItem, ...items]);
      return newItem;
    },
    getByProduct: (productId) => read(KEYS.MOVEMENTS).filter(m => m.productId === productId),
  },

  suppliers: {
    getAll: () => read(KEYS.SUPPLIERS),
    save: (item) => {
      const items = read(KEYS.SUPPLIERS);
      if (item.id) {
        const updated = items.map(i => i.id === item.id ? { ...i, ...item } : i);
        write(KEYS.SUPPLIERS, updated);
        return updated.find(i => i.id === item.id);
      }
      const newItem = { ...item, id: uid(), createdAt: now() };
      write(KEYS.SUPPLIERS, [...items, newItem]);
      return newItem;
    },
    delete: (id) => write(KEYS.SUPPLIERS, read(KEYS.SUPPLIERS).filter(i => i.id !== id)),
  },

  recipes: {
    getAll: () => read(KEYS.RECIPES),
    save: (item) => {
      const items = read(KEYS.RECIPES);
      if (item.id) {
        const updated = items.map(i => i.id === item.id ? { ...i, ...item, updatedAt: now() } : i);
        write(KEYS.RECIPES, updated);
        return updated.find(i => i.id === item.id);
      }
      const newItem = { ...item, id: uid(), createdAt: now(), updatedAt: now() };
      write(KEYS.RECIPES, [...items, newItem]);
      return newItem;
    },
    delete: (id) => write(KEYS.RECIPES, read(KEYS.RECIPES).filter(i => i.id !== id)),
  },

  sales: {
    getAll: () => read(KEYS.SALES),
    add: (sale) => {
      const items = read(KEYS.SALES);
      const newItem = { ...sale, id: uid(), date: sale.date || now() };
      write(KEYS.SALES, [newItem, ...items]);
      return newItem;
    },
    getByDateRange: (startDate, endDate) => {
      return read(KEYS.SALES).filter(s => {
        const d = new Date(s.date);
        return d >= new Date(startDate) && d <= new Date(endDate);
      });
    },
  },

  auth: {
    getUsers: () => read(KEYS.USERS),
    addUser: (user) => {
      const items = read(KEYS.USERS);
      if (items.some(u => u.email === user.email)) return null;
      const newItem = { ...user, id: uid(), role: user.role || 'employee', createdAt: now() };
      write(KEYS.USERS, [...items, newItem]);
      return newItem;
    },
    findUser: (email, password) => read(KEYS.USERS).find(u => u.email === email && u.password === password),
    getSession: () => readOne(KEYS.SESSION),
    setSession: (user) => localStorage.setItem(KEYS.SESSION, JSON.stringify(user)),
    clearSession: () => localStorage.removeItem(KEYS.SESSION),
  },
};

export function seedDemoData() {
  if (localStorage.getItem(KEYS.SEEDED)) return;
  localStorage.setItem(KEYS.SEEDED, '1');

  db.auth.addUser({ email: 'admin@gastrosmart.com', password: 'Admin123', name: 'Admin Chef', role: 'admin' });
  db.auth.addUser({ email: 'employe@gastrosmart.com', password: 'Employe123', name: 'Jean Martin', role: 'employee' });

  const prods = [
    { name: 'Rhum Havana Club 3 ans', category: 'boisson', unit: 'L', purchasePrice: 18.5, currentStock: 5, minimumStock: 2 },
    { name: 'Citron jaune', category: 'ingredient', unit: 'kg', purchasePrice: 2.5, currentStock: 3, minimumStock: 1 },
    { name: 'Menthe fraîche', category: 'ingredient', unit: 'kg', purchasePrice: 8, currentStock: 0.2, minimumStock: 0.3 },
    { name: 'Sucre de canne', category: 'ingredient', unit: 'kg', purchasePrice: 3, currentStock: 2, minimumStock: 0.5 },
    { name: 'Eau gazeuse Perrier', category: 'boisson', unit: 'L', purchasePrice: 0.8, currentStock: 10, minimumStock: 5 },
    { name: 'Poulet fermier', category: 'ingredient', unit: 'kg', purchasePrice: 12, currentStock: 2, minimumStock: 3 },
    { name: 'Crème fraîche épaisse', category: 'ingredient', unit: 'L', purchasePrice: 3.5, currentStock: 1, minimumStock: 1 },
    { name: 'Tagliatelles', category: 'ingredient', unit: 'kg', purchasePrice: 1.8, currentStock: 5, minimumStock: 2 },
    { name: 'Tomates cerises', category: 'ingredient', unit: 'kg', purchasePrice: 4, currentStock: 2, minimumStock: 1 },
    { name: 'Vodka Absolut', category: 'boisson', unit: 'L', purchasePrice: 22, currentStock: 3, minimumStock: 2 },
    { name: 'Jus de cranberry', category: 'boisson', unit: 'L', purchasePrice: 2.2, currentStock: 4, minimumStock: 2 },
    { name: 'Triple sec Cointreau', category: 'boisson', unit: 'L', purchasePrice: 24, currentStock: 1, minimumStock: 1 },
    { name: 'Sirop de fraise', category: 'ingredient', unit: 'L', purchasePrice: 5, currentStock: 0.5, minimumStock: 1 },
    { name: 'Gin Hendricks', category: 'boisson', unit: 'L', purchasePrice: 32, currentStock: 2, minimumStock: 1 },
    { name: 'Tonic Schweppes', category: 'boisson', unit: 'L', purchasePrice: 1.2, currentStock: 8, minimumStock: 4 },
  ].map(p => db.products.save(p));

  db.suppliers.save({
    name: 'Metro Cash & Carry',
    phone: '+33 1 23 45 67 89',
    email: 'pro@metro.fr',
    address: '123 Zone Commerciale, Paris 75015',
    productIds: prods.slice(0, 9).map(p => p.id),
    note: 'Livraison mardi et jeudi. Minimum commande 150€.',
  });

  db.suppliers.save({
    name: 'Vins & Spiritueux Pro',
    phone: '+33 4 56 78 90 12',
    email: 'commandes@vinspro.fr',
    address: '45 Route des Vins, Lyon 69000',
    productIds: [prods[0].id, prods[9].id, prods[11].id, prods[13].id],
    note: 'Minimum commande 200€. Paiement à 30 jours.',
  });

  db.suppliers.save({
    name: 'FoodService Direct',
    phone: '+33 5 67 89 01 23',
    email: 'contact@foodservice.fr',
    address: '78 Rue du Commerce, Bordeaux 33000',
    productIds: prods.slice(5, 9).map(p => p.id),
    note: 'Livraison J+1 avant 9h.',
  });

  const p = prods;
  const mojito = db.recipes.save({
    name: 'Mojito Classic',
    category: 'cocktail',
    description: 'Le grand classique cubain, frais et désaltérant',
    instructions: '1. Écraser la menthe avec le sucre dans un verre\n2. Presser le citron et ajouter le jus\n3. Verser le rhum\n4. Compléter avec l\'eau gazeuse et les glaçons\n5. Garnir de menthe fraîche et rondelle de citron',
    servings: 1,
    ingredients: [
      { productId: p[0].id, productName: p[0].name, quantity: 0.06, unit: 'L', unitCost: 18.5 },
      { productId: p[1].id, productName: p[1].name, quantity: 0.03, unit: 'kg', unitCost: 2.5 },
      { productId: p[2].id, productName: p[2].name, quantity: 0.008, unit: 'kg', unitCost: 8 },
      { productId: p[3].id, productName: p[3].name, quantity: 0.015, unit: 'kg', unitCost: 3 },
      { productId: p[4].id, productName: p[4].name, quantity: 0.1, unit: 'L', unitCost: 0.8 },
    ],
    costPrice: 1.36,
    sellingPrice: 9,
    margin: 7.64,
    foodCostPercent: 15.1,
  });

  const cosmo = db.recipes.save({
    name: 'Cosmopolitan',
    category: 'cocktail',
    description: 'Cocktail élégant à la vodka et cranberry',
    instructions: '1. Remplir le shaker de glace\n2. Verser vodka, triple sec, jus de citron et cranberry\n3. Shaker vigoureusement 15 secondes\n4. Filtrer dans un verre à martini refroidi\n5. Garnir d\'un zeste de citron',
    servings: 1,
    ingredients: [
      { productId: p[9].id, productName: p[9].name, quantity: 0.045, unit: 'L', unitCost: 22 },
      { productId: p[10].id, productName: p[10].name, quantity: 0.03, unit: 'L', unitCost: 2.2 },
      { productId: p[11].id, productName: p[11].name, quantity: 0.015, unit: 'L', unitCost: 24 },
      { productId: p[1].id, productName: p[1].name, quantity: 0.015, unit: 'kg', unitCost: 2.5 },
    ],
    costPrice: 1.49,
    sellingPrice: 12,
    margin: 10.51,
    foodCostPercent: 12.4,
  });

  const gin = db.recipes.save({
    name: 'Gin Tonic Hendricks',
    category: 'cocktail',
    description: 'Gin premium avec tonic et concombre',
    instructions: '1. Remplir un grand verre de glaçons\n2. Verser le gin\n3. Compléter avec le tonic froid\n4. Mélanger délicatement\n5. Garnir de concombre et poivre rose',
    servings: 1,
    ingredients: [
      { productId: p[13].id, productName: p[13].name, quantity: 0.05, unit: 'L', unitCost: 32 },
      { productId: p[14].id, productName: p[14].name, quantity: 0.15, unit: 'L', unitCost: 1.2 },
    ],
    costPrice: 1.78,
    sellingPrice: 13,
    margin: 11.22,
    foodCostPercent: 13.7,
  });

  const pasta = db.recipes.save({
    name: 'Tagliatelles Poulet Crème',
    category: 'plat',
    description: 'Pâtes fraîches au poulet fermier et crème fraîche',
    instructions: '1. Cuire les tagliatelles al dente (8 min)\n2. Faire revenir le poulet en dés dans du beurre\n3. Déglacer avec un peu de bouillon de volaille\n4. Ajouter la crème fraîche, sel, poivre, herbes\n5. Mélanger avec les pâtes égouttées\n6. Dresser avec tomates cerises et parmesan',
    servings: 1,
    ingredients: [
      { productId: p[5].id, productName: p[5].name, quantity: 0.15, unit: 'kg', unitCost: 12 },
      { productId: p[6].id, productName: p[6].name, quantity: 0.08, unit: 'L', unitCost: 3.5 },
      { productId: p[7].id, productName: p[7].name, quantity: 0.12, unit: 'kg', unitCost: 1.8 },
      { productId: p[8].id, productName: p[8].name, quantity: 0.05, unit: 'kg', unitCost: 4 },
    ],
    costPrice: 2.37,
    sellingPrice: 16,
    margin: 13.63,
    foodCostPercent: 14.8,
  });

  const allRecipes = [mojito, cosmo, gin, pasta];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    allRecipes.forEach((recipe) => {
      const qty = Math.floor(Math.random() * 14) + 4;
      const items = read(KEYS.SALES);
      write(KEYS.SALES, [...items, {
        id: uid(),
        recipeId: recipe.id,
        recipeName: recipe.name,
        quantity: qty,
        unitPrice: recipe.sellingPrice,
        totalRevenue: qty * recipe.sellingPrice,
        date: d.toISOString(),
        userId: 'admin',
      }]);
    });
  }
}
