# 🗄️ Crown & Chic — Supabase Database Setup & Initialization

This guide explains how to connect and initialize your Supabase PostgreSQL database for Crown & Chic.

---

## 1. Prerequisites
1. Create an account and new project on [Supabase](https://supabase.com).
2. Note your **Project URL**, **Anon Key**, and **Service Role Key** from `Project Settings` → `API`.

---

## 2. Environment Variables Configuration
In your project root, create `.env.local` based on `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> [!CAUTION]
> Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to frontend client code.

---

## 3. Running SQL Migrations

Open the **SQL Editor** in your Supabase Dashboard and run the migration scripts in the exact order:

### Step 1: Initial Schema
Run `supabase/migrations/00001_initial_schema.sql`  
*Creates tables: profiles, roles, user_roles, addresses, categories, products, product_variants, carts, orders, order_items, payment_submissions, inventory_movements, site_settings, and fraud_review_flags.*

### Step 2: Row-Level Security & Storage
Run `supabase/migrations/00002_rls_and_storage.sql`  
*Enables RLS on all tables, establishes customer isolation policies, and configures storage buckets (`catalog-images`, `brand-assets`, and private `payment-proofs`).*

### Step 3: Atomic Stored Procedures & Triggers
Run `supabase/migrations/00003_functions_and_triggers.sql`  
*Creates atomic inventory deduction with row locks (`SELECT FOR UPDATE`), inventory restoration on order cancellation, updated_at timestamps, and new user profile trigger.*

### Step 4: Seed Data
Run `supabase/seed.sql`  
*Seeds initial categories, products, variant matrices, payment methods, hero banners, and site configuration.*

---

## 4. Bootstrapping the Initial Super Admin
To assign admin privileges to a registered user:

1. Register an account through `/auth` or Supabase Auth.
2. Note the user's `id` from the `auth.users` table.
3. In the SQL Editor, execute:

```sql
INSERT INTO public.user_roles (user_id, role_id)
VALUES (
    'YOUR_USER_UUID_HERE',
    (SELECT id FROM public.roles WHERE name = 'super_admin')
)
ON CONFLICT (user_id, role_id) DO NOTHING;
```

This user now has full administrative rights across the `/admin` portal.
