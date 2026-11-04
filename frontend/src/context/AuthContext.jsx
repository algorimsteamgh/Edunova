import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'edunova_token';
const LEGACY_TOKEN_KEY = 'learnsphere_token';
const USER_KEY = 'edunova_user';
const LEGACY_USER_KEY = 'learnsphere_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify with /me
        authApi
          .me()
          .then((res) => {
            const fetchedUser = res.data.data.user;
            setUser(fetchedUser);
            localStorage.setItem(USER_KEY, JSON.stringify(fetchedUser));
            localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(fetchedUser));
          })
          .catch((err) => {
            // ponytail: only log out on explicit auth errors, not network drops when the backend is restarting. Upgrade path: exponential backoff retry worker.
            if (err.message && (err.message.includes('token') || err.message.includes('Unauthorized') || err.message.includes('401'))) {
              logout();
            }
          })
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: userData, token } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (fullName, email, password) => {
    const res = await authApi.register({ fullName, email, password });
    const { user: userData, token } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
