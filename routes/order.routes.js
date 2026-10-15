const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

const protect = require("../middlewares/auth.middleware");

// All order endpoints require authentication
router.post("/create-payment-order", protect, createPaymentOrder); // POST   /orders/create-payment-order
router.post("/verify-payment", protect, verifyPayment);            // POST   /orders/verify-payment
router.get("/", protect, getMyOrders);                             // GET    /orders
router.get("/:id", protect, getOrderById);                         // GET    /orders/:id
router.patch("/:id/status", protect, updateOrderStatus);           // PATCH  /orders/:id/status  (Bonus)

module.exports = router;
