import { useState } from 'react';
import { ChefHat, Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    if (mode === 'login') {
      const res = login(form.email, form.password);
      if (!res.success) setError(res.error);
    } else {
      if (!form.name.trim()) { setError('Le nom est requis'); setLoading(false); return; }
      if (form.password.length < 6) { setError('Mot de passe: minimum 6 caractères'); setLoading(false); return; }
      const res = register(form.name, form.email, form.password, form.role);
      if (!res.success) setError(res.error);
    }
    setLoading(false);
  };

  const fillDemo = () => {
    setForm(f => ({ ...f, email: 'admin@gastrosmart.com', password: 'Admin123' }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center px-6 pb-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-4">
            <ChefHat size={40} className="text-black" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">GastroSmart</h1>
          <p className="text-sm text-neutral-500 mt-1">Gestion professionnelle restaurant & bar</p>
        </div>

        {/* Toggle mode */}
        <div className="flex bg-neutral-900 rounded-2xl p-1 mb-6 border border-neutral-800">
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === m ? 'bg-emerald-500 text-black shadow-lg' : 'text-neutral-400'
              }`}
            >
              {m === 'login' ? 'Connexion' : 'Créer un compte'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <div>
              <label className="label">Nom complet</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  className="input-dark pl-10"
                  type="text"
                  placeholder="Jean Dupont"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                className="input-dark pl-10"
                type="email"
                placeholder="chef@restaurant.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                className="input-dark pl-10 pr-12"
                type={showPwd ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Minimum 6 caractères' : '••••••••'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="label">Rôle</label>
              <select
                className="input-dark"
                value={form.role}
                onChange={e => set('role', e.target.value)}
              >
                <option value="employee">Employé</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Se connecter' : 'Créer le compte'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        {mode === 'login' && (
          <button
            onClick={fillDemo}
            className="w-full mt-4 text-center text-xs text-neutral-600 hover:text-neutral-400 transition-colors py-2"
          >
            Utiliser les identifiants démo →
          </button>
        )}

        <div className="mt-6 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Compte démo</p>
          <p className="text-xs text-neutral-400">📧 admin@gastrosmart.com</p>
          <p className="text-xs text-neutral-400">🔒 Admin123</p>
        </div>
      </div>
    </div>
  );
}
