import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Package, Eye, Trash2, Loader2, Heart } from 'lucide-react';
import { removeFromWishlist, getErrorMessage } from '../services/api';

/**
 * WishlistCard — displays a saved product on the Wishlist page.
 *
 * Props:
 *   product:  { _id, name, price, category, image, stock }
 *   onRemoved: (productId: string) => void  — callback after successful removal
 */
const WishlistCard = ({ product, onRemoved }) => {
  const navigate = useNavigate();
  const { _id, name, price, category, image, stock } = product;

  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');

  const isOutOfStock = stock === 0;

  const handleRemove = async () => {
    if (removing) return;
    try {
      setRemoving(true);
      setRemoveError('');
      await removeFromWishlist(_id);
      onRemoved(_id); // let parent update state — no page refresh
    } catch (err) {
      setRemoveError(getErrorMessage(err));
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Product Image */}
      <div className="relative h-48 bg-slate-50 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
          }}
        />
        {/* Saved indicator */}
        <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center shadow-sm">
          <Heart className="w-4 h-4 fill-white text-white" />
        </div>
        {isOutOfStock && (
          <div className="absolute bottom-0 inset-x-0 bg-black/50 py-1 text-center">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Category */}
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {category}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 flex-1">
          {name}
        </h3>

        {/* Price */}
        <p className="text-xl font-extrabold text-slate-900">
          ₹{price.toLocaleString('en-IN')}
        </p>

        {/* Stock */}
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

        {/* Remove error */}
        {removeError && (
          <p className="text-xs text-red-500 font-medium">{removeError}</p>
        )}

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2">
          {/* View Details */}
          <button
            onClick={() => navigate(`/products/${_id}`)}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>

          {/* Remove from Wishlist */}
          <button
            onClick={handleRemove}
            disabled={removing}
            className="w-full py-2 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {removing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {removing ? 'Removing...' : 'Remove ♥'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
