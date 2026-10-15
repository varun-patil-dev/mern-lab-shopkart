const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");

const protect = require("../middlewares/auth.middleware");

// All cart endpoints are protected — must be logged in
router.get("/", protect, getCart);                            // GET    /cart
router.post("/:productId", protect, addToCart);               // POST   /cart/:productId
router.patch("/:productId", protect, updateCartQuantity);     // PATCH  /cart/:productId
router.delete("/:productId", protect, removeFromCart);        // DELETE /cart/:productId

module.exports = router;
