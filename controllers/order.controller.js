const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

// ── Task 4: Create Payment Order ──────────────────────────────────────────────
/**
 * POST /orders/create-payment-order          [Protected]
 *
 * This single endpoint handles the complete order-creation and Razorpay
 * order-initialisation flow:
 *
 *  1.  Authenticate the user (done by middleware — req.user is set).
 *  2.  Load the user's populated cart.
 *  3.  Reject if cart is empty.
 *  4.  Re-load latest Product documents (stock + price may have changed).
 *  5.  Validate stock for every cart item.
 *  6.  Calculate totalAmount SERVER-SIDE — never trust req.body.totalAmount.
 *  7.  Build purchase-time order item snapshots.
 *  8.  Persist ShopKart Order with status = PENDING_PAYMENT.
 *  9.  Create a Razorpay Order (amount in paise).
 *  10. Save the Razorpay Order ID on the ShopKart Order.
 *  11. Return safe checkout data — Key ID is safe; Key Secret NEVER leaves backend.
 *
 * Security rule: The frontend sends only the shipping address.
 * All pricing and stock decisions are made here.
 */
const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    // ── Validate shipping address ───────────────────────────────────────────
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const {
      fullName,
      phone,
      addressLine1,
      city,
      state,
      pincode,
    } = shippingAddress;

    if (typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ success: false, message: "Full name is required" });
    }
    if (typeof phone !== "string" || !phone.trim()) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }
    if (typeof addressLine1 !== "string" || !addressLine1.trim()) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }
    if (typeof city !== "string" || !city.trim()) {
      return res.status(400).json({ success: false, message: "City is required" });
    }
    if (typeof state !== "string" || !state.trim()) {
      return res.status(400).json({ success: false, message: "State is required" });
    }
    if (typeof pincode !== "string" || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({ success: false, message: "Pincode must contain exactly 6 digits" });
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: "Enter a valid 10-digit Indian mobile number" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, message: "Payment gateway is not configured" });
    }

    // ── Load user with cart ─────────────────────────────────────────────────
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Add products before checkout.",
      });
    }

    // ── Re-load latest Product documents ────────────────────────────────────
    // Use fresh data — prices and stock may have changed since items were carted.
    const productIds = customer.cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // Build a lookup map for O(1) access
    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    // ── Final stock validation + snapshot + total calculation ────────────────
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of customer.cart) {
      const product = productMap[cartItem.product.toString()];

      // Product may have been deleted since it was added to cart
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `A product in your cart is no longer available. Please update your cart.`,
        });
      }

      // Final stock check
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}.`,
        });
      }

      // Server-side total — uses current Product price, not anything from client
      totalAmount += product.price * cartItem.quantity;

      // Purchase-time snapshot — preserves accuracy of historical orders
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image || "",
      });
    }

    // ── Persist ShopKart Order (PENDING_PAYMENT) ─────────────────────────────
    // Cart is NOT cleared here — only after payment verification succeeds.
    const shopKartOrder = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    await shopKartOrder.save();

    // ── Create Razorpay Order ─────────────────────────────────────────────────
    // Amount must be in paise (INR smallest unit): ₹1 = 100 paise
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: shopKartOrder._id.toString(),
    });

    // Store the Razorpay Order ID on our order document
    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    // ── Return safe checkout data ────────────────────────────────────────────
    // Key ID is safe to send to the client.
    // Key Secret NEVER leaves the backend.
    return res.status(200).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,          // in paise — Razorpay standard
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,     // Key ID only — not the secret
    });
  } catch (err) {
    console.error("createPaymentOrder error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create order. Please try again.",
    });
  }
};

// ── Payment Verification ──────────────────────────────────────────────────────
/**
 * POST /orders/verify-payment          [Protected]
 *
 * Razorpay returns three values after a successful payment:
 *   razorpay_order_id   — the Razorpay Order ID
 *   razorpay_payment_id — the Payment ID
 *   razorpay_signature  — HMAC-SHA256 signature for verification
 *
 * Verification flow:
 *  1. Load the ShopKart Order using shopKartOrderId.
 *  2. Verify the user owns this order.
 *  3. Reconstruct the HMAC using the STORED razorpayOrderId (not client-supplied).
 *  4. Compare to the received signature.
 *  5. On match → mark PAID + PLACED, clear cart, return order.
 *  6. On mismatch → 400 — order stays PENDING, cart preserved.
 *
 * Security: The HMAC body uses the order's stored razorpayOrderId,
 * not the order_id sent by the browser, preventing substitution attacks.
 */
const verifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ── Validate presence ────────────────────────────────────────────────────
    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields",
      });
    }

    // ── Load ShopKart Order ──────────────────────────────────────────────────
    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ── Ownership check ──────────────────────────────────────────────────────
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This order does not belong to you.",
      });
    }

    if (order.status === "PLACED" && order.paymentStatus === "PAID") {
      if (order.razorpayPaymentId === razorpay_payment_id && order.razorpayOrderId === razorpay_order_id) {
        return res.status(200).json({ success: true, message: "Payment already verified", order });
      }
      return res.status(400).json({ success: false, message: "Order has already been paid" });
    }

    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: "Payment order does not match this ShopKart order" });
    }

    // ── HMAC-SHA256 signature verification ───────────────────────────────────
    // Use the STORED razorpayOrderId — never the one from the browser request body.
    // This prevents a client from swapping order IDs to bypass verification.
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");
    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment could not be verified.",
      });
    }

    // ── Signature verified — confirm the order ────────────────────────────────
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // ── Task 5: Clear cart ONLY after verified payment ────────────────────────
    const customer = await Customer.findById(userId);
    customer.cart = [];
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified. Order placed successfully!",
      order,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed. Please contact support.",
    });
  }
};

// ── Task 7: Get User Orders ───────────────────────────────────────────────────
/**
 * GET /orders          [Protected]
 *
 * Returns all orders belonging to the authenticated user,
 * sorted newest-first.
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("getMyOrders error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ── Single Order ──────────────────────────────────────────────────────────────
/**
 * GET /orders/:id          [Protected]
 *
 * Returns a single order.
 * Enforces ownership — a user cannot read another user's order.
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Ownership check — prevent users from guessing other users' order IDs
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This order does not belong to you.",
      });
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Bonus: Update Order Status (Dev/Admin endpoint) ───────────────────────────
/**
 * PATCH /orders/:id/status          [Protected]
 *
 * Bonus feature: allows progression through order statuses.
 * In a production app this would be admin-only.
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const allowedStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (order.paymentStatus !== "PAID") {
      return res.status(400).json({ success: false, message: "Only paid orders can progress" });
    }

    const currentIndex = allowedStatuses.indexOf(order.status);
    if (currentIndex < 0 || allowedStatuses[currentIndex + 1] !== status) {
      return res.status(400).json({ success: false, message: "Order status must advance one step at a time" });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
