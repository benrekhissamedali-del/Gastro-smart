import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Recipes from './pages/Recipes';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (!user) return <Login />;

  const pages = {
    dashboard: <Dashboard />,
    stock: <Stock />,
    recipes: <Recipes />,
    suppliers: <Suppliers />,
    sales: <Sales />,
  };

  return (
    <div className="flex flex-col bg-neutral-950 text-white" style={{ height: '100dvh', overflow: 'hidden' }}>
      <Header page={page} />
      <main className="flex-1 overflow-hidden" style={{ overflowY: 'auto' }}>
        {pages[page]}
      </main>
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
