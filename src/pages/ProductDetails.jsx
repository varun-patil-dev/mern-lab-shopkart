import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Tag,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { getProductById, getErrorMessage } from '../services/api';

/**
 * ProductDetails — Individual product page (/products/:id)
 * Fetches a single product from GET /products/:id.
 */
const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getProductById(id);
        if (isMounted) {
          setProduct(data.product);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ── Loading State ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl shadow-sm border border-slate-200/80">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Something went wrong</p>
            <p className="text-sm text-slate-500 mt-1">
              Something went wrong while loading products.
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isInStock = product.stock > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-indigo-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 group transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Products
        </button>

        {/* Product Detail Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* ── Product Image ─────────────────────────────────────── */}
            <div className="relative h-72 md:h-auto min-h-72 bg-slate-50 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://placehold.co/600x500/e2e8f0/64748b?text=No+Image';
                }}
              />
              {!isInStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* ── Product Info ──────────────────────────────────────── */}
            <div className="p-6 sm:p-8 flex flex-col gap-5">

              {/* Category */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <p className="text-3xl font-extrabold text-indigo-600">
                ₹{product.price.toLocaleString('en-IN')}
              </p>

              {/* Description */}
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </h2>
                <p className="text-slate-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Package className="w-5 h-5 text-slate-400 shrink-0" />
                {isInStock ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700">
                      In Stock — {product.stock} unit{product.stock !== 1 ? 's' : ''} available
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-red-600">Out of Stock</span>
                )}
              </div>

              {/* Add to Cart button (UI only) */}
              <button
                disabled={!isInStock}
                className="mt-auto w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-bold rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md hover:shadow-indigo-500/30"
              >
                <ShoppingCart className="w-5 h-5" />
                {isInStock ? 'Add to Cart' : 'Unavailable'}
              </button>

              {/* Product ID (small helper) */}
              <p className="text-xs text-slate-400 font-mono text-center">
                Product ID: {product._id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
