const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ── Helper ─────────────────────────────────────────────────────────────────────
/**
 * Returns the customer's cart populated with full Product data.
 * Used internally so every mutation returns a consistent response.
 */
const getPopulatedCart = async (userId) => {
  const customer = await Customer.findById(userId).populate({
    path: "cart.product",
    select: "name price category image stock description",
  });
  return customer ? customer.cart : [];
};

// ── Task 2: Add Product to Cart ───────────────────────────────────────────────
/**
 * POST /cart/:productId          [Protected]
 *
 * Flow:
 *  1. Validate productId is a valid ObjectId.
 *  2. Confirm the product exists in the catalogue.
 *  3. If already in cart → increment quantity by 1.
 *     If new → push { product, quantity: 1 }.
 *  4. Validate that the new quantity does not exceed Product stock.
 *  5. Save and return the updated cart.
 */
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Check the product actually exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(userId);

    // 3. Check if product already in cart
    const existingItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Increase quantity by 1
      const newQuantity = existingItem.quantity + 1;

      // 4. Stock validation
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) available in stock`,
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      // 4. Stock validation for first add (stock must be >= 1)
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: "Product is out of stock",
        });
      }

      // Add new cart entry
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    // Return populated cart
    const cart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (err) {
    console.error("addToCart error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ── Task 3: Get Current User Cart ─────────────────────────────────────────────
/**
 * GET /cart          [Protected]
 *
 * Authenticates the user, populates each cart item's Product,
 * and returns cart items with quantity.
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const customer = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "name price category image stock description",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (err) {
    console.error("getCart error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ── Task 4: Update Product Quantity ───────────────────────────────────────────
/**
 * PATCH /cart/:productId          [Protected]
 *
 * Request body: { quantity: Number }
 *
 * Rules:
 *  - quantity must be a number
 *  - quantity must be >= 1
 *  - quantity must not exceed product stock
 *  - product must already exist in the cart
 */
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate quantity value
    if (quantity === undefined || typeof quantity !== "number" || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) available in stock`,
      });
    }

    const customer = await Customer.findById(userId);

    // Find cart item
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cartItem.quantity = quantity;
    await customer.save();

    // Return updated cart
    const cart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart,
    });
  } catch (err) {
    console.error("updateCartQuantity error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ── Task 5: Remove Product from Cart ──────────────────────────────────────────
/**
 * DELETE /cart/:productId          [Protected]
 *
 * Removes the item from the authenticated user's cart.
 * Returns the updated cart after removal.
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(userId);

    const index = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    customer.cart.splice(index, 1);
    await customer.save();

    // Return updated cart
    const cart = await getPopulatedCart(userId);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (err) {
    console.error("removeFromCart error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};
