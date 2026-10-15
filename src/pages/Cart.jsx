import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  ShoppingBag,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

/**
 * Cart Page (/cart)  — Task 8 (Lab-05)
 *
 * Displays the current user's shopping cart with:
 *   - All cart items via CartItem components (quantity controls, remove)
 *   - Order Summary (item count, subtotal)
 *   - Loading, empty and error states
 *
 * Cart state comes from CartContext — no local fetch needed.
 */
const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartLoading, cartError, totalItems, subtotal, fetchCart } = useCart();

  // ── Loading State ─────────────────────────────────────────────────────────
  if (cartLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (cartError) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Unable to load your cart.</p>
            <p className="text-sm text-slate-500 mt-1">
              Something went wrong while fetching your cart.
            </p>
          </div>
          <button
            onClick={fetchCart}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty State ───────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-indigo-300" />
          </div>
          <div className="space-y-1.5">
            <p className="text-2xl font-bold text-slate-800">Your cart is empty 🛒</p>
            <p className="text-slate-500 text-sm max-w-xs">
              Looks like you haven't added anything yet.
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // ── Cart Page ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-indigo-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Cart</h1>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{totalItems}</span>{' '}
              {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Cart Items List ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <CartItem key={item.product?._id} item={item} />
            ))}
          </div>

          {/* ── Order Summary Sidebar ───────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-indigo-500" />
                <h2 className="text-base font-bold text-slate-900">Order Summary</h2>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Items</span>
                  <span className="font-semibold text-slate-800">{totalItems}</span>
                </div>

                {/* Per-item breakdown */}
                {cartItems.map((item) => (
                  <div
                    key={item.product?._id}
                    className="flex justify-between text-xs text-slate-400 pl-2"
                  >
                    <span className="truncate max-w-[60%]">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span>
                      ₹{((item.product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}

                <div className="border-t border-slate-100 pt-2.5 mt-2">
                  <div className="flex justify-between text-base font-bold text-slate-900">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Taxes and shipping calculated at checkout
                  </p>
                </div>
              </div>

              {/* Proceed to Checkout — Lab-06 */}
              <button
                className="w-full mt-5 inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-indigo-500/30 cursor-pointer"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Continue shopping */}
              <button
                onClick={() => navigate('/products')}
                className="w-full mt-2.5 py-2 px-4 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
