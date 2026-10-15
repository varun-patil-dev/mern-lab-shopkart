import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, Package, Heart, Loader2, ShoppingCart, Check } from 'lucide-react';
import { addToWishlist, getErrorMessage } from '../services/api';
import { useCart } from '../context/CartContext';

/**
 * ProductCard — displays a single product in the catalogue grid.
 *
 * Props:
 *   product: { _id, name, description, price, category, image, stock }
 *
 * Wishlist states:
 *   idle     → ♡ Add to Wishlist
 *   loading  → ⏳ Saving...
 *   added    → ♥ Added to Wishlist
 *   error    → shows inline error message
 *
 * Cart states (Task 7):
 *   idle     → 🛒 Add to Cart
 *   loading  → ⏳ Adding...
 *   added    → ✓ Add Another  (still allows adding more)
 *   error    → shows inline error message
 */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { _id, name, price, category, image, stock } = product;
  const { addToCart, isInCart } = useCart();

  const isOutOfStock = stock === 0;

  // Wishlist button state: 'idle' | 'loading' | 'added' | 'error'
  const [wishlistState, setWishlistState] = useState('idle');
  const [wishlistError, setWishlistError] = useState('');

  // Cart button state: 'idle' | 'loading' | 'added' | 'error'
  const [cartState, setCartState] = useState('idle');
  const [cartError, setCartError] = useState('');

  // Sync initial cart button appearance if product already in cart
  const alreadyInCart = isInCart(_id);

  const handleAddToWishlist = async (e) => {
    e.stopPropagation(); // don't trigger card navigation
    if (wishlistState === 'loading' || wishlistState === 'added') return;

    try {
      setWishlistState('loading');
      setWishlistError('');
      await addToWishlist(_id);
      setWishlistState('added');
    } catch (err) {
      const msg = getErrorMessage(err);
      // 409 means already in wishlist — treat as "added"
      if (err.response?.status === 409) {
        setWishlistState('added');
      } else {
        setWishlistError(msg);
        setWishlistState('error');
      }
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (cartState === 'loading' || isOutOfStock) return;

    try {
      setCartState('loading');
      setCartError('');
      await addToCart(_id);
      setCartState('added');
    } catch (err) {
      setCartError(getErrorMessage(err));
      setCartState('error');
    }
  };

  // Wishlist button label & style based on current state
  const wishlistConfig = {
    idle: {
      label: 'Add to Wishlist',
      icon: <Heart className="w-4 h-4" />,
      cls: 'bg-white border border-slate-300 text-slate-700 hover:border-pink-400 hover:text-pink-600 hover:bg-pink-50',
    },
    loading: {
      label: 'Saving...',
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      cls: 'bg-white border border-slate-200 text-slate-400 cursor-not-allowed',
    },
    added: {
      label: 'Added to Wishlist',
      icon: <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />,
      cls: 'bg-pink-50 border border-pink-200 text-pink-600 cursor-default',
    },
    error: {
      label: 'Add to Wishlist',
      icon: <Heart className="w-4 h-4" />,
      cls: 'bg-white border border-red-300 text-red-600 hover:bg-red-50',
    },
  };

  // Cart button config — Task 7
  const getCartConfig = () => {
    if (isOutOfStock) {
      return {
        label: 'Out of Stock',
        icon: <ShoppingCart className="w-4 h-4" />,
        cls: 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed',
        disabled: true,
      };
    }
    if (cartState === 'loading') {
      return {
        label: 'Adding...',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        cls: 'bg-indigo-50 border border-indigo-200 text-indigo-400 cursor-not-allowed',
        disabled: true,
      };
    }
    if (cartState === 'added' || alreadyInCart) {
      return {
        label: 'Add Another',
        icon: <Check className="w-4 h-4" />,
        cls: 'bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100',
        disabled: false,
      };
    }
    if (cartState === 'error') {
      return {
        label: 'Add to Cart',
        icon: <ShoppingCart className="w-4 h-4" />,
        cls: 'bg-white border border-red-300 text-red-600 hover:bg-red-50',
        disabled: false,
      };
    }
    return {
      label: 'Add to Cart',
      icon: <ShoppingCart className="w-4 h-4" />,
      cls: 'bg-white border border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50',
      disabled: false,
    };
  };

  const wl = wishlistConfig[wishlistState];
  const ct = getCartConfig();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Product Image */}
      <div className="relative h-52 bg-slate-50 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
          }}
        />
        {/* Wishlist heart icon overlay (top-right) */}
        <button
          onClick={handleAddToWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${
            wishlistState === 'added'
              ? 'bg-pink-500 text-white'
              : 'bg-white/90 text-slate-500 hover:text-pink-500'
          }`}
          title={wl.label}
        >
          <Heart
            className={`w-4 h-4 ${wishlistState === 'added' ? 'fill-white' : ''}`}
          />
        </button>

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Category pill */}
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
          {name}
        </h3>

        {/* Price */}
        <p className="text-xl font-extrabold text-slate-900">
          ₹{price.toLocaleString('en-IN')}
        </p>

        {/* Stock info */}
        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-slate-400" />
          {isOutOfStock ? (
            <span className="text-xs font-medium text-red-500">Out of stock</span>
          ) : (
            <span className="text-xs font-medium text-emerald-600">
              {stock} unit{stock !== 1 ? 's' : ''} left
            </span>
          )}
        </div>

        {/* Cart error message */}
        {cartState === 'error' && cartError && (
          <p className="text-xs text-red-500 font-medium">{cartError}</p>
        )}

        {/* Wishlist error message */}
        {wishlistState === 'error' && wishlistError && (
          <p className="text-xs text-red-500 font-medium">
            Unable to save product. Please try again.
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-auto flex flex-col gap-2">
          {/* View Details */}
          <button
            onClick={() => navigate(`/products/${_id}`)}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-indigo-500/30"
          >
            <ShoppingBag className="w-4 h-4" />
            View Details
          </button>

          {/* Add to Cart button — Task 7 */}
          <button
            onClick={handleAddToCart}
            disabled={ct.disabled}
            className={`w-full py-2 px-4 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${ct.cls}`}
          >
            {ct.icon}
            {ct.label}
          </button>

          {/* Wishlist button */}
          <button
            onClick={handleAddToWishlist}
            disabled={wishlistState === 'loading' || wishlistState === 'added'}
            className={`w-full py-2 px-4 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${wl.cls}`}
          >
            {wl.icon}
            {wl.label}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
