<div align="center">

# ⚡ SwiftShopy

### WhatsApp Commerce + Mobile Money for Uganda

**The fastest way for Ugandan small businesses to sell online, accept MTN Mobile Money payments, and grow via WhatsApp — no tech skills needed.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Convex](https://img.shields.io/badge/Database-Convex-orange)](https://convex.dev)
[![MTN MoMo](https://img.shields.io/badge/Payments-MTN%20MoMo-yellow)](https://momodeveloper.mtn.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[🚀 Live Demo](#) &nbsp;·&nbsp; [📖 Setup Guide](#-quick-start) &nbsp;·&nbsp; [🐛 Issues](https://github.com/musinguziemma1/SwiftShopy/issues)

</div>

---

## 📖 Table of Contents

1. [What is SwiftShopy?](#-what-is-swiftshopy)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Quick Start](#-quick-start)
   - [Prerequisites](#prerequisites)
   - [Clone the Repository](#1-clone-the-repository)
   - [Install Dependencies](#2-install-dependencies)
   - [Configure Environment Variables](#3-configure-environment-variables)
   - [Set Up the Database](#4-set-up-convex-database)
   - [Seed Sample Data](#5-seed-sample-data-optional)
   - [Run the App](#6-run-the-development-server)
5. [Demo Credentials](#-demo-credentials)
6. [Project Structure](#-project-structure)
7. [Why SwiftShopy?](#-why-swiftshopy-for-uganda)
8. [Sample Data Overview](#-sample-data-overview)
9. [Deployment](#-deployment)
10. [Contributing](#-contributing)
11. [License](#-license)

---

## 🛍️ What is SwiftShopy?

**SwiftShopy** is a modern, full-stack e-commerce platform purpose-built for Uganda and East Africa. It lets small business owners create beautiful online stores in minutes, share them via WhatsApp, and get paid instantly using **MTN Mobile Money** or **Airtel Money** — Uganda's two most popular mobile payment networks.

> *"Built for Nakato selling fashion in Kampala. Built for Mugisha running an electronics shop in Kireka. Built for Apio running her kitchen catering from Ntinda."*

---

## ✨ Key Features

### 🏪 For Sellers
| Feature | Description |
|---------|-------------|
| **1-Click Store Setup** | Create your branded online store in under 2 minutes |
| **WhatsApp Sharing** | Share your store link directly to WhatsApp — customers order via chat |
| **Product Catalogue** | Add products with photos, prices, descriptions, and stock tracking |
| **Real-time Dashboard** | Track orders, revenue, and customers from any device |
| **Mobile-first Design** | Works perfectly on any smartphone — no app download required |
| **Order Management** | Accept, track, and fulfil orders with one tap |

### 💳 Payments
| Feature | Description |
|---------|-------------|
| **MTN Mobile Money** | Uganda's #1 payment network, integrated natively |
| **Airtel Money** | Full Airtel Money support for wider reach |
| **Instant Confirmation** | Buyers receive instant payment confirmation via SMS |
| **Payment Status Tracking** | Real-time webhook updates on every transaction |
| **Secure API** | PCI-compliant payment flow, no card data stored |

### 🛡️ For Admins
| Feature | Description |
|---------|-------------|
| **Admin Dashboard** | Full platform oversight — sellers, revenue, commissions |
| **Seller Verification** | KYC-style seller onboarding and approval system |
| **Commission Management** | Configurable commission tiers per seller/category |
| **Platform Analytics** | Revenue charts, GMV, seller growth, transaction trends |
| **Support Ticket System** | Built-in help desk with SLA tracking |
| **Permissions & Roles** | Fine-grained access control for admin team members |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Database** | Convex (real-time, serverless) |
| **Auth** | NextAuth.js v4 (JWT sessions) |
| **Payments** | MTN Mobile Money API, Airtel Money |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts |
| **Deployment** | Vercel (recommended) |

---

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have the following installed and ready:

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9+ (comes with Node.js)
- **Git** — [git-scm.com](https://git-scm.com)
- A free **Convex** account — [convex.dev](https://convex.dev)
- *(Optional)* MTN MoMo Developer account — [momodeveloper.mtn.com](https://momodeveloper.mtn.com)

---

### 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/musinguziemma1/SwiftShopy.git
```

Then navigate into the project folder:

```bash
cd SwiftShopy
```

---

### 2. Install Dependencies

Install all required packages with:

```bash
npm install
```

> This will install Next.js, Convex, Framer Motion, NextAuth, and all other dependencies listed in `package.json`.

---

### 3. Configure Environment Variables

Create a new file called `.env.local` in the root of the project:

```bash
touch .env.local
```

Then open it and add the following variables:

```env
# ── Convex (Database) ────────────────────────────────
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# ── NextAuth (Authentication) ────────────────────────
NEXTAUTH_URL=http://localhost:3014
NEXTAUTH_SECRET=your-super-secret-key-change-in-production

# ── MTN Mobile Money API ─────────────────────────────
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_MOMO_API_KEY=your-mtn-api-key
MTN_MOMO_SUBSCRIPTION_KEY=your-subscription-key
MTN_MOMO_COLLECTION_USER_ID=your-collection-user-id
MTN_MOMO_COLLECTION_API_SECRET=your-collection-secret
MTN_MOMO_TARGET_ENV=sandbox
```

> **Note:** You can get your `NEXT_PUBLIC_CONVEX_URL` after completing Step 4 below.

---

### 4. Set Up Convex Database

Log in to Convex and push the database schema:

```bash
# Step 1 — Log in (opens browser)
npx convex login

# Step 2 — Push schema and backend functions
npx convex deploy
```

After deploying, copy the **Convex URL** shown in the terminal and paste it as the value of `NEXT_PUBLIC_CONVEX_URL` in your `.env.local` file.

---

### 5. Seed Sample Data *(Optional)*

To populate the database with demo stores, products, orders, and transactions, run:

```bash
npx convex run seed:seedAll
```

This will insert:

| Data | Count |
|------|-------|
| Users (1 admin + 3 sellers) | 4 |
| Stores (fashion, electronics, food) | 3 |
| Products across all stores | 18 |
| Orders (paid / pending / failed) | 12 |
| Transactions (MTN MoMo + Airtel Money) | 12 |
| **Total seeded revenue** | **UGX 2,045,000** |

---

### 6. Run the Development Server

Start the app locally:

```bash
npm run dev
```

Open your browser and visit:

```
http://localhost:3014
```

You should see the SwiftShopy landing page. 🎉

---

## 🔐 Demo Credentials

Use these accounts to explore the platform right away:

### 👑 Admin Account
| Field | Value |
|-------|-------|
| **Login URL** | `http://localhost:3014/login` |
| **Email** | `admin@swiftshopy.com` |
| **Password** | `admin123` |
| **Access** | Full platform — sellers, analytics, commissions, permissions, settings |

### 🛍️ Seller Account
| Field | Value |
|-------|-------|
| **Login URL** | `http://localhost:3014/login` |
| **Email** | `seller@swiftshopy.com` |
| **Password** | `seller123` |
| **Access** | Seller dashboard — products, orders, revenue for "Nakato Styles" |

> ⚠️ **Security reminder:** Change these credentials before deploying to production!

---

## 📁 Project Structure

```
SwiftShopy/
│
├── app/                              # Next.js 14 App Router (all pages live here)
│   ├── (admin)/
│   │   └── admin/page.tsx            # Admin dashboard (protected)
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login page
│   │   └── signup/page.tsx           # Signup / registration page
│   ├── (dashboard)/
│   │   └── dashboard/page.tsx        # Seller dashboard (protected)
│   ├── api/
│   │   ├── auth/[...nextauth]/       # NextAuth authentication routes
│   │   ├── pay/                      # MTN MoMo payment initiation
│   │   ├── pay/status/               # Payment status polling
│   │   └── webhooks/mtn/             # MTN MoMo webhook handler
│   ├── shop/[slug]/page.tsx          # Public storefront (per seller)
│   ├── layout.tsx                    # Root layout (fonts, providers, CSS vars)
│   ├── page.tsx                      # Landing / marketing page
│   └── globals.css                   # Global Tailwind CSS styles
│
├── components/
│   ├── ui/                           # Reusable UI components
│   │   ├── ai-chat.tsx               # Floating AI chat assistant widget
│   │   ├── background-paths.tsx      # Animated SVG hero background
│   │   ├── dotted-surface.tsx        # Dot-grid decorative background
│   │   └── notifications-center.tsx  # Bell icon notification dropdown
│   └── providers/
│       └── Providers.tsx             # Convex + NextAuth session wrapper
│
├── convex/                           # Convex serverless backend
│   ├── schema.ts                     # Database table definitions
│   ├── users.ts                      # User queries & mutations
│   ├── stores.ts                     # Store management
│   ├── products.ts                   # Product CRUD operations
│   ├── orders.ts                     # Order management
│   ├── transactions.ts               # Payment transaction records
│   ├── analytics.ts                  # Analytics queries
│   └── seed.ts                       # Sample data seed (run once)
│
├── lib/
│   ├── auth.ts                       # NextAuth v4 config & demo users
│   ├── utils.ts                      # Helper utility functions
│   └── mtn/                          # MTN MoMo API client
│
├── hooks/                            # Custom React hooks
├── types/                            # TypeScript type definitions
├── public/                           # Static assets (images, icons)
├── .env.local                        # Your local environment variables (git-ignored)
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
└── tsconfig.json                     # TypeScript configuration
```

---

## 🌍 Why SwiftShopy for Uganda?

### The Problem
- Over **60% of Ugandan SMEs** have no online presence
- **Credit card penetration** is under 5% — most people pay with mobile money
- Existing platforms (Shopify, WooCommerce) are expensive, complex, and not localised
- WhatsApp is already used for business by millions of Ugandans — but payments are still manual

### Our Solution
SwiftShopy meets sellers **where they already are**:

- 📱 **WhatsApp-native** — Share your store link directly in any WhatsApp chat
- 💸 **MoMo-native** — MTN Mobile Money and Airtel Money built in from day one
- 🇺🇬 **Uganda-first** — UGX currency, local phone formats (+256), familiar UX patterns
- ⚡ **Instant setup** — From signup to first sale in under 5 minutes

---

## 📊 Sample Data Overview

After running the seed command, you'll have three fully populated demo stores:

### Demo Stores
| Store | Category | Seller | Phone |
|-------|----------|--------|-------|
| Nakato Styles | Fashion & Accessories | Sarah Nakato | +256772100001 |
| Mugisha Electronics | Electronics & Gadgets | Joseph Mugisha | +256752200002 |
| Apio's Kitchen | Food & Catering | Grace Apio | +256783300003 |

### Sample Products (18 total)

**Nakato Styles:**
Ankara Wrap Dress (UGX 85,000) · Leather Handbag (UGX 120,000) · Kitenge Shirt (UGX 55,000) · Beaded Necklace Set (UGX 35,000) · Platform Sandals (UGX 70,000) · Gomesi Traditional (UGX 145,000)

**Mugisha Electronics:**
Samsung Galaxy A15 (UGX 850,000) · Wireless Earbuds Pro (UGX 95,000) · 20000mAh Power Bank (UGX 75,000) · Screen Protector (UGX 8,000) · Laptop Cooling Pad (UGX 55,000) · Smart Watch (UGX 120,000)

**Apio's Kitchen:**
Rolex 2-Pack (UGX 8,000) · Office Packed Lunch (UGX 12,000) · Groundnut Stew 1L (UGX 18,000) · Passion Fruit Juice (UGX 5,000) · Mandazi Dozen (UGX 6,000) · Catering Package 20 Pax (UGX 450,000)

### Transaction Summary
| Metric | Value |
|--------|-------|
| Total Orders | 12 |
| Paid | 9 |
| Pending | 2 |
| Failed | 1 |
| **Total Revenue** | **UGX 2,045,000** |
| Payment Providers | MTN MoMo (9) + Airtel Money (3) |

---

## 🚢 Deployment

### Deploy to Vercel *(Recommended)*

```bash
# Install the Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

Then go to your Vercel project dashboard → **Settings → Environment Variables** and add all the values from your `.env.local` file.

### Deploy Convex to Production

```bash
npx convex deploy --prod
```

Make sure to update `NEXT_PUBLIC_CONVEX_URL` in Vercel with the new production Convex URL.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: describe your change"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request on GitHub

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**musinguziemma1** — [GitHub Profile](https://github.com/musinguziemma1)

---

<div align="center">

**Built with ❤️ for Ugandan entrepreneurs**

*SwiftShopy — Sell smart. Get paid fast.*

</div>
