import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Loader2,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle2,
  Truck,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { getOrderById, updateOrderStatus, getErrorMessage } from '../services/api';

/**
 * OrderDetails Page (/orders/:id) — Lab-06
 *
 * Shows full details of a single order.
 * Backend enforces ownership — users cannot read each other's orders.
 *
 * Bonus: Status progression control (PLACED → CONFIRMED → SHIPPED → DELIVERED).
 */
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You do not have permission to view this order.');
        } else {
          setError(getErrorMessage(err));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // ── Bonus: Status progression ──────────────────────────────────────────────
  const statusFlow = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  const handleProgressStatus = async () => {
    if (!order || updatingStatus) return;
    const currentIdx = statusFlow.indexOf(order.status);
    if (currentIdx === -1 || currentIdx === statusFlow.length - 1) return;

    const nextStatus = statusFlow[currentIdx + 1];
    try {
      setUpdatingStatus(true);
      setStatusError('');
      const data = await updateOrderStatus(order._id, nextStatus);
      setOrder(data.order);
    } catch (err) {
      setStatusError(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Status styles ──────────────────────────────────────────────────────────
  const statusConfig = {
    PENDING_PAYMENT: { cls: 'bg-amber-100 text-amber-700', icon: <Clock className="w-4 h-4" /> },
    PLACED: { cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-4 h-4" /> },
    CONFIRMED: { cls: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 className="w-4 h-4" /> },
    SHIPPED: { cls: 'bg-violet-100 text-violet-700', icon: <Truck className="w-4 h-4" /> },
    DELIVERED: { cls: 'bg-teal-100 text-teal-700', icon: <CheckCircle2 className="w-4 h-4" /> },
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
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
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status] || statusConfig.PLACED;
  const canProgress =
    statusFlow.includes(order.status) &&
    statusFlow.indexOf(order.status) < statusFlow.length - 1;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-indigo-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white border border-slate-200/80 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Details</h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              #{order._id.slice(-12).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

          {/* Status bar */}
          <div className={`flex items-center justify-between p-4 ${config.cls.replace('text-', 'border-').replace('bg-', 'bg-').split(' ')[0]}/30`}>
            <div className={`flex items-center gap-2 font-bold text-sm ${config.cls.split(' ')[1]}`}>
              {config.icon}
              <span>{order.status.replace('_', ' ')}</span>
            </div>
            <div className="text-xs text-slate-400">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </div>
          </div>

          {/* ── Bonus: Status progression ────────────────────────────────── */}
          {canProgress && order.paymentStatus === 'PAID' && (
            <div className="px-4 pb-3 pt-1 bg-indigo-50/50 border-b border-indigo-100">
              <div className="flex items-center justify-between">
                <p className="text-xs text-indigo-600 font-medium">
                  Next: {statusFlow[statusFlow.indexOf(order.status) + 1]}
                </p>
                <button
                  onClick={handleProgressStatus}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {updatingStatus ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Truck className="w-3 h-3" />
                  )}
                  Progress Status
                </button>
              </div>
              {statusError && (
                <p className="text-xs text-red-500 mt-1">{statusError}</p>
              )}
            </div>
          )}

          {/* Items */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-bold text-slate-800">Items</p>
            </div>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.image && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-800">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-400">Snapshot price</p>
                  </div>
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
              <p className="flex items-center gap-1.5 mt-1 text-slate-500">
                <Phone className="w-3.5 h-3.5" />
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Payment info */}
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-bold text-slate-800">Payment</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <p className={`font-semibold mt-0.5 ${order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.paymentStatus}
                </p>
              </div>
              {order.razorpayPaymentId && (
                <div>
                  <p className="text-xs text-slate-400">Payment ID</p>
                  <p className="font-mono text-xs text-slate-600 mt-0.5 truncate">{order.razorpayPaymentId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="p-5 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500">Order Total</span>
            <span className="text-xl font-extrabold text-slate-900">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            ← All Orders
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop More
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
