import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Loader2,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { getMyOrders, getErrorMessage } from '../services/api';
import OrderCard from '../components/OrderCard';

/**
 * Orders Page (/orders) — Task 8 (Lab-06)
 *
 * Displays all of the authenticated user's orders, sorted newest-first.
 * Handles loading, empty and error states.
 */
const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', {
          replace: true,
          state: { message: 'Please log in to view your orders.' },
        });
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Unable to load orders</p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center">
            <Package className="w-12 h-12 text-indigo-300" />
          </div>
          <div className="space-y-1.5">
            <p className="text-2xl font-bold text-slate-800">No orders yet</p>
            <p className="text-slate-500 text-sm max-w-xs">
              You have not placed any orders yet. Browse products and start shopping!
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-md active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  // ── Orders List ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-indigo-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{orders.length}</span>{' '}
                {orders.length === 1 ? 'order' : 'orders'} placed
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop More
          </button>
        </div>

        {/* Orders grid */}
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
