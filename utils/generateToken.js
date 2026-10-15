const jwt = require("jsonwebtoken");

/**
 * Generates a JWT and stores it as an HttpOnly cookie on the response.
 * @param {object} res      - Express response object
 * @param {string} userId   - MongoDB _id of the customer
 */
const generateToken = (res, userId) => {
  const token = jwt.sign(
    { id: userId },           // payload — only the user's id
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  // Store JWT in an HttpOnly cookie so JS cannot access it
  res.cookie("token", token, {
    httpOnly: true,           // prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",       // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

module.exports = generateToken;
