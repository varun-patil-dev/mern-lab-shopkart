import axios from 'axios';

/**
 * Axios instance configured for ShopKart API.
 * withCredentials: true ensures cookies (such as our HttpOnly JWT token)
 * are sent with requests and stored from responses.
 */
const api = axios.create({
  baseURL: '', // Relative URL routes through Vite dev proxy to Express backend (localhost:3000)
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Register a new customer
 * @param {Object} customerData - { fullName, email, password, phone }
 * @returns {Promise}
 */
export const registerCustomer = async (customerData) => {
  const response = await api.post('/customers/register', customerData);
  return response.data;
};

/**
 * Login customer
 * @param {Object} credentials - { email, password }
 * @returns {Promise}
 */
export const loginCustomer = async (credentials) => {
  const response = await api.post('/customers/login', credentials);
  return response.data;
};

/**
 * Get currently logged-in customer profile (Protected)
 * @returns {Promise}
 */
export const getProfile = async () => {
  const response = await api.get('/customers/me');
  return response.data;
};

/**
 * Logout customer (Clears token cookie)
 * @returns {Promise}
 */
export const logoutCustomer = async () => {
  const response = await api.post('/customers/logout');
  return response.data;
};

/**
 * Change customer password (Protected)
 * @param {Object} passwordData - { oldPassword, newPassword }
 * @returns {Promise}
 */
export const changePassword = async (passwordData) => {
  const response = await api.patch('/customers/change-password', passwordData);
  return response.data;
};

// ── Product APIs ─────────────────────────────────────────────────────────────

/**
 * Fetch all products, optionally filtered by search and/or category.
 * @param {Object} params - { search?: string, category?: string }
 * @returns {Promise<{ success, count, products }>}
 */
export const getProducts = async ({ search = '', category = '' } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (category) params.category = category;
  const response = await api.get('/products', { params });
  return response.data;
};

/**
 * Fetch a single product by its MongoDB _id.
 * @param {string} id
 * @returns {Promise<{ success, product }>}
 */
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/**
 * Create a new product (open API — no auth required in this lab).
 * @param {Object} productData
 * @returns {Promise<{ success, product }>}
 */
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// ── Wishlist APIs ─────────────────────────────────────────────────────────────

/**
 * Fetch the current logged-in user's wishlist (populated with product data).
 * @returns {Promise<{ success, count, wishlist }>}
 */
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

/**
 * Add a product to the current user's wishlist.
 * @param {string} productId - MongoDB _id of the product
 * @returns {Promise<{ success, message }>}
 */
export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Remove a product from the current user's wishlist.
 * @param {string} productId - MongoDB _id of the product
 * @returns {Promise<{ success, message }>}
 */
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Bonus: Toggle a product in/out of the wishlist.
 * @param {string} productId
 * @returns {Promise<{ success, wishlisted, message }>}
 */
export const toggleWishlist = async (productId) => {
  const response = await api.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

/**
 * Helper to extract human-friendly error messages from axios errors
 * @param {Error} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

// ── Cart APIs ─────────────────────────────────────────────────────────────────

/**
 * Fetch the current logged-in user's cart (populated with product data).
 * @returns {Promise<{ success, cart }>}
 */
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

/**
 * Add a product to the current user's cart.
 * If product is already in cart, quantity is incremented by 1 on the backend.
 * @param {string} productId - MongoDB _id of the product
 * @returns {Promise<{ success, message, cart }>}
 */
export const addToCart = async (productId) => {
  const response = await api.post(`/cart/${productId}`);
  return response.data;
};

/**
 * Update the quantity of a product in the cart.
 * @param {string} productId - MongoDB _id of the product
 * @param {number} quantity  - New quantity (must be >= 1 and <= stock)
 * @returns {Promise<{ success, message, cart }>}
 */
export const updateCartQuantity = async (productId, quantity) => {
  const response = await api.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

/**
 * Remove a product from the current user's cart.
 * @param {string} productId - MongoDB _id of the product
 * @returns {Promise<{ success, message, cart }>}
 */
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/${productId}`);
  return response.data;
};

// ── Order APIs ────────────────────────────────────────────────────────────────

/**
 * Create a Razorpay payment order (validates cart, calculates total server-side).
 * @param {{ shippingAddress: object }} payload
 * @returns {Promise<{ success, shopKartOrderId, razorpayOrderId, amount, currency, key }>}
 */
export const createPaymentOrder = async (payload) => {
  const response = await api.post('/orders/create-payment-order', payload);
  return response.data;
};

/**
 * Verify Razorpay payment signature and confirm the order.
 * @param {{ shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }} payload
 * @returns {Promise<{ success, order }>}
 */
export const verifyPayment = async (payload) => {
  const response = await api.post('/orders/verify-payment', payload);
  return response.data;
};

/**
 * Fetch all orders for the authenticated user, newest first.
 * @returns {Promise<{ success, count, orders }>}
 */
export const getMyOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

/**
 * Fetch a single order by ID (ownership enforced by backend).
 * @param {string} id
 * @returns {Promise<{ success, order }>}
 */
export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

/**
 * Bonus: Update order status (PLACED → CONFIRMED → SHIPPED → DELIVERED).
 * @param {string} id
 * @param {string} status
 */
export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status`, { status });
  return response.data;
};

export default api;

