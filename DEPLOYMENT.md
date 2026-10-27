# 🚀 Crown & Chic — Deployment Guide

This document outlines the deployment strategy for the Crown & Chic full-stack e-commerce platform on platforms such as Vercel, Node.js server, or containerized Docker environments.

---

## 1. Vercel Deployment (Recommended)

1. **Connect Repository**: Import the project repository into your Vercel team dashboard.
2. **Framework Preset**: Next.js (automatically detected).
3. **Environment Variables**: Add the following in Project Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your production domain, e.g. `https://crownandchic.com`)
   - `NEXT_PUBLIC_DEFAULT_CURRENCY`: `BDT`
   - `NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD`: `2500`
4. **Deploy**: Trigger production deployment.

---

## 2. Docker / Self-Hosted Node.js Deployment

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 3. Post-Deployment Verification Checklist
- [ ] Storefront loads at root URL with logo, hero carousel, and latest products.
- [ ] Product details page displays dynamic variants (Size, Color), price recalculation, and stock.
- [ ] Cart drawer opens and updates live items and subtotal.
- [ ] Checkout completes with Bangladesh division/district/thana cascading and validates mobile number format.
- [ ] Order confirmation renders public Order Number.
- [ ] Order tracking page fetches order timeline by Order Number.
- [ ] Admin console (`/admin`) is accessible and allows order status updates, payment verification, and stock adjustment.
