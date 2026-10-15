const mongoose = require("mongoose");

/**
 * Order Schema — Lab-06
 *
 * Key design decisions:
 *
 * 1. Items store a SNAPSHOT of product data at purchase time.
 *    If a product's name or price changes later, old orders remain accurate.
 *
 * 2. totalAmount is ALWAYS calculated server-side from fresh product prices.
 *    The frontend never provides this value.
 *
 * 3. Razorpay Key Secret is NEVER stored here — only the order id and payment id.
 */
const orderSchema = new mongoose.Schema(
  {
    // The authenticated user who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Purchase-time snapshot — each item preserves name, price and image
    // so order history remains accurate even if the Product document changes.
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        image: {
          type: String,
          default: "",
        },
      },
    ],

    // Shipping address collected during checkout
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    // Server-calculated total in INR — never trusted from the client
    totalAmount: {
      type: Number,
      required: true,
    },

    // Payment lifecycle
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    // Order fulfilment status
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"],
      default: "PENDING_PAYMENT",
    },

    // Razorpay identifiers — stored after creation / payment
    // The Key Secret is NEVER stored here.
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
