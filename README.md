# 🚴 GearUp — Sports & Outdoor Equipment Rental API

[![Node.js](https://img.shields.io/badge/Node.js-v20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SSLCommerz](https://img.shields.io/badge/Payment-SSLCommerz-006699?style=for-the-badge)](https://sslcommerz.com/)

**GearUp** is a backend RESTful API built with **Express.js**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. It powers a full-featured peer-to-peer sports and outdoor equipment rental marketplace connecting equipment providers with outdoor enthusiasts.

---

- 🖥️ **Frontend Repository**: [https://github.com/Zihad-1883/L2-A5-Gear-Up--Client](https://github.com/Zihad-1883/L2-A5-Gear-Up--Client)
- ⚙️ **Backend Server Repository**: [https://github.com/Zihad-1883/L2-A4-Gear-Up--Server](https://github.com/Zihad-1883/L2-A4-Gear-Up--Server)
- 🌐 **Live API Base URL**: `https://gearup-backend-4eca.onrender.com/api`

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Data Models & Schema](#-data-models--schema)
- [Rental Order Lifecycle](#-rental-order-lifecycle)
- [Payment Gateway Integration](#-payment-gateway-integration)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Database Migration](#database-migration)
  - [Running the Server](#running-the-server)
- [API Reference](#-api-reference)
- [Error Handling Standard](#-error-handling-standard)
- [Postman Collection](#-postman-collection)
- [Author & License](#-author--license)

---

## ✨ Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **Multi-Role User System**: Supports `CUSTOMER`, `PROVIDER`, and `ADMIN` roles.
- **Secure Authentication**: JWT-based access tokens paired with long-lived refresh tokens set via HTTP-only, secure cookies.
- **Password Security**: Passwords hashed with `bcryptjs`.
- **User Management**: Profile retrieval (`/api/auth/me`), updates, and Admin control for user status (`ACTIVE` / `BLOCKED`).

### 📦 2. Category & Gear Management
- **Categorization**: Admin-managed item categories.
- **Gear Catalog**: Providers can add, modify, and delete their own equipment listings.
- **Search & Filtering**: Comprehensive search parameters (`search`, `category`, `brand`, `minPrice`, `maxPrice`, `page`, `limit`, `sortBy`, `sortOrder`).
- **Stock Management**: Transactional stock reservation and availability tracking.

### 🔄 3. Rental Order Workflow
- **Multi-step Order Lifecycle**: Controlled transitions (`PENDING` ➔ `APPROVED` / `REJECTED` ➔ `PAID` ➔ `PICKED_UP` ➔ `RETURNED` / `CANCELLED`).
- **Transactional Consistency**: Prisma transactions guarantee stock availability during order placement and return stock upon cancellation.
- **Role Isolation**: Customers manage their bookings; providers manage incoming orders for their gear.

### 💳 4. SSLCommerz Payment Integration
- **Direct Online Payments**: Integrated via `sslcommerz-lts` SDK.
- **Two-Step Verification**: Receives Instant Payment Notification (IPN) callbacks and performs server-side validation against SSLCommerz Validation APIs.
- **Automated Order State Update**: Transitions rental order status to `PAID` and updates payment records atomically upon successful validation.

### ⭐ 5. Verified Review System
- **Verified Purchase Requirement**: Only customers who have completed a rental (`RETURNED` status) can submit reviews.
- **Review Uniqueness**: Prevents duplicate reviews for the same customer-gear pair.

---

## 🛠 Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Runtime Environment** | Node.js (v20+) |
| **Web Framework** | Express.js (v5) |
| **Language** | TypeScript (Strict mode enabled) |
| **ORM** | Prisma (v7, multi-file schema organization) |
| **Database** | PostgreSQL (Neon Cloud / Local PostgreSQL with `@prisma/adapter-pg`) |
| **Authentication** | JWT (`jsonwebtoken`), HTTP-only Cookies (`cookie-parser`), `bcryptjs` |
| **Payment Gateway** | SSLCommerz (`sslcommerz-lts`) |
| **Bundling / Dev Tooling**| `tsup`, `tsx`, `dotenv` |

### 📁 Project Structure

```
GearUp/
├── prisma/
│   └── schema/              # Modularized Prisma schemas
│       ├── category.prisma
│       ├── enums.prisma
│       ├── gearItem.prisma
│       ├── payment.prisma
│       ├── rentalOrder.prisma
│       ├── review.prisma
│       ├── schema.prisma
│       └── user.prisma
├── src/
│   ├── config/              # Centralized environment configurations
│   ├── lib/                 # Database initialization & Prisma client setup
│   ├── milddlewares/        # Auth verification, RBAC, global error & 404 handlers
│   ├── modules/             # Modular feature controllers, routes, services & interfaces
│   │   ├── auth/
│   │   ├── category/
│   │   ├── gearItem/
│   │   ├── payments/
│   │   ├── rentalOrder/
│   │   ├── review/
│   │   └── user/
│   ├── utilis/              # Helper utilities (AppError, standard responses)
│   ├── app.ts               # Express application configuration & route mounting
│   └── server.ts            # Server entry point & DB connection bootstrapper
├── .env                     # Environment variables configuration
├── GearUp_API_Collection.postman_collection.json # Complete API postman collection
├── package.json             # Project dependencies & scripts
└── tsconfig.json            # TypeScript compiler configuration
```

---

## 📊 Data Models & Schema

```mermaid
erDiagram
    USER ||--o{ GEAR_ITEM : lists
    USER ||--o{ RENTAL_ORDER : places
    USER ||--o{ REVIEW : writes
    CATEGORY ||--o{ GEAR_ITEM : categorizes
    GEAR_ITEM ||--o{ RENTAL_ORDER_ITEM : includes
    GEAR_ITEM ||--o{ REVIEW : receives
    RENTAL_ORDER ||--o{ RENTAL_ORDER_ITEM : contains
    RENTAL_ORDER ||--o| PAYMENT : processed_by

    USER {
        string id PK
        string name
        string email UK
        string password
        Role role
        UserStatus status
        datetime createdAt
    }

    GEAR_ITEM {
        string id PK
        string name
        string description
        string brand
        float pricePerDay
        int stockQuantity
        string categoryId FK
        string providerId FK
    }

    RENTAL_ORDER {
        string id PK
        string customerId FK
        datetime startDate
        datetime endDate
        RentalOrderStatus status
        float totalAmount
    }

    RENTAL_ORDER_ITEM {
        string id PK
        string rentalOrderId FK
        string gearId FK
        int quantity
        float priceAtBooking
    }

    PAYMENT {
        string id PK
        string transactionId UK
        string rentalOrderId FK
        float amount
        PaymentProvider provider
        PaymentStatus status
        datetime paidAt
    }

    REVIEW {
        string id PK
        string customerId FK
        string gearId FK
        int rating
        string comment
    }
```

---

## 🔄 Rental Order Lifecycle

Order status transitions strictly follow this sequence:

```mermaid
flowchart LR
    A[PENDING] -->|Provider Approves| B[APPROVED]
    A -->|Provider Rejects / Customer Cancels| F[CANCELLED]
    B -->|Payment Completed| C[PAID]
    C -->|Provider Marks Picked Up| D[PICKED_UP]
    D -->|Provider Marks Returned| E[RETURNED]
```

---

## 💳 Payment Gateway Integration

Payment flow via **SSLCommerz**:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant API as GearUp Backend
    participant DB as PostgreSQL DB
    participant SSL as SSLCommerz Gateway

    Customer->>API: POST /api/payments/create { rentalOrderId }
    API->>DB: Check Order Status (Must be APPROVED)
    API->>SSL: Initiate Payment (initiatePayment API)
    SSL-->>API: Return GatewayPageURL & Session Parameters
    API-->>Customer: Return Checkout URL ({ checkoutUrl })
    Customer->>SSL: Complete Payment on Gateway Page
    SSL->>API: IPN Callback POST /api/payments/webhook
    API->>SSL: Validate Payment Transaction (SSLCommerz Validation API)
    SSL-->>API: Return Validated Status (VALID / VALIDATED)
    API->>DB: Update Payment -> COMPLETED & Order -> PAID
    API-->>SSL: Return Success Acknowledgment
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm** or **pnpm** installed
- **PostgreSQL**: Local database instance or cloud connection (Neon / Supabase / Render)

### Environment Setup

Create a `.env` file in the project directory (`GearUp/.env`) with the following variables:

```env
# Server Config
PORT=3000
APP_URL=http://localhost:3000

# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/gearup_db?schema=public"

# Authentication & Security
BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET="your_jwt_access_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
JWT_ACCESS_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Payment Gateway (SSLCommerz)
SSLCOMMERZ_STORE_ID="your_store_id"
SSLCOMMERZ_STORE_PASSWORD="your_store_password"
SSLCOMMERZ_IS_LIVE=false
```

### Database Migration

Push the Prisma schema to your PostgreSQL database and generate the Prisma Client:

```bash
# Navigate to GearUp folder
cd GearUp

# Push schema to database
npm run prisma:push

# Generate Prisma Client
npx prisma generate --schema=prisma/schema
```

### Running the Server

```bash
# Start development server with tsx watch
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```

---

## 📌 API Reference

### 🔑 Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (`CUSTOMER` or `PROVIDER`) |
| `POST` | `/api/auth/login` | Public | Login user & receive JWT access token & cookies |
| `POST` | `/api/auth/refresh-token` | Public | Generate new access token via refresh token cookie |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user's profile |

### 👤 User Management (`/api/user` & `/api/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `PUT` | `/api/user/me` | Authenticated | Update authenticated user's profile |
| `GET` | `/api/admin/users` | ADMIN | Get list of all users |
| `PATCH` | `/api/admin/users/:id` | ADMIN | Toggle user status (`ACTIVE` / `BLOCKED`) |

### 🏷️ Categories (`/api/categories`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | Fetch list of gear categories |
| `POST` | `/api/categories` | ADMIN | Create a new gear category |

### 🎯 Gear Items (`/api/gear` & `/api/provider/gear`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/gear` | Public | List & search gear (with pagination, filters & sorting) |
| `GET` | `/api/gear/:id` | Public | Fetch details of a single gear item |
| `POST` | `/api/provider/gear` | PROVIDER | List a new gear item |
| `PUT` | `/api/provider/gear/:id` | PROVIDER (Owner) | Update an existing gear listing |
| `DELETE` | `/api/provider/gear/:id` | PROVIDER (Owner) | Delete a gear listing |
| `GET` | `/api/admin/gear` | ADMIN | View all gear items listed across providers |

### 🛒 Rental Orders (`/api/rentals` & `/api/provider/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/rentals` | CUSTOMER | Create a rental booking order |
| `GET` | `/api/rentals` | Authenticated | Get customer's rental orders |
| `GET` | `/api/rentals/:id` | Authenticated | Get rental order details |
| `GET` | `/api/provider/orders` | PROVIDER | View incoming rental orders for provider's gear |
| `PATCH` | `/api/provider/orders/:id` | PROVIDER | Update order status (`APPROVED`, `REJECTED`, `PICKED_UP`, `RETURNED`) |
| `GET` | `/api/admin/rentals` | ADMIN | List all rental orders system-wide |

### 💳 Payments (`/api/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/create` | CUSTOMER | Initiate SSLCommerz payment for an APPROVED rental order |
| `POST` | `/api/payments/webhook` | Public | SSLCommerz IPN callback endpoint |
| `GET` | `/api/payments` | Authenticated | View payment transaction history |
| `GET` | `/api/payments/:id` | Authenticated | View specific payment transaction details |

### ⭐ Reviews (`/api/reviews`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reviews` | CUSTOMER | Submit review for a returned rented item |
| `GET` | `/api/reviews/gear/:id` | Public | Get all reviews for a specific gear item |

---

## 🛡 Error Handling Standard

All API endpoints return standard, predictable JSON response structures.

### Standard Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description message",
  "errorDetails": {
    "issues": []
  }
}
```

---

## 🧪 Postman Collection

A complete Postman collection is included in the codebase:
📁 `GearUp/GearUp_API_Collection.postman_collection.json`

Import this file into Postman to test authentication workflows, gear management, rental bookings, payment flows, and role-based access controls.

---

## 👨‍💻 Author & License

- **Developer**: Zihad
- **License**: [ISC](LICENSE)
