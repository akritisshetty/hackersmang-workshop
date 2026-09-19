import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api.js';
import { useAuth } from './AuthContext.jsx';
import { cartCount, cartTotal } from '../utils/format.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [readyFor, setReadyFor] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async (userId) => {
    setError('');
    try {
      const data = await api.getCart();
      setCart(data);
      setReadyFor(userId);
    } catch {
      setError('Unable to load your cart. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setCart([]);
      setError('');
      setReadyFor(null);
      return;
    }
    load(user.id);
  }, [user, load]);

  const ready = Boolean(user) && readyFor === user.id;
  const loading = Boolean(user) && !ready && !error;

  const addItem = useCallback(async (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          quantity: 1,
        },
      ];
    });
    try {
      const { cart: next } = await api.addToCart(item.id);
      setCart(next);
      setError('');
    } catch {
      setError('Unable to update the cart. Please try again.');
    }
  }, []);

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      setCart((prev) => prev.map((i) => (i.itemId === itemId ? { ...i, quantity } : i)));
      try {
        const { cart: next } = await api.updateCartItem(itemId, quantity);
        setCart(next);
        setError('');
      } catch {
        setError('Unable to update the cart. Please try again.');
        if (user) load(user.id);
      }
    },
    [load, user],
  );

  const removeItem = useCallback(
    async (itemId) => {
      setCart((prev) => prev.filter((i) => i.itemId !== itemId));
      try {
        const { cart: next } = await api.removeCartItem(itemId);
        setCart(next);
        setError('');
      } catch {
        setError('Unable to remove this item. Please try again.');
        if (user) load(user.id);
      }
    },
    [load, user],
  );

  const clearCart = useCallback(async () => {
    setCart([]);
    try {
      const { cart: next } = await api.clearCart();
      setCart(next);
      setError('');
    } catch {
      setError('Unable to update the cart. Please try again.');
      if (user) load(user.id);
    }
  }, [load, user]);

  const reload = useCallback(() => {
    if (user) load(user.id);
  }, [load, user]);

  const count = useMemo(() => cartCount(cart), [cart]);
  const total = useMemo(() => cartTotal(cart), [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        total,
        loading,
        error,
        reload,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}