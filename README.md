# ShopKart

ShopKart is a full-stack shopping app built with MongoDB, Express, React, and Node.js. Browse and search a product catalogue, manage a cart and wishlist, and place orders through Razorpay.

## Features

- Product catalogue with search and category filtering
- Customer registration, login, profile, and password changes
- Wishlist and quantity-based shopping cart
- Checkout, Razorpay payment verification, and order history
- Responsive React interface with a Vite development server
- MongoDB persistence, with an in-memory MongoDB fallback for local development

## Tech stack

- **Frontend:** React, React Router, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Payments:** Razorpay

## Getting started

### Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB (optional for local development; the server can start an in-memory database when a local MongoDB connection is refused)

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file in the project root. Keep this file private; it is excluded from Git.

```dotenv
PORT=3000
MONGO_URI=mongodb://localhost:27017/shopkart
JWT_SECRET=replace-with-a-long-random-secret
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

`PORT` and `MONGO_URI` have defaults. Authentication and payment flows need their corresponding secrets and Razorpay credentials. Use Razorpay test credentials for local testing. Never commit real credentials.

### Run the app

Start both the API and the Vite frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API runs on [http://localhost:3000](http://localhost:3000); Vite proxies API requests to it.

You can also run the processes separately:

```bash
npm run server  # API with nodemon
npm run client  # Vite frontend
```

Create a production frontend bundle with `npm run build`; preview it with `npm run preview`. Run the API with `npm start`.

## API overview

| Base path | Purpose |
| --- | --- |
| `/customers` | Registration, login, profile, logout, password change |
| `/products` | Product listing, search, filtering, and product details |
| `/wishlist` | Authenticated wishlist management |
| `/cart` | Authenticated cart and quantity management |
| `/orders` | Authenticated checkout, payment verification, and order history |

The root endpoint (`GET /`) returns an API health message. Most customer, cart, wishlist, and order operations require authentication.

## Project structure

```text
config/         Service configuration
controllers/    Request handlers and business logic
middlewares/    Authentication middleware
models/         Mongoose data models
routes/         Express API routes
src/            React app, components, pages, and API client
utils/          Shared server utilities
index.js        Express server and database startup
```

## Notes

- Product creation is exposed by the API; there is no separate admin interface in the current app.
- When using the in-memory MongoDB fallback, data is temporary and disappears when the server stops.
