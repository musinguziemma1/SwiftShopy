<![CDATA[<div align="center">

# ⚡ SwiftShopy

### WhatsApp Commerce + Mobile Money for Uganda

**The fastest way for Ugandan small businesses to sell online, accept MTN Mobile Money payments, and grow via WhatsApp — no tech skills needed.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Convex](https://img.shields.io/badge/Database-Convex-orange)](https://convex.dev)
[![MTN MoMo](https://img.shields.io/badge/Payments-MTN%20MoMo-yellow)](https://momodeveloper.mtn.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[🚀 Live Demo](#) · [📖 Docs](#getting-started) · [🐛 Issues](https://github.com/musinguziemma1/SwiftShopy/issues)

---

![SwiftShopy Hero](https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop)

</div>

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

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** or **yarn**
- A **Convex** account → [convex.dev](https://convex.dev) (free tier available)
- MTN MoMo Developer account → [momodeveloper.mtn.com](https://momodeveloper.mtn.com) *(for payments)*

### 1. Clone the Repository

```bash
git clone https://github.com/musinguziemma1/SwiftShopy.git
cd SwiftShopy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
# ── Convex ──────────────────────────────────────────
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# ── NextAuth ─────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3014
NEXTAUTH_SECRET=your-super-secret-key-here

# ── MTN Mobile Money ─────────────────────────────────
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_MOMO_API_KEY=your-mtn-api-key
MTN_MOMO_SUBSCRIPTION_KEY=your-subscription-key
MTN_MOMO_COLLECTION_USER_ID=your-collection-user-id
MTN_MOMO_COLLECTION_API_SECRET=your-collection-secret
MTN_MOMO_TARGET_ENV=sandbox
```

### 4. Set Up Convex Database

```bash
# Log in to Convex
npx convex login

# Push the schema and functions
npx convex deploy
```

### 5. Seed Sample Data *(Optional)*

Load sample stores, products, orders, and transactions to explore the platform:

```bash
npx convex run seed:seedAll
```

This inserts:
- ✅ 4 users (1 admin + 3 sellers)
- ✅ 3 stores (fashion, electronics, food)
- ✅ 18 products across all stores
- ✅ 12 orders (paid / pending / failed)
- ✅ 12 transactions (MTN MoMo + Airtel Money)
- ✅ Total seeded revenue: **UGX 2,045,000**

### 6. Run the Development Server

```bash
npm run dev
```

Visit **[http://localhost:3014](http://localhost:3014)** 🎉

---

## 🔐 Demo Credentials

Use these to log in and explore the platform immediately:

### 👑 Admin Account
| Field | Value |
|-------|-------|
| **URL** | `/login` |
| **Email** | `admin@swiftshopy.com` |
| **Password** | `admin123` |
| **Access** | Full platform admin — sellers, analytics, commissions, settings |

### 🛍️ Seller Account
| Field | Value |
|-------|-------|
| **URL** | `/login` |
| **Email** | `seller@swiftshopy.com` |
| **Password** | `seller123` |
| **Access** | Seller dashboard — products, orders, revenue for "Nakato Styles" |

> ⚠️ **Important:** Change these credentials before deploying to production!

---

## 📁 Project Structure

```
SwiftShopy/
├── app/                          # Next.js 14 App Router
│   ├── (admin)/admin/            # Admin dashboard (protected)
│   ├── (auth)/                   # Login & Signup pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/dashboard/    # Seller dashboard (protected)
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth API route
│   │   ├── pay/                  # MTN MoMo payment initiation
│   │   ├── pay/status/           # Payment status check
│   │   └── webhooks/mtn/         # MTN MoMo webhook receiver
│   ├── shop/[slug]/              # Public seller storefront
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── ui/                       # Shared UI components
│   │   ├── ai-chat.tsx           # Floating AI chat widget
│   │   ├── background-paths.tsx  # Animated SVG hero background
│   │   ├── dotted-surface.tsx    # Dot-grid section backgrounds
│   │   └── notifications-center.tsx  # Admin notification dropdown
│   ├── providers/                # React context providers
│   │   └── Providers.tsx         # Convex + NextAuth session wrapper
│   ├── layout/                   # Layout components
│   └── modules/                  # Feature-specific components
│
├── convex/                       # Convex backend (real-time DB)
│   ├── schema.ts                 # Database schema
│   ├── products.ts               # Product CRUD mutations/queries
│   ├── orders.ts                 # Order management
│   ├── transactions.ts           # Payment transaction records
│   ├── stores.ts                 # Store management
│   ├── users.ts                  # User management
│   ├── analytics.ts              # Platform analytics queries
│   └── seed.ts                   # Sample data seed mutation
│
├── lib/
│   ├── auth.ts                   # NextAuth v4 configuration
│   ├── utils.ts                  # Utility functions
│   └── mtn/                      # MTN MoMo API integration
│       └── ...
│
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
└── public/                       # Static assets
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion animations |
| **Database** | Convex (real-time, serverless) |
| **Auth** | NextAuth.js v4 (JWT sessions) |
| **Payments** | MTN Mobile Money API, Airtel Money |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts |
| **Deployment** | Vercel (recommended) |

---

## 🌍 Why SwiftShopy for Uganda?

### The Problem
- Over **60% of Ugandan SMEs** have no online presence
- **Credit card penetration** is under 5% — most people pay with mobile money
- Existing e-commerce platforms (Shopify, WooCommerce) are expensive and complex
- WhatsApp is already used for business by millions of Ugandans — but payments are manual

### Our Solution
SwiftShopy meets sellers **where they already are**:
- 📱 **WhatsApp-native**: Share your store link in any WhatsApp conversation
- 💸 **MoMo-native**: MTN Mobile Money payment flow built in, not bolted on
- 🇺🇬 **Uganda-first**: UGX currency, local phone formats, familiar UX patterns
- ⚡ **Instant setup**: From signup to first sale in under 5 minutes

---

## 📊 Seeded Sample Data Overview

After running `npx convex run seed:seedAll`, you'll have:

### Stores & Sellers
| Store | Category | Seller | Phone |
|-------|----------|--------|-------|
| Nakato Styles | Fashion & Accessories | Sarah Nakato | +256772100001 |
| Mugisha Electronics | Electronics & Gadgets | Joseph Mugisha | +256752200002 |
| Apio's Kitchen | Food & Catering | Grace Apio | +256783300003 |

### Sample Products (18 total)
**Nakato Styles:** Ankara Wrap Dress (UGX 85,000) · Leather Handbag (UGX 120,000) · Kitenge Shirt (UGX 55,000) · Beaded Necklace Set (UGX 35,000) · Platform Sandals (UGX 70,000) · Gomesi Traditional (UGX 145,000)

**Mugisha Electronics:** Samsung Galaxy A15 (UGX 850,000) · Wireless Earbuds Pro (UGX 95,000) · 20000mAh Power Bank (UGX 75,000) · Screen Protector (UGX 8,000) · Laptop Cooling Pad (UGX 55,000) · Smart Watch (UGX 120,000)

**Apio's Kitchen:** Rolex 2-Pack (UGX 8,000) · Office Packed Lunch (UGX 12,000) · Groundnut Stew 1L (UGX 18,000) · Passion Fruit Juice (UGX 5,000) · Mandazi Dozen (UGX 6,000) · Catering 20 Pax (UGX 450,000)

### Transaction Summary
| Metric | Value |
|--------|-------|
| Total Orders | 12 |
| Paid Orders | 9 |
| Pending Orders | 2 |
| Failed Orders | 1 |
| **Total Revenue** | **UGX 2,045,000** |
| Payment Providers | MTN MoMo (9) + Airtel Money (3) |

---

## 🚢 Deployment

### Deploy to Vercel *(Recommended)*

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Deploy Convex to Production

```bash
npx convex deploy --prod
```

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**musinguziemma1** — [GitHub](https://github.com/musinguziemma1)

---

<div align="center">

**Built with ❤️ for Ugandan entrepreneurs**

*SwiftShopy — Sell smart. Get paid fast.*

</div>
]]>
