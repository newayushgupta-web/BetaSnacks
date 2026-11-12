import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

const extractProducts = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.items)) return data.items;
  if (data.wishlist) {
    if (Array.isArray(data.wishlist)) return data.wishlist;
    if (Array.isArray(data.wishlist.products)) return data.wishlist.products;
    if (Array.isArray(data.wishlist.items)) return data.wishlist.items;
  }
  return [];
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get('/wishlist');
      setWishlist(extractProducts(data));
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const addToWishlist = async (product) => {
    if (!user) {
      toast.error('Please login to save items');
      return;
    }
    try {
      const data = await api.post('/wishlist', { productId: product._id });
      setWishlist(extractProducts(data));
      toast.success('Added to wishlist');
    } catch (err) {
      toast.error(err.message || 'Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const data = await api.delete(`/wishlist/${productId}`);
      setWishlist(extractProducts(data));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error(err.message || 'Failed to remove');
    }
  };

  const isInWishlist = (productId) => {
    const list = Array.isArray(wishlist) ? wishlist : [];
    return list.some((i) => (i?._id || i?.product?._id || i?.product) === productId);
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      toast.error('Please login to save items');
      return;
    }
    try {
      const data = await api.post('/wishlist/toggle', { productId: product._id });
      setWishlist(extractProducts(data));
      if (data.action === 'removed' || isInWishlist(product._id)) {
        toast.success('Removed from wishlist');
      } else {
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update wishlist');
    }
  };

  const safeList = Array.isArray(wishlist) ? wishlist : [];

  return (
    <WishlistContext.Provider
      value={{
        wishlist: safeList,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        inWishlist: isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}