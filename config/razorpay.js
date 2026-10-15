const Razorpay = require("razorpay");

/**
 * Razorpay SDK instance — Lab-06
 *
 * Security rules:
 *  - key_secret is read from environment variables ONLY
 *  - This file (and the secret) must never reach the React bundle
 *  - The secret must never be returned in any API response
 *  - Add .env to .gitignore before committing
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
