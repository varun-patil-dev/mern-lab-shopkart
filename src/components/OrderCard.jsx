import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

/**
 * OrderCard — displays a single order summary row on the Orders page.
 *
 * Props:
 *   order: {
 *     _id, status, paymentStatus, totalAmount, createdAt,
 *     items: [{ name, quantity, price, image }],
 *     shippingAddress: { fullName, city, state }
 *   }
 *
 * Bonus: Displays status badge with colour coding.
 */
const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  const statusConfig = {
    PENDING_PAYMENT: {
      label: 'Pending Payment',
      cls: 'bg-amber-100 text-amber-700',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    PLACED: {
      label: 'Placed',
      cls: 'bg-emerald-100 text-emerald-700',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    CONFIRMED: {
      label: 'Confirmed',
      cls: 'bg-blue-100 text-blue-700',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    SHIPPED: {
      label: 'Shipped',
      cls: 'bg-violet-100 text-violet-700',
      icon: <Truck className="w-3.5 h-3.5" />,
    },
    DELIVERED: {
      label: 'Delivered',
      cls: 'bg-teal-100 text-teal-700',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  };

  const config = statusConfig[order.status] || {
    label: order.status,
    cls: 'bg-slate-100 text-slate-600',
    icon: <XCircle className="w-3.5 h-3.5" />,
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/60">
        <div>
          <p className="text-xs text-slate-400 font-medium">
            Order <span className="font-mono text-slate-600">#{order._id.slice(-8).toUpperCase()}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{formattedDate}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${config.cls}`}>
          {config.icon}
          {config.label}
        </span>
      </div>

      {/* Items preview */}
      <div className="p-4">
        <div className="space-y-2">
          {order.items.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              {item.image && (
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                <p className="text-xs text-slate-400">
                  ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-xs text-slate-400 pl-0.5">
              +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-base font-extrabold text-slate-900">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={() => navigate(`/orders/${order._id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-all cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
