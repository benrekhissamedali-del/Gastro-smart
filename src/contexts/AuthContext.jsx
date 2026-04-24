import { createContext, useContext, useState, useEffect } from 'react';
import { db, seedDemoData } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemoData();
    const session = db.auth.getSession();
    if (session) setUser(session);
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const found = db.auth.findUser(email.trim().toLowerCase(), password);
    if (!found) return { success: false, error: 'Email ou mot de passe incorrect' };
    const { password: _, ...safe } = found;
    db.auth.setSession(safe);
    setUser(safe);
    return { success: true };
  };

  const register = (name, email, password, role = 'employee') => {
    const newUser = db.auth.addUser({ name, email: email.trim().toLowerCase(), password, role });
    if (!newUser) return { success: false, error: 'Cet email est déjà utilisé' };
    const { password: _, ...safe } = newUser;
    db.auth.setSession(safe);
    setUser(safe);
    return { success: true };
  };

  const logout = () => {
    db.auth.clearSession();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
