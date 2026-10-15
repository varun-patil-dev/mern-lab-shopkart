import React, { useEffect, useState, useCallback } from 'react';
import { SlidersHorizontal, Loader2, PackageSearch, AlertCircle } from 'lucide-react';
import { getProducts, getErrorMessage } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

// Available categories shown in the dropdown.
// In a real app these could come from the backend.
const CATEGORIES = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

/**
 * Products — Product Listing Page (/products)
 * Fetches products from GET /products with optional search and category filters.
 */
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Controlled inputs
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Debounced search value (300 ms) — avoids API call on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce: update debouncedSearch 300 ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch products whenever the debounced search or category changes
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProducts({
        search: debouncedSearch,
        category: category === 'All Categories' ? '' : category,
      });
      setProducts(data.products || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-indigo-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Catalogue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse, search and filter thousands of products.
          </p>
        </div>

        {/* ── Search + Filter Bar ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          {/* Search */}
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search products..."
          />

          {/* Category Dropdown */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={category || 'All Categories'}
              onChange={(e) =>
                setCategory(e.target.value === 'All Categories' ? '' : e.target.value)
              }
              className="pl-9 pr-8 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all appearance-none cursor-pointer min-w-[180px] text-slate-700"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Loading State ────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-500 font-medium">Loading products...</p>
          </div>
        )}

        {/* ── Error State ──────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
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
              onClick={fetchProducts}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty State ──────────────────────────────────────────────── */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <PackageSearch className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">No products found.</p>
              <p className="text-sm text-slate-500 mt-1">
                Try a different search term or category.
              </p>
            </div>
          </div>
        )}

        {/* ── Product Grid ─────────────────────────────────────────────── */}
        {!loading && !error && products.length > 0 && (
          <>
            <p className="text-sm text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{products.length}</span> product
              {products.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
