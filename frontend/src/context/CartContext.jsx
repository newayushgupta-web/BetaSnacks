import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, TAX_RATE } from '../utils/constants';

const CartContext = createContext(null);

const LS_KEY = 'bs_cart';

function readLocalCart() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalCart(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(Array.isArray(items) ? items : []));
  } catch {}
}

function extractItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.cart && Array.isArray(data.cart.items)) return data.cart.items;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => readLocalCart());
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load cart from server or local
  const loadCart = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const data = await cartService.getCart();
        const serverItems = extractItems(data);
        const local = readLocalCart();

        if (local.length > 0) {
          try {
            const merged = await cartService.syncCart(local);
            const mergedItems = extractItems(merged);
            setItems(mergedItems.length > 0 ? mergedItems : serverItems);
            localStorage.removeItem(LS_KEY);
          } catch {
            setItems(serverItems);
          }
        } else {
          setItems(serverItems);
        }
        setCoupon(data.coupon || data.cart?.coupon || null);
      } catch {
        setItems(readLocalCart());
      } finally {
        setLoading(false);
      }
    } else {
      setItems(readLocalCart());
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const persist = (newItems) => {
    const safe = Array.isArray(newItems) ? newItems : [];
    setItems(safe);
    if (!user) saveLocalCart(safe);
  };

  const addToCart = async (product, quantity = 1, customizations = {}) => {
    const pThumb = product.thumbnail || product.image || (product.images && product.images[0]) || '';
    const safeProductObj = {
      _id: product._id,
      name: product.name,
      thumbnail: pThumb,
      image: pThumb,
      price: product.price,
      isVeg: product.isVeg !== undefined ? product.isVeg : true,
    };

    if (user) {
      try {
        const data = await cartService.addToCart(product._id, quantity, customizations, {
          name: product.name,
          thumbnail: pThumb,
          price: product.price,
          isVeg: product.isVeg,
        });
        const serverItems = extractItems(data);
        if (serverItems.length > 0 && serverItems.some((i) => i.name || i.product?.name)) {
          setItems(serverItems);
        } else {
          // Local fallback with exact product details
          setItems((prev) => {
            const list = Array.isArray(prev) ? [...prev] : [];
            const idx = list.findIndex(
              (i) => (i.product?._id || i.product || i._id) === product._id
            );
            if (idx > -1) {
              list[idx].quantity += quantity;
            } else {
              list.push({
                _id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                product: safeProductObj,
                name: product.name,
                thumbnail: pThumb,
                image: pThumb,
                price: product.price,
                isVeg: product.isVeg,
                quantity,
                customizations,
              });
            }
            return list;
          });
        }
        toast.success(`${product.name} added to cart`);
      } catch (err) {
        toast.error(err.message || 'Failed to add to cart');
      }
    } else {
      const current = Array.isArray(items) ? items : [];
      const existing = current.find(
        (i) => (i.product?._id || i.product || i._id) === product._id
      );
      let newItems;
      if (existing) {
        newItems = current.map((i) =>
          (i.product?._id || i.product || i._id) === product._id
            ? { ...i, quantity: (i.quantity || 1) + quantity }
            : i
        );
      } else {
        newItems = [
          ...current,
          {
            _id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            product: safeProductObj,
            name: product.name,
            thumbnail: pThumb,
            image: pThumb,
            price: product.price,
            isVeg: product.isVeg,
            quantity,
            customizations,
          },
        ];
      }
      persist(newItems);
      toast.success(`${product.name} added to cart`);
    }
  };

  const removeFromCart = async (itemId) => {
    if (user) {
      try {
        const data = await cartService.removeFromCart(itemId);
        const serverItems = extractItems(data);
        setItems(serverItems);
      } catch (err) {
        toast.error(err.message || 'Failed to remove item');
      }
    } else {
      const current = Array.isArray(items) ? items : [];
      const newItems = current.filter((i) => i._id !== itemId && i.product?._id !== itemId);
      persist(newItems);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return removeFromCart(itemId);
    if (user) {
      try {
        const data = await cartService.updateQuantity(itemId, quantity);
        const serverItems = extractItems(data);
        setItems(serverItems);
      } catch (err) {
        toast.error(err.message || 'Failed to update quantity');
      }
    } else {
      const current = Array.isArray(items) ? items : [];
      const newItems = current.map((i) =>
        (i._id === itemId || i.product?._id === itemId) ? { ...i, quantity } : i
      );
      persist(newItems);
    }
  };

  const clearCart = async () => {
    if (user) {
      try { await cartService.clearCart(); } catch {}
    }
    persist([]);
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    if (!user) {
      toast.error('Please login to apply coupons');
      return;
    }
    try {
      const data = await cartService.applyCoupon(code);
      setCoupon(data.coupon || { code, discount: data.discount });
      toast.success('Coupon applied!');
    } catch (err) {
      toast.error(err.message || 'Invalid coupon code');
    }
  };

  const removeCoupon = async () => {
    if (user) {
      try { await cartService.removeCoupon(); } catch {}
    }
    setCoupon(null);
  };

  // Safe Computed values (GUARANTEED ARRAY)
  const safeItems = Array.isArray(items) ? items : [];
  const cartCount = safeItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
  const subtotal = safeItems.reduce((acc, i) => {
    const price = i.price || i.product?.price || 0;
    return acc + price * (i.quantity || 1);
  }, 0);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const tax = Math.round(subtotal * TAX_RATE);
  const couponDiscount = coupon
    ? coupon.type === 'percentage'
      ? Math.round(subtotal * (coupon.value / 100))
      : coupon.value || coupon.discount || 0
    : 0;
  const total = Math.max(0, subtotal + deliveryFee + tax - couponDiscount);

  return (
    <CartContext.Provider
      value={{
        items: safeItems,
        coupon,
        appliedCoupon: coupon,
        loading,
        cartCount,
        subtotal,
        deliveryFee,
        tax,
        couponDiscount,
        discount: couponDiscount,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
