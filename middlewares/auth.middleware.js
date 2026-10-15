const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

/**
 * Auth Middleware — protects routes that require a logged-in customer.
 *
 * Flow:
 *  1. Read the "token" cookie from the request.
 *  2. Verify it with the JWT_SECRET.
 *  3. Fetch the customer from MongoDB using the id inside the token.
 *  4. Attach the customer to req.user so controllers can use it.
 *  5. Call next() to pass control to the route handler.
 */
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
  
    // 1. No cookie → not logged in
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
      });
    }

    // 2. Verify token (throws if expired or tampered)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find the customer (exclude password from the result)
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Customer not found.",
      });
    }

    // 4. Attach to request object
    req.user = customer;

    // 5. Move to the next handler
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Invalid or expired token.",
    });
  }
};

module.exports = protect;
