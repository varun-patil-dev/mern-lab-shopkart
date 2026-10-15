import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  Loader2,
  AlertCircle,
  MapPin,
  CreditCard,
  Phone,
} from 'lucide-react';
import { getOrderById, getErrorMessage } from '../services/api';

/**
 * Order Success Page (/order-success/:id) — Task 6 (Lab-06)
 *
 * Shown after Razorpay payment is verified and the order is PLACED.
 * Fetches the confirmed order from the backend to display details.
 */
const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        if (data.order?.paymentStatus !== 'PAID' || data.order?.status === 'PENDING_PAYMENT') {
          setError('Payment has not been confirmed for this order yet.');
        } else {
          setOrder(data.order);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Order not found</p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  // Status badge styles
  const statusColors = {
    PLACED: 'bg-emerald-100 text-emerald-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-violet-100 text-violet-700',
    DELIVERED: 'bg-teal-100 text-teal-700',
    PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/60 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">

        {/* ── Success Banner ──────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Thank you for shopping with ShopKart. Your order has been confirmed.
          </p>
        </div>

        {/* ── Order Details Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

          {/* Order meta */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Order ID</p>
                <p className="text-sm font-mono font-bold text-slate-800 break-all">{order._id}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 text-xs font-bold rounded-full ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
                {order.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Date</p>
                <p className="font-semibold text-slate-700">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Payment</p>
                <p className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-bold text-slate-800">Items Ordered</p>
            </div>
            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.image && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-800 shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-bold text-slate-800">Delivery Address</p>
            </div>
            <div className="text-sm text-slate-600 space-y-0.5">
              <p className="font-semibold text-slate-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
              </p>
              <p className="flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="p-5 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CreditCard className="w-4 h-4" />
              <span>Total Paid</span>
            </div>
            <span className="text-xl font-extrabold text-slate-900">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer text-center"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-all cursor-pointer text-center flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
