import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import ChangePassword from './pages/ChangePassword';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';

function App() {
  return (
    <AuthProvider>
      {/* CartProvider is nested inside AuthProvider so it can access isAuthenticated */}
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Default root redirects to /home */}
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* Auth pages */}
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Protected pages */}
                <Route path="/home" element={<Home />} />
                <Route path="/change-password" element={<ChangePassword />} />

                {/* Lab 03 — Product pages */}
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />

                {/* Lab 04 — Wishlist */}
                <Route path="/wishlist" element={<Wishlist />} />

                {/* Lab 05 — Cart */}
                <Route path="/cart" element={<Cart />} />

                {/* Lab 06 — Checkout + Orders */}
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:id" element={<OrderSuccess />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetails />} />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
