const mongoose = require("mongoose");

/**
 * Customer Schema — extended in Lab-04 to include wishlist,
 *                   extended in Lab-05 to include cart.
 *
 * wishlist stores Product ObjectId references (not embedded product objects).
 * cart stores Product ObjectId references with quantity.
 * This keeps the Product collection as the single source of truth.
 */
const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    // ── Lab-04: Wishlist ──────────────────────────────────────────────────────
    // Store only Product ObjectIds — never the full product document.
    // Use populate() to expand to full product data when needed.
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // ── Lab-05: Cart ──────────────────────────────────────────────────────────
    // Each entry stores a Product reference (ObjectId) and a quantity.
    // Subtotal is NEVER stored here — it is always derived on the frontend
    // from price × quantity using the latest Product price.
    // Default is an empty array → existing users are unaffected.
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
