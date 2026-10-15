import React, { useState } from 'react';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getErrorMessage } from '../services/api';

/**
 * CartItem — displays a single cart row with quantity controls.
 *
 * Props:
 *   item: { product: { _id, name, price, image, stock, category }, quantity }
 *
 * Quantity controls:
 *   [-]  quantity  [+]
 *   + → increment (capped at product.stock)
 *   - → decrement (minimum 1; use Remove button to delete)
 *   Remove → deletes item from cart entirely
 */
const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  const [updating, setUpdating] = useState(false);  // quantity update in flight
  const [removing, setRemoving] = useState(false);  // remove in flight
  const [itemError, setItemError] = useState('');

  const itemSubtotal = (product?.price ?? 0) * quantity;

  // ── Quantity controls ───────────────────────────────────────────────────────
  const handleDecrement = async () => {
    if (updating || removing || quantity <= 1) return;
    try {
      setUpdating(true);
      setItemError('');
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      setItemError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleIncrement = async () => {
    if (updating || removing) return;
    if (quantity >= product.stock) {
      setItemError(`Only ${product.stock} unit(s) in stock`);
      return;
    }
    try {
      setUpdating(true);
      setItemError('');
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      setItemError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (updating || removing) return;
    try {
      setRemoving(true);
      setItemError('');
      await removeFromCart(product._id);
      // CartContext updates cartItems — this component will unmount automatically
    } catch (err) {
      setItemError(getErrorMessage(err));
      setRemoving(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      {/* Product image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
        <img
          src={product?.image}
          alt={product?.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/200x200/e2e8f0/64748b?text=No+Image';
          }}
        />
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
          {product?.name}
        </p>
        <p className="text-sm font-semibold text-indigo-600 mt-0.5">
          ₹{product?.price?.toLocaleString('en-IN')}
          <span className="text-xs font-normal text-slate-400 ml-1">per unit</span>
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            {/* Decrement */}
            <button
              onClick={handleDecrement}
              disabled={updating || removing || quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-md text-slate-700 hover:bg-white hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-lg font-bold"
              title="Decrease quantity"
              aria-label="Decrease quantity"
            >
              −
            </button>

            {/* Quantity display */}
            <span className="w-8 text-center text-sm font-bold text-slate-900 tabular-nums">
              {updating ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500 mx-auto" />
              ) : (
                quantity
              )}
            </span>

            {/* Increment */}
            <button
              onClick={handleIncrement}
              disabled={updating || removing || quantity >= product?.stock}
              className="w-8 h-8 flex items-center justify-center rounded-md text-slate-700 hover:bg-white hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-lg font-bold"
              title="Increase quantity"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Remove button */}
          <button
            onClick={handleRemove}
            disabled={updating || removing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/70 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {removing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {removing ? 'Removing...' : 'Remove'}
          </button>
        </div>

        {/* Per-item error */}
        {itemError && (
          <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {itemError}
          </p>
        )}
      </div>

      {/* Item subtotal */}
      <div className="shrink-0 text-right">
        <p className="text-base font-extrabold text-slate-900">
          ₹{itemSubtotal.toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {quantity} × ₹{product?.price?.toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
