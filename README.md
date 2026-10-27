# 👑 Crown & Chic — Premium Full-Stack E-Commerce Platform

> **Brand Tagline**: Fashion ✦ Beauty ✦ Lifestyle  
> **Target Region**: Bangladesh (BDT ৳, Dhaka & Nationwide Delivery, bKash, Nagad, Rocket, Cash on Delivery)  
> **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Supabase PostgreSQL, Supabase Auth & Storage.

---

## 🌟 Visual Preview & Brand Identity

Crown & Chic is a production-oriented, responsive fashion boutique e-commerce application designed with a soft luxury feminine editorial aesthetic:
- **Rose Pink**: `#D85C83`
- **Deep Pink**: `#BE3D69`
- **Soft Blush**: `#FCE8EE`
- **Ivory**: `#FFFDF8`
- **Champagne Gold**: `#C49A52`
- **Dark Text**: `#30252A`
- **Muted Text**: `#796B70`

The official Crown & Chic brand logo and emblems are integrated directly into `public/images/brand/`.

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Top Announcement Bar**: Configurable promotional updates, free shipping thresholds, and order tracking shortcut.
- **Sticky Header**: Official brand logo, real-time product search with keyword matching, login/register modal link, social media handles, wishlist counter, and cart badge showing live item count and BDT subtotal.
- **Slide-Out Cart Drawer**: Slides smoothly from the right with item thumbnails, size/color variant tags, quantity stepper, trash button, subtotal calculation, and instant checkout link.
- **Hero Promotional Carousel**: High-fashion promotional slides with desktop/mobile images, headings ("New Collection FOR YOUR BEAUTIFUL YOU"), CTA buttons, and slide scheduling.
- **Shop by Category**: Circular cards with soft blush backgrounds for Women's Fashion, Men's Fashion, Kids Fashion, Hijabs, Bags, Footwear, Beauty, and Living.
- **Product Details Page (`/products/[slug]`)**:
  - Image gallery with thumbnails
  - Dynamic variant matrix (Size: S, M, L, XL; Color: Rose Pink, White, Black, Beige)
  - Selecting variants dynamically updates SKU, price, stock availability, and images
  - Interactive Size Guide modal with Bangladesh standard sizing chart
  - Quantity controls with client and server stock validation
  - Tabs for Description, Fabric Specifications, Delivery & Returns, and Reviews
  - Direct "Add to Cart" and "Buy Now" workflows
- **Low-Friction Checkout (`/checkout`)**:
  - Bangladesh cascading dropdowns: Division → District → Upazila/Thana
  - Strict Bangladesh mobile number validation (`013-019XXXXXXXX`)
  - Automated shipping fee calculation (Inside Dhaka ৳60, Outside Dhaka ৳120, Free over ৳2,500)
  - Payment methods: Cash on Delivery (COD), manual bKash, Nagad, Rocket, and Bank Transfer
  - Transaction ID and sender number submission for mobile banking
- **Live Order Tracking (`/track-order`)**:
  - Track parcel status using public Order Number (e.g., `CNC-20261026-1024`)
  - Visual status timeline: Placed → Confirmed → Processing → Shipped → Delivered.

---

### 🛡️ Administration Console (`/admin`)
- **Executive Dashboard KPI Metrics**:
  - Total Users: `1,245` (+12%)
  - Total Orders: `3,520` (+8%)
  - Total Products: `248` (+15%)
  - Total Revenue: `৳ 8,76,500` (+18%)
- **Recent Orders Management**: Change statuses with instant audit record and stock auto-restoration upon cancellation.
- **Manual Payment Verification Queue**: Review customer-submitted bKash/Nagad/Rocket Transaction IDs, sender phone, and amount with one-click "Verify & Mark Paid" or "Reject".
- **Fake Order Prevention & Risk Review**:
  - Automated heuristics flag rapid duplicate orders and high-value COD orders
  - Risk scoring (0 - 100) and review queue for administrators.
- **Variant-Level Stock & Inventory Audit**: Edit stock quantities in real time with low-stock warnings.
- **Store Configuration**: Edit top announcement text, bKash/Nagad/Rocket recipient numbers, and delivery charges.

---

## 🏗️ Supabase Architecture

Complete production-grade SQL migrations are provided in `supabase/migrations/`:
1. `00001_initial_schema.sql`: 30+ tables with UUID primary keys, check constraints, integer BDT monetary fields, indexes, and soft-delete capabilities.
2. `00002_rls_and_storage.sql`: Row-Level Security (RLS) policies guaranteeing customer data isolation, public catalog read, and strictly private payment proof buckets.
3. `00003_functions_and_triggers.sql`: Atomic PL/pgSQL stored procedures for inventory reservation/deduction with row-level locks (`SELECT FOR UPDATE`), preventing race conditions and overselling.
4. `seed.sql`: Rich initial catalog matching the brand mockup.

---

## 💻 Local Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Launch development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the storefront, and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin console.

---

## 🧪 Testing

The codebase includes an automated test suite verifying:
- BDT currency formatting and calculations
- Bangladesh mobile number validation and normalization
- Bangladesh geographical divisions and district cascade
- Atomic inventory deduction and overselling prevention
- Payment verification and order status transitions
- Dashboard analytics aggregation

Run the test suite:
```bash
npm test
```
