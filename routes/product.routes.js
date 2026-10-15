const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
} = require("../controllers/product.controller");

// POST   /products       — create a product
router.post("/", createProduct);

// GET    /products       — list all products (supports ?search= & ?category=)
router.get("/", getAllProducts);

// GET    /products/:id   — fetch one product by MongoDB _id
router.get("/:id", getProductById);

module.exports = router;
