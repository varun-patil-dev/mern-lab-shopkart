import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Loader2,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { getWishlist, getErrorMessage } from '../services/api';
import WishlistCard from '../components/WishlistCard';

/**
 * Wishlist Page (/wishlist)
 *
 * Fetches the current user's wishlist from GET /wishlist (protected).
 * Handles loading, empty and error states.
 * Removal is handled by WishlistCard — it calls onRemoved() which
 * filters the product out of local state without a page refresh.
 */
const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getWishlist();
      setWishlist(data.wishlist || []);
    } catch (err) {
      // If not authenticated, redirect to login
      if (err.response?.status === 401) {
        navigate('/login', {
          replace: true,
          state: { message: 'Please log in to view your wishlist.' },
        });
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /**
   * Called by WishlistCard after a successful DELETE.
   * Removes the product from local state — no full page refresh.
   */
  const handleProductRemoved = (productId) => {
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
  };

  // ── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-sm font-medium text-slate-600">
            Loading your wishlist...
          </p>
        </div>
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Something went wrong.</p>
            <p className="text-sm text-slate-500 mt-1">
              We couldn't load your wishlist.
            </p>
          </div>
          <button
            onClick={fetchWishlist}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-pink-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                My Wishlist
              </h1>
            </div>
            {wishlist.length > 0 && (
              <p className="text-sm text-slate-500 ml-11">
                <span className="font-bold text-slate-700">{wishlist.length}</span>{' '}
                product{wishlist.length !== 1 ? 's' : ''} saved
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </button>
        </div>

        {/* ── Empty State ─────────────────────────────────────────────────── */}
        {wishlist.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 gap-6 text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center">
                <Heart className="w-12 h-12 text-pink-300" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-2xl font-bold text-slate-800">
                Your wishlist is empty
              </p>
              <p className="text-slate-500 text-sm max-w-xs">
                Save products you love and find them here later.
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
        )}

        {/* ── Wishlist Grid ────────────────────────────────────────────────── */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemoved={handleProductRemoved}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
