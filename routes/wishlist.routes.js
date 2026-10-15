const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require("../controllers/wishlist.controller");

const protect = require("../middlewares/auth.middleware");

// All wishlist endpoints are protected — must be logged in
router.get("/", protect, getWishlist);                         // GET  /wishlist
router.post("/:productId", protect, addToWishlist);            // POST /wishlist/:productId
router.delete("/:productId", protect, removeFromWishlist);     // DEL  /wishlist/:productId
router.patch("/:productId/toggle", protect, toggleWishlist);   // PATCH /wishlist/:productId/toggle (Bonus)

module.exports = router;
