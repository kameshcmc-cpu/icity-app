import { createContext, useContext, useState } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('icity_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('icity_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  async function loginWithGoogle(credential) {
    setLoading(true);
    try {
      const { data } = await authApi.post('/google', { credential });
      localStorage.setItem('icity_token', data.token);
      localStorage.setItem('icity_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('icity_token');
    localStorage.removeItem('icity_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
