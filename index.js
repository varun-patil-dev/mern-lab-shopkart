require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());          // parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(cookieParser());          // parse cookies (needed to read req.cookies.token)

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);


// Health check — useful to confirm the server is up
app.get("/", (req, res) => {
  res.json({ message: "ShopKart Auth API is running 🛒" });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Database + Server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const { MongoMemoryServer } = require("mongodb-memory-server");

async function startDatabaseAndServer() {
  let mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/shopkart";

  try {
    await mongoose.connect(mongoUri);
  } catch (err) {
    const isLocalConnectionIssue =
      err?.message?.includes("ECONNREFUSED") ||
      err?.cause?.code === "ECONNREFUSED" ||
      err?.code === "ECONNREFUSED";

    if (!isLocalConnectionIssue) {
      throw err;
    }

    console.log("⚠️  No MongoDB server found at localhost:27017. Starting in-memory MongoDB...");
    const memoryServer = await MongoMemoryServer.create();
    mongoUri = memoryServer.getUri();
    await mongoose.connect(mongoUri);
  }

  console.log("✅  Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`🚀  ShopKart server running on http://localhost:${PORT}`);
  });
}

startDatabaseAndServer().catch((err) => {
  console.error("❌  MongoDB connection failed:", err.message);
  process.exit(1);
});
