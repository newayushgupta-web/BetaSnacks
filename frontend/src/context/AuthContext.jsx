import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bs_user');
      if (!stored || stored === 'undefined' || stored === 'null') return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await authService.getProfile();
      const u = data.user || data;
      setUser(u);
      localStorage.setItem('bs_user', JSON.stringify(u));
    } catch {
      localStorage.removeItem('bs_token');
      localStorage.removeItem('bs_user');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('bs_token');
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (email, password, name) => {
    const data = await authService.login(email, password, name);
    const token = data.token;
    const userData = data.user || data;
    localStorage.setItem('bs_token', token);
    localStorage.setItem('bs_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    const token = data.token;
    const userData = data.user || data;
    localStorage.setItem('bs_token', token);
    localStorage.setItem('bs_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('bs_token');
    localStorage.removeItem('bs_user');
    localStorage.removeItem('bs_cart');
    setUser(null);
    toast.success('Signed out successfully.');
    window.location.href = '/';
  };

  const updateProfile = async (formData) => {
    try {
      const data = await authService.updateProfile(formData);
      const updated = data.user || data;
      setUser(updated);
      localStorage.setItem('bs_user', JSON.stringify(updated));
      return updated;
    } catch (err) {
      // Optimistic update locally if network hiccup
      if (formData.addresses) {
        setUser((prev) => {
          const u = { ...prev, addresses: formData.addresses };
          localStorage.setItem('bs_user', JSON.stringify(u));
          return u;
        });
      }
      throw err;
    }
  };

  const addAddress = async (addrData) => {
    try {
      const res = await authService.addAddress(addrData);
      const updatedUser = res.user || { ...user, addresses: res.addresses || [...(user?.addresses || []), addrData] };
      setUser(updatedUser);
      localStorage.setItem('bs_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      // Local fallback
      const newAddr = { ...addrData, _id: `addr_${Date.now()}` };
      const updatedList = [...(user?.addresses || []), newAddr];
      const updatedUser = { ...user, addresses: updatedList };
      setUser(updatedUser);
      localStorage.setItem('bs_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const res = await authService.deleteAddress(addressId);
      const updatedUser = res.user || {
        ...user,
        addresses: (user?.addresses || []).filter((a) => String(a._id) !== String(addressId)),
      };
      setUser(updatedUser);
      localStorage.setItem('bs_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      const updatedList = (user?.addresses || []).filter((a) => String(a._id) !== String(addressId));
      const updatedUser = { ...user, addresses: updatedList };
      setUser(updatedUser);
      localStorage.setItem('bs_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile,
        addAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
