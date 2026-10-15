import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Package,
  Heart,
  CreditCard,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Loader2,
  CheckCircle,
  KeyRound,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { setUser: setAuthUser } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        setLoading(true);
        // Task 3: GET /customers/me
        const data = await getProfile();

        if (isMounted) {
          setCustomer(data);
          setAuthUser(data);
        }
      } catch (err) {
        // If Not Logged In -> Automatically redirect to /login
        if (isMounted) {
          setError(getErrorMessage(err));
          navigate('/login', {
            replace: true,
            state: { message: 'Session expired or not logged in. Please sign in.' },
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, setAuthUser]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading your ShopKart account...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-slate-50/50 to-indigo-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-indigo-500/15">
          <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Customer Profile</span>
            </div>
            {/* Display: Welcome message */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="text-amber-300">{customer.fullName}</span>!
            </h1>
            <p className="mt-2 text-indigo-100 text-base sm:text-lg">
              Here is your ShopKart account summary. Your authentication token is securely stored and verified.
            </p>
          </div>
        </div>

        {/* Customer Information Card (Task 3 Core Requirement) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Customer Profile Details</h2>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                Authenticated Session
              </span>
              <button
                onClick={() => navigate('/change-password')}
                id="header-change-password-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                title="Change Account Password"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Name */}
            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-100/80 text-indigo-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Full Name
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900 truncate" id="customer-name">
                {customer.fullName}
              </p>
              <p className="text-xs text-slate-400 mt-1">Primary Account Holder</p>
            </div>

            {/* Email Address */}
            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-violet-100/80 text-violet-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email Address
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900 truncate" id="customer-email">
                {customer.email}
              </p>
              <p className="text-xs text-slate-400 mt-1">Verified Login Identifier</p>
            </div>

            {/* Phone Number */}
            <div className="p-5 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Phone Number
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900 truncate" id="customer-phone">
                {customer.phone}
              </p>
              <p className="text-xs text-slate-400 mt-1">Order Updates & SMS</p>
            </div>
          </div>

          <div className="bg-slate-50/60 px-6 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              Account ID: <span className="font-mono text-slate-700 font-medium">{customer._id || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1 text-indigo-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Protected by HttpOnly JWT Cookie</span>
            </div>
          </div>
        </div>

        {/* Security & Password Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Security & Password Management</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your account password to protect your ShopKart orders and personal information.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/change-password')}
            id="home-change-password-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* E-Commerce Dashboard Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">0</p>
              <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Active Orders</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">12</p>
              <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Wishlist Items</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">Gold</p>
              <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Member Tier</p>
            </div>
          </div>
        </div>

        {/* Quick Shopping CTA */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold">Ready to discover trending products?</h3>
            <p className="text-sm text-slate-300">
              Explore our catalogue of top-rated electronics, fashion, and home accessories.
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-md hover:shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
