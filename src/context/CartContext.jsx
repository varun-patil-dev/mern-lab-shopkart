import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
  getErrorMessage,
} from '../services/api';

/**
 * CartContext — Task 6 (Lab-05)
 *
 * Global cart state shared across:
 *   - ProductCard  (Add to Cart button)
 *   - CartPage     (quantity controls, remove, order summary)
 *   - Navbar       (cart count badge)
 *
 * Derived values (subtotal, totalItems) are computed from cartItems
 * and never stored in MongoDB.
 */

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  // ── Derived values ────────────────────────────────────────────────────────
  // Total number of individual units (Keyboard×2 + Mouse×1 = 3)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Subtotal = Σ(product.price × quantity)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  // ── Fetch cart from backend ───────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    try {
      setCartLoading(true);
      setCartError('');
      const data = await apiGetCart();
      setCartItems(data.cart || []);
    } catch (err) {
      setCartError(getErrorMessage(err));
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart on mount and when auth state changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Clear cart on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems([]);
      setCartError('');
    }
  }, [isAuthenticated]);

  // ── Add to cart ───────────────────────────────────────────────────────────
  /**
   * Adds a product to the cart (or increments quantity if already present).
   * @param {string} productId
   * @returns {Promise<{ success: boolean, message?: string }>}
   */
  const addToCart = async (productId) => {
    const data = await apiAddToCart(productId);
    setCartItems(data.cart || []);
    return data;
  };

  // ── Update quantity ───────────────────────────────────────────────────────
  /**
   * Sets a specific quantity for a cart item.
   * @param {string} productId
   * @param {number} quantity
   */
  const updateQuantity = async (productId, quantity) => {
    const data = await apiUpdateCartQuantity(productId, quantity);
    setCartItems(data.cart || []);
    return data;
  };

  // ── Remove from cart ──────────────────────────────────────────────────────
  /**
   * Removes an item from the cart entirely.
   * @param {string} productId
   */
  const removeFromCart = async (productId) => {
    const data = await apiRemoveFromCart(productId);
    setCartItems(data.cart || []);
    return data;
  };

  // ── Convenience helpers ───────────────────────────────────────────────────
  /**
   * Returns true if the given productId is already in the cart.
   */
  const isInCart = (productId) =>
    cartItems.some((item) => item.product?._id === productId);

  /**
   * Returns the cart item for a given productId, or undefined.
   */
  const getCartItem = (productId) =>
    cartItems.find((item) => item.product?._id === productId);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        totalItems,
        subtotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        isInCart,
        getCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
