const mongoose = require("mongoose");
const Product = require("../models/product.model");

// ── Task 2: Create Product ────────────────────────────────────────────────────
/**
 * POST /products
 * Creates a new product and saves it to MongoDB.
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Basic presence checks (Mongoose will also validate types/ranges)
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (price === undefined || price === null) missingFields.push("price");
    if (!category) missingFields.push("category");
    if (!image) missingFields.push("image");
    if (stock === undefined || stock === null) missingFields.push("stock");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    // Mongoose validation errors (price > 0, stock >= 0, etc.)
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }

    console.error("createProduct error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ── Task 3 & 5: Get All Products (with search + category filter) ───────────────
/**
 * GET /products
 * GET /products?search=keyboard
 * GET /products?category=Electronics
 * GET /products?search=keyboard&category=Electronics
 */
const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    // Build the query object dynamically
    const query = {};

    if (search) {
      // Case-insensitive partial match on product name
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      // Exact category match (case-insensitive)
      query.category = { $regex: `^${category}$`, $options: "i" };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("getAllProducts error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ── Task 4: Get Single Product ────────────────────────────────────────────────
/**
 * GET /products/:id
 * Returns a single product by its MongoDB _id.
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    console.error("getProductById error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
