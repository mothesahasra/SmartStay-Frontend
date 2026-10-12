import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch { /* corrupted */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (data.success && data.data) {
      const { accessToken, refreshToken, user: userProfile } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
      toast.success(`Welcome back, ${userProfile.name || userProfile.email}!`);
      return userProfile;
    }
    throw new Error(data.message || 'Login failed');
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    if (data.success && data.data) {
      const { accessToken, refreshToken, user: userProfile } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
      toast.success('Account created successfully!');
      return userProfile;
    }
    throw new Error(data.message || 'Registration failed');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await userAPI.getProfile();
      if (data.success && data.data) {
        localStorage.setItem('user', JSON.stringify(data.data));
        setUser(data.data);
      }
    } catch { /* silent */ }
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isGuest = user?.role === 'GUEST';

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, refreshProfile,
      isAuthenticated, isAdmin, isManager, isGuest,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
