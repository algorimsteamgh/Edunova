import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('learnsphere_token');
    const storedUser = localStorage.getItem('learnsphere_user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify with /me
        authApi
          .me()
          .then((res) => {
            const fetchedUser = res.data.data.user;
            setUser(fetchedUser);
            localStorage.setItem('learnsphere_user', JSON.stringify(fetchedUser));
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
    localStorage.setItem('learnsphere_token', token);
    localStorage.setItem('learnsphere_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (fullName, email, password) => {
    const res = await authApi.register({ fullName, email, password });
    const { user: userData, token } = res.data.data;
    localStorage.setItem('learnsphere_token', token);
    localStorage.setItem('learnsphere_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('learnsphere_token');
    localStorage.removeItem('learnsphere_user');
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
