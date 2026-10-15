const express = require("express");
const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword,
} = require("../controllers/customer.controller");

const protect = require("../middlewares/auth.middleware");

// Public routes
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// Protected routes (require valid JWT cookie)
router.get("/me", protect, getProfile);
router.post("/logout", protect, logoutCustomer);

// Bonus — change password (protected)
router.patch("/change-password", protect, changePassword);

module.exports = router;
