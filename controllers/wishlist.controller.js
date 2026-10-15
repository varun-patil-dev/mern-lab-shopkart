const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// ── Task 2: Add Product to Wishlist ──────────────────────────────────────────
/**
 * POST /wishlist/:productId          [Protected]
 *
 * Flow:
 *  1. Validate productId is a valid ObjectId.
 *  2. Confirm the product exists in the catalogue.
 *  3. Prevent duplicate entries (409 if already saved).
 *  4. Push the ObjectId into the customer's wishlist array.
 *  5. Save and respond.
 *
 * The user identity always comes from req.user (JWT middleware) —
 * never from the request body.
 */
const addToWishlist = async (req, res) => {
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

    // 3. Check for duplicates — use .toString() for reliable ObjectId comparison
    const customer = await Customer.findById(userId);
    const alreadySaved = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist",
      });
    }

    // 4. Add the product reference and persist
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (err) {
    console.error("addToWishlist error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ── Task 3: Get Current User's Wishlist ──────────────────────────────────────
/**
 * GET /wishlist          [Protected]
 *
 * Authenticates the user, then returns their wishlist with full
 * product data via Mongoose populate().
 *
 * Security: The server derives the user from the JWT cookie.
 * There is no GET /wishlist/:userId — a client can never
 * request another user's wishlist.
 */
const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    // Populate wishlist ObjectIds → full product documents
    const customer = await Customer.findById(userId).populate({
      path: "wishlist",
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
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (err) {
    console.error("getWishlist error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ── Task 4: Remove Product from Wishlist ─────────────────────────────────────
/**
 * DELETE /wishlist/:productId          [Protected]
 *
 * Removes the product ObjectId from the authenticated user's wishlist.
 * Returns 404 if the product is not in the wishlist.
 */
const removeFromWishlist = async (req, res) => {
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

    // 2. Locate the customer
    const customer = await Customer.findById(userId);

    // 3. Check the product is actually in the wishlist
    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // 4. Remove from array and persist
    customer.wishlist.splice(index, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ── Bonus: Toggle Wishlist ─────────────────────────────────────────────────
/**
 * PATCH /wishlist/:productId/toggle          [Protected]
 *
 * If the product is already in the wishlist → removes it.
 * If not → adds it.
 * Returns the new state: { wishlisted: true/false }
 */
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(userId);
    const index = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let wishlisted;
    if (index === -1) {
      // Not saved → add
      customer.wishlist.push(productId);
      wishlisted = true;
    } else {
      // Already saved → remove
      customer.wishlist.splice(index, 1);
      wishlisted = false;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      wishlisted,
      message: wishlisted ? "Product added to wishlist" : "Product removed from wishlist",
    });
  } catch (err) {
    console.error("toggleWishlist error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
