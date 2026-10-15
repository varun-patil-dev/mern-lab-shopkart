import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  User,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Package,
  ArrowLeft,
  CreditCard,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment, getErrorMessage } from '../services/api';

// ── Razorpay script loader ─────────────────────────────────────────────────────
/**
 * Dynamically appends the Razorpay Checkout script to <body>.
 * Returns a Promise that resolves true on success, false on failure.
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ── Validation helpers ────────────────────────────────────────────────────────
const validate = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required';
  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number';
  }
  if (!form.addressLine1.trim()) errors.addressLine1 = 'Address is required';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.state.trim()) errors.state = 'State is required';
  if (!form.pincode.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = 'Pincode must be exactly 6 digits';
  }
  return errors;
};

/**
 * Checkout Page (/checkout) — Task 2 & Task 4 (Lab-06)
 *
 * Layout:
 *   Left  — Shipping Details form (Task 3 — field-level validation)
 *   Right — Order Summary from CartContext
 *
 * On "Place Order":
 *   1. Client-side validation
 *   2. POST /orders/create-payment-order  → get Razorpay order details
 *   3. Open Razorpay Standard Checkout
 *   4. On payment success → POST /orders/verify-payment
 *   5. On verification success → clear global cart state → navigate to success page
 */
const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartLoading, subtotal, totalItems, fetchCart } = useCart();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [paymentFailed, setPaymentFailed] = useState('');

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, cartLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    if (placing) return;
    e.preventDefault();
    setApiError('');
    setPaymentFailed('');

    // ── Task 3: Client-side validation ─────────────────────────────────────
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setPlacing(true);

    try {
      // ── Load Razorpay script ──────────────────────────────────────────────
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setApiError('Failed to load payment gateway. Please check your internet connection and try again.');
        setPlacing(false);
        return;
      }

      // ── Task 4: Create Razorpay + ShopKart Order ──────────────────────────
      // Frontend sends ONLY the shipping address.
      // The backend validates stock, calculates total, creates the order.
      const data = await createPaymentOrder({
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          addressLine1: form.addressLine1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      });

      // ── Open Razorpay Checkout ─────────────────────────────────────────────
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopKart',
        description: 'ShopKart Order Payment',
        order_id: data.razorpayOrderId,

        handler: async function (response) {
          // ── Signature Verification ───────────────────────────────────────
          // DO NOT mark payment successful here on the client.
          // Send the Razorpay response to our backend for HMAC verification.
          try {
            const verifyData = await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.success) {
              // ── Task 5: Clear global cart state after verified payment ────
              await fetchCart(); // re-fetches empty cart from backend
              // Navigate to order success page
              navigate(`/order-success/${verifyData.order._id}`);
            } else {
              setApiError('Payment verification failed. Please contact support.');
            }
          } catch (verifyErr) {
            setApiError(getErrorMessage(verifyErr));
          } finally {
            setPlacing(false);
          }
        },

        prefill: {
          name: form.fullName,
          contact: form.phone,
        },

        theme: {
          color: '#4f46e5', // Indigo-600 — matches ShopKart theme
        },

        modal: {
          ondismiss: function () {
            // User closed the Razorpay modal without paying
            setPaymentFailed('Payment cancelled. Your cart has not been cleared. You can try again.');
            setPlacing(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        setPlacing(false);
        setPaymentFailed(
          `Payment failed: ${response.error?.description || 'Unknown error'}. Your cart is preserved. Please try again.`
        );
        setPlacing(false);
      });

      paymentObject.open();
    } catch (err) {
      setApiError(getErrorMessage(err));
      setPlacing(false);
    }
  };

  // ── Input field component (DRY helper) ────────────────────────────────────
  const Field = ({ label, name, type = 'text', placeholder, icon: Icon }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
            errors[name]
              ? 'border-red-300 focus:ring-red-200 bg-red-50/50'
              : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400 bg-white'
          }`}
        />
      </div>
      {errors[name] && (
        <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-indigo-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Page header ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white border border-slate-200/80 transition-all cursor-pointer"
            title="Back to Cart"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
              <p className="text-xs text-slate-500">Complete your purchase</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Shipping Details ────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} noValidate>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-base font-bold text-slate-900">Shipping Details</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Full Name"
                      name="fullName"
                      placeholder="Aarav Sharma"
                      icon={User}
                    />
                    <Field
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      placeholder="9876543210"
                      icon={Phone}
                    />
                  </div>

                  <Field
                    label="Address Line"
                    name="addressLine1"
                    placeholder="22 MG Road, Apartment 4B"
                    icon={MapPin}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="City"
                      name="city"
                      placeholder="Bengaluru"
                    />
                    <Field
                      label="State"
                      name="state"
                      placeholder="Karnataka"
                    />
                  </div>

                  <Field
                    label="Pincode"
                    name="pincode"
                    placeholder="560001"
                  />
                </div>
              </div>

              {/* ── Errors ─────────────────────────────────────────────────── */}
              {apiError && (
                <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}
              {paymentFailed && (
                <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{paymentFailed}</span>
                </div>
              )}

              {/* ── Place Order button ──────────────────────────────────────── */}
              <button
                type="submit"
                disabled={placing}
                className="w-full mt-5 inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {placing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Place Order · ₹{subtotal.toLocaleString('en-IN')}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 mt-3">
                🔒 Secured by Razorpay · Test Mode
              </p>
            </form>
          </div>

          {/* ── Right: Order Summary ──────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-indigo-500" />
                <h2 className="text-base font-bold text-slate-900">Order Summary</h2>
              </div>

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.product?._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/80x80/e2e8f0/64748b?text=?';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-slate-800 shrink-0">
                      ₹{((item.product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Items ({totalItems})</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => navigate('/cart')}
                  className="text-xs text-indigo-600 hover:underline cursor-pointer"
                >
                  Edit Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
