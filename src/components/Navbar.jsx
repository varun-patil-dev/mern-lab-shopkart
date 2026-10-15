import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, LogOut, User, Menu, X, ArrowRight, KeyRound, Heart, ShoppingCart, Package } from 'lucide-react';
import { getWishlist } from '../services/api';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Bonus: Wishlist count ─────────────────────────────────────────────────
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch wishlist count whenever the user is authenticated or the route changes
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }

    let cancelled = false;

    const fetchCount = async () => {
      try {
        const data = await getWishlist();
        if (!cancelled) {
          setWishlistCount(data.count ?? 0);
        }
      } catch {
        // Silently ignore — navbar count is best-effort
      }
    };

    fetchCount();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, location.pathname]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      navigate('/login', { state: { message: 'You have been logged out successfully.' } });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isProductsActive = () => location.pathname.startsWith('/products');
  const isWishlistActive = () => location.pathname === '/wishlist';
  const isCartActive = () => location.pathname === '/cart';
  const isOrdersActive = () => location.pathname.startsWith('/orders') || location.pathname.startsWith('/order-success');

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to={isAuthenticated ? '/home' : '/login'}
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
              Shop<span className="text-indigo-600">Kart</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5">
            {isAuthenticated ? (
              <>
                {/* Dashboard */}
                <Link
                  to="/home"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/home')
                      ? 'text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Products */}
                <Link
                  to="/products"
                  className={`text-sm font-medium transition-colors ${
                    isProductsActive()
                      ? 'text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Products
                </Link>

                {/* Wishlist with count badge */}
                <Link
                  to="/wishlist"
                  className={`relative text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isWishlistActive()
                      ? 'text-pink-600 font-semibold'
                      : 'text-slate-600 hover:text-pink-600'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isWishlistActive() ? 'fill-pink-500 text-pink-500' : ''}`}
                  />
                  <span>
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-pink-500 text-white rounded-full">
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </span>
                    )}
                  </span>
                </Link>

                {/* ── Lab-05: Cart link with dynamic count badge ───────────── */}
                <Link
                  to="/cart"
                  className={`relative text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isCartActive()
                      ? 'text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  <ShoppingCart
                    className={`w-4 h-4 ${isCartActive() ? 'text-indigo-600' : ''}`}
                  />
                  <span>
                    Cart
                    {totalItems > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-indigo-600 text-white rounded-full">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </span>
                  </Link>

                {/* ── Lab-06: Orders link ──────────────────────────────── */}
                <Link
                  to="/orders"
                  className={`relative text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isOrdersActive()
                      ? 'text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  <Package className={`w-4 h-4 ${isOrdersActive() ? 'text-indigo-600' : ''}`} />
                  <span>Orders</span>
                </Link>

                {/* Change Password */}
                <Link
                  to="/change-password"
                  id="nav-change-password-link"
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/change-password')
                      ? 'text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Change Password</span>
                </Link>

                <div className="h-5 w-px bg-slate-200" />

                {/* User info preview */}
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100/80 py-1.5 px-3 rounded-full border border-slate-200/60">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="font-medium text-slate-800 truncate max-w-[150px]">
                    {user?.fullName || 'Customer'}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 rounded-lg transition-all border border-red-200/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs hover:shadow-xs"
                  title="Logout from ShopKart"
                  id="logout-btn"
                >
                  <LogOut className={`w-4 h-4 ${loggingOut ? 'animate-spin' : ''}`} />
                  <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                    isActive('/login')
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow-indigo-500/25 transition-all cursor-pointer active:scale-95"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <Link
                to="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>

              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Products
              </Link>

              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-pink-50 hover:text-pink-600"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span>Wishlist</span>
                </div>
                {wishlistCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-pink-500 text-white rounded-full">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* ── Lab-05: Mobile Cart link ────────────────────────────────── */}
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-indigo-500" />
                  <span>Cart</span>
                </div>
                {totalItems > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-indigo-600 text-white rounded-full">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              <Link
                to="/change-password"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                <KeyRound className="w-4 h-4 text-slate-500" />
                <span>Change Password</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 px-4 rounded-lg font-medium text-slate-700 hover:bg-slate-100"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 px-4 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
