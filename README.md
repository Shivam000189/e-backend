# E-Commerce Backend API

A RESTful backend for an e-commerce platform built with Node.js, Express, and MongoDB.

## Tech Stack
- Node.js + Express 5
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Features
- User registration and login with JWT
- Role-based access (admin / seller / user)
- Product CRUD with category support
- Cart management
- Order placement and cancellation
- Product search with pagination and filters
- Review and rating system
- Seller dashboard APIs for products, orders, stock, and inventory summaries
- Basic collaborative-filtering recommendations with popular/category fallback

## Getting Started

### Prerequisites
- Node.js >= 20
- MongoDB URI

### Installation
```bash
git clone <your-repo-url>
cd ecommerce-backend
npm install
```

### Environment Variables
Create a `.env` file:
    put these thing into this file 

    PORT
    DB
    SECRET_KEY




### Run
```bash
npm run dev
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login user |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /p1/products | Public | List products with filters |
| GET | /p1/products/search | Public | Search products |
| GET | /p1/product/:id | Public | Product details |
| POST | /p1/products/create | Seller/Admin | Create product |
| PUT | /p1/products/:id | Seller/Admin | Update owned product |
| DELETE | /p1/products/:id | Seller/Admin | Soft delete owned product |

Product listing/search query params:
`search`, `category`, `minPrice`, `maxPrice`, `minRating`, `sort`, `sortDir`, `page`, `limit`.
Allowed sort fields: `price`, `createdAt`, `rating`, `stock`, `name`.

### Seller Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /p1/seller/products | Seller product inventory |
| GET | /p1/seller/orders | Orders containing seller products |
| GET | /p1/seller/inventory/summary | Inventory counts and low-stock summary |
| GET | /p1/seller/inventory/low-stock | Low-stock products |
| PATCH | /p1/seller/products/:id/stock | Update product stock |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /p1/cart | Add to cart |
| GET | /p1/cart | Get cart |
| PUT | /p1/cart | Update quantity |
| DELETE | /p1/cart/:productId | Remove item |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /p1/orders | Auth | Place order |
| GET | /p1/orders/my | Auth | My orders |
| GET | /p1/orders/:id | Auth | Order details |
| PUT | /p1/orders/:id/cancel | Auth | Cancel order |
| GET | /p1/orders/orders | Admin | All orders |
| PUT | /p1/admin/orders/:id/status | Admin | Update status |
| PUT | /p1/admin/orders/:id/payment | Admin | Update payment status |

### Recommendations
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /p1/products/:productId/recommendations | Public | Products often bought together |
| GET | /p1/recommendations | Auth | Personalized recommendations |





## File Structure

ecommerce-backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── cart.controller.js
│   ├── category.controller.js
│   ├── order.controller.js
│   ├── product.controller.js
│   └── review.controller.js       ← new
├── middleware/
│   ├── adminMiddleware.js
│   ├── authMiddleware.js
│   ├── rateLimiter.js              ← new
│   └── validate.js                 ← new
├── models/
│   ├── User.js
│   ├── cart.js
│   ├── category.js
│   ├── order.js
│   ├── product.js
│   └── review.js                   ← new
├── routes/
│   ├── authRoutes.js
│   └── product.routes.js
├── validators/
│   ├── auth.validator.js           ← new
│   └── product.validator.js        ← new
├── .env
├── .gitignore
├── app.js
├── index.js
└── README.md                       ← fill this in



