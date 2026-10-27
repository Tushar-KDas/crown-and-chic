-- ============================================================================

-- CROWN & CHIC — ALL-IN-ONE COMPLETE SUPABASE DATABASE SETUP

-- Project: mbalqzdkxxewfzjiijgx

-- 100% Idempotent, Safe to Run & Re-run in Supabase SQL Editor

-- ============================================================================



-- ============================================================================
-- CROWN & CHIC E-COMMERCE PLATFORM — SUPABASE POSTGRESQL SCHEMA
-- Migration: 00001_initial_schema.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean schema setup
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('super_admin', 'admin', 'moderator', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status_type AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_type AS ENUM ('pending_confirmation', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('unpaid', 'pending_verification', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('cod', 'bkash', 'nagad', 'rocket', 'bank_transfer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE review_status_type AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE inventory_movement_type AS ENUM ('initial', 'restock', 'sale', 'cancellation_restore', 'manual_adjustment', 'loss_damage');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 1. PROFILES & RBAC
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    default_address JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role_type UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    division TEXT NOT NULL,
    district TEXT NOT NULL,
    thana TEXT NOT NULL,
    street_address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    icon_name TEXT,
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);

-- ----------------------------------------------------------------------------
-- 3. PRODUCTS & ATTRIBUTES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE,
    short_description TEXT,
    description TEXT,
    base_price INTEGER NOT NULL CHECK (base_price >= 0), -- BDT integer
    base_sale_price INTEGER CHECK (base_sale_price IS NULL OR base_sale_price <= base_price),
    status product_status_type DEFAULT 'published' NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    is_bestseller BOOLEAN DEFAULT FALSE NOT NULL,
    is_new_arrival BOOLEAN DEFAULT FALSE NOT NULL,
    is_on_sale BOOLEAN DEFAULT FALSE NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INT DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_status ON public.products(status);

CREATE TABLE IF NOT EXISTS public.product_categories (
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(product_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL, -- e.g. "Size", "Color", "Material"
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attribute_id UUID NOT NULL REFERENCES public.product_attributes(id) ON DELETE CASCADE,
    value TEXT NOT NULL, -- e.g. "S", "M", "L", "XL", "Pink", "Black"
    color_hex TEXT, -- Optional hex code for color attributes
    sort_order INT DEFAULT 0,
    UNIQUE(attribute_id, value)
);

-- ----------------------------------------------------------------------------
-- 4. PRODUCT VARIANTS (Crucial Requirement)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,
    regular_price INTEGER NOT NULL CHECK (regular_price >= 0),
    sale_price INTEGER CHECK (sale_price IS NULL OR sale_price <= regular_price),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);

CREATE TABLE IF NOT EXISTS public.product_variant_attributes (
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    attribute_value_id UUID NOT NULL REFERENCES public.product_attribute_values(id) ON DELETE CASCADE,
    PRIMARY KEY (variant_id, attribute_value_id)
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. CARTS & WISHLISTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    guest_session_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CHECK ((user_id IS NOT NULL) OR (guest_session_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(cart_id, variant_id)
);

CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- ----------------------------------------------------------------------------
-- 6. ORDERS & CHECKOUT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL, -- e.g. CNC-20261026-8492
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    division TEXT NOT NULL,
    district TEXT NOT NULL,
    thana TEXT NOT NULL,
    full_address TEXT NOT NULL,
    delivery_notes TEXT,
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    shipping_charge INTEGER NOT NULL CHECK (shipping_charge >= 0),
    discount_amount INTEGER NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    payment_method payment_method_type NOT NULL,
    order_status order_status_type DEFAULT 'pending_confirmation' NOT NULL,
    payment_status payment_status_type DEFAULT 'unpaid' NOT NULL,
    is_flagged_for_review BOOLEAN DEFAULT FALSE NOT NULL,
    risk_score INTEGER DEFAULT 0,
    risk_reasons TEXT[],
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(order_status);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    variant_title TEXT, -- e.g. "Size: M, Color: Pink"
    sku TEXT,
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status order_status_type,
    new_status order_status_type NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 7. PAYMENT METHODS & SUBMISSIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_methods (
    code payment_method_type PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    account_type TEXT, -- "Merchant" or "Personal"
    recipient_number TEXT, -- Admin manageable number
    instructions TEXT,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.payment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method payment_method_type NOT NULL,
    transaction_id TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    screenshot_url TEXT, -- Private bucket storage path
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    admin_notes TEXT,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 8. INVENTORY AUDIT & MOVEMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    movement_type inventory_movement_type NOT NULL,
    quantity_changed INTEGER NOT NULL, -- positive for restock, negative for sale
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reference_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    reason TEXT,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 9. BANNERS, REVIEWS, SETTINGS & AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    desktop_image TEXT NOT NULL,
    mobile_image TEXT,
    cta_text TEXT,
    cta_link TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status review_status_type DEFAULT 'approved' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fraud_review_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rule_triggered TEXT NOT NULL,
    risk_points INT NOT NULL,
    details TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.idempotency_records (
    key TEXT PRIMARY KEY,
    response_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);




-- ============================================================================
-- CROWN & CHIC E-COMMERCE PLATFORM — ROW LEVEL SECURITY & STORAGE
-- Migration: 00002_rls_and_storage.sql
-- ============================================================================

-- Helper functions for RBAC
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF check_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = check_user_id
          AND r.name IN ('super_admin', 'admin', 'order_manager', 'product_manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF check_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = check_user_id
          AND r.name = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- ENABLE RLS ON ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_records ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. PUBLIC READ-ONLY POLICIES FOR CATALOG
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products" ON public.products FOR SELECT
    USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Public can view product categories" ON public.product_categories;
CREATE POLICY "Public can view product categories" ON public.product_categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public can view product attributes" ON public.product_attributes;
CREATE POLICY "Public can view product attributes" ON public.product_attributes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public can view attribute values" ON public.product_attribute_values;
CREATE POLICY "Public can view attribute values" ON public.product_attribute_values FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public can view active variants" ON public.product_variants;
CREATE POLICY "Public can view active variants" ON public.product_variants FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Public can view variant attributes" ON public.product_variant_attributes;
CREATE POLICY "Public can view variant attributes" ON public.product_variant_attributes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public can view active banners" ON public.banners;
CREATE POLICY "Public can view active banners" ON public.banners FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Public can view active payment methods" ON public.payment_methods;
CREATE POLICY "Public can view active payment methods" ON public.payment_methods FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Public can view public site settings" ON public.site_settings;
CREATE POLICY "Public can view public site settings" ON public.site_settings FOR SELECT
    USING (is_public = true OR public.is_admin());

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT
    USING (status = 'approved' OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. CUSTOMER DATA ISOLATION POLICIES
-- ----------------------------------------------------------------------------
-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Addresses
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL
    USING (auth.uid() = user_id OR public.is_admin());

-- Carts & Cart Items
DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
CREATE POLICY "Users can manage own cart" ON public.carts FOR ALL
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
CREATE POLICY "Users can manage own cart items" ON public.cart_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
              AND (carts.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Wishlist
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlists;
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL
    USING (auth.uid() = user_id OR public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Payment submissions
DROP POLICY IF EXISTS "Users can insert payment submission for own order" ON public.payment_submissions;
CREATE POLICY "Users can insert payment submission for own order" ON public.payment_submissions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payment_submissions.order_id
              AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Users can view payment submission for own order" ON public.payment_submissions;
CREATE POLICY "Users can view payment submission for own order" ON public.payment_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payment_submissions.order_id
              AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Reviews
DROP POLICY IF EXISTS "Authenticated users can submit review" ON public.reviews;
CREATE POLICY "Authenticated users can submit review" ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. ADMIN MANAGEMENT POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins full manage categories" ON public.categories;
CREATE POLICY "Admins full manage categories" ON public.categories FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage products" ON public.products;
CREATE POLICY "Admins full manage products" ON public.products FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage product categories" ON public.product_categories;
CREATE POLICY "Admins full manage product categories" ON public.product_categories FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage product attributes" ON public.product_attributes;
CREATE POLICY "Admins full manage product attributes" ON public.product_attributes FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage attribute values" ON public.product_attribute_values;
CREATE POLICY "Admins full manage attribute values" ON public.product_attribute_values FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage variants" ON public.product_variants;
CREATE POLICY "Admins full manage variants" ON public.product_variants FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage variant attributes" ON public.product_variant_attributes;
CREATE POLICY "Admins full manage variant attributes" ON public.product_variant_attributes FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage product images" ON public.product_images;
CREATE POLICY "Admins full manage product images" ON public.product_images FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage orders" ON public.orders;
CREATE POLICY "Admins full manage orders" ON public.orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage order items" ON public.order_items;
CREATE POLICY "Admins full manage order items" ON public.order_items FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage order status history" ON public.order_status_history;
CREATE POLICY "Admins full manage order status history" ON public.order_status_history FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage payment methods" ON public.payment_methods;
CREATE POLICY "Admins full manage payment methods" ON public.payment_methods FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage payment submissions" ON public.payment_submissions;
CREATE POLICY "Admins full manage payment submissions" ON public.payment_submissions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage inventory movements" ON public.inventory_movements;
CREATE POLICY "Admins full manage inventory movements" ON public.inventory_movements FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage banners" ON public.banners;
CREATE POLICY "Admins full manage banners" ON public.banners FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage reviews" ON public.reviews;
CREATE POLICY "Admins full manage reviews" ON public.reviews FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage site settings" ON public.site_settings;
CREATE POLICY "Admins full manage site settings" ON public.site_settings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins full manage audit logs" ON public.admin_audit_logs FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full manage fraud flags" ON public.fraud_review_flags;
CREATE POLICY "Admins full manage fraud flags" ON public.fraud_review_flags FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Super admins manage roles" ON public.roles;
CREATE POLICY "Super admins manage roles" ON public.roles FOR ALL USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super admins manage user roles" ON public.user_roles;
CREATE POLICY "Super admins manage user roles" ON public.user_roles FOR ALL USING (public.is_super_admin());

-- ----------------------------------------------------------------------------
-- 4. STORAGE BUCKET CONFIGURATION & POLICIES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('catalog-images', 'catalog-images', true),
    ('brand-assets', 'brand-assets', true),
    ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Catalog images: public read, admin write
DROP POLICY IF EXISTS "Public Read Catalog Images" ON storage.objects;
CREATE POLICY "Public Read Catalog Images" ON storage.objects FOR SELECT
    USING (bucket_id IN ('catalog-images', 'brand-assets'));

DROP POLICY IF EXISTS "Admin Upload Catalog Images" ON storage.objects;
CREATE POLICY "Admin Upload Catalog Images" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('catalog-images', 'brand-assets') AND public.is_admin());

-- Payment proofs: strictly private
-- Only submitting user or admins can view/upload
DROP POLICY IF EXISTS "Private Upload Payment Proofs" ON storage.objects;
CREATE POLICY "Private Upload Payment Proofs" ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'payment-proofs'
        AND (auth.uid() IS NOT NULL OR public.is_admin())
    );

DROP POLICY IF EXISTS "Private Read Payment Proofs" ON storage.objects;
CREATE POLICY "Private Read Payment Proofs" ON storage.objects FOR SELECT
    USING (
        bucket_id = 'payment-proofs'
        AND (
            public.is_admin()
            OR (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
        )
    );




-- ============================================================================
-- CROWN & CHIC E-COMMERCE PLATFORM — FUNCTIONS & TRIGGERS
-- Migration: 00003_functions_and_triggers.sql
-- ============================================================================

-- Function: update timestamp automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER set_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- NEW USER TRIGGER: Create profile on auth.users insert
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- ATOMIC INVENTORY DEDUCTION WITH ROW-LEVEL LOCKING
-- Prevents overselling & race conditions
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.deduct_order_inventory(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
    r_item RECORD;
    v_current_stock INT;
    v_sku TEXT;
BEGIN
    FOR r_item IN 
        SELECT variant_id, quantity, product_title, variant_title
        FROM public.order_items
        WHERE order_id = p_order_id
    LOOP
        -- Acquire row lock
        SELECT stock_quantity, sku 
        INTO v_current_stock, v_sku
        FROM public.product_variants
        WHERE id = r_item.variant_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variant ID % not found for order item %', r_item.variant_id, r_item.product_title;
        END IF;

        IF v_current_stock < r_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for SKU % (Available: %, Requested: %)', 
                v_sku, v_current_stock, r_item.quantity;
        END IF;

        -- Update variant stock
        UPDATE public.product_variants
        SET stock_quantity = stock_quantity - r_item.quantity
        WHERE id = r_item.variant_id;

        -- Record inventory audit movement
        INSERT INTO public.inventory_movements (
            variant_id,
            movement_type,
            quantity_changed,
            previous_quantity,
            new_quantity,
            reference_order_id,
            reason
        ) VALUES (
            r_item.variant_id,
            'sale',
            -r_item.quantity,
            v_current_stock,
            v_current_stock - r_item.quantity,
            p_order_id,
            'Order placed: ' || p_order_id
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- ATOMIC INVENTORY RESTORATION (FOR CANCELLATION / RETURN)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.restore_order_inventory(p_order_id UUID, p_reason TEXT)
RETURNS VOID AS $$
DECLARE
    r_item RECORD;
    v_current_stock INT;
BEGIN
    FOR r_item IN 
        SELECT variant_id, quantity 
        FROM public.order_items
        WHERE order_id = p_order_id
    LOOP
        SELECT stock_quantity INTO v_current_stock
        FROM public.product_variants
        WHERE id = r_item.variant_id
        FOR UPDATE;

        IF FOUND THEN
            UPDATE public.product_variants
            SET stock_quantity = stock_quantity + r_item.quantity
            WHERE id = r_item.variant_id;

            INSERT INTO public.inventory_movements (
                variant_id,
                movement_type,
                quantity_changed,
                previous_quantity,
                new_quantity,
                reference_order_id,
                reason
            ) VALUES (
                r_item.variant_id,
                'cancellation_restore',
                r_item.quantity,
                v_current_stock,
                v_current_stock + r_item.quantity,
                p_order_id,
                p_reason
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;




-- ============================================================================
-- CROWN & CHIC E-COMMERCE PLATFORM — SEED DATA
-- seed.sql
-- ============================================================================

-- Roles
INSERT INTO public.roles (name, description) VALUES
    ('super_admin', 'Supreme administrator with full system privileges'),
    ('admin', 'General administrator for operations and catalog'),
    ('moderator', 'Specialist dedicated to client care, orders, and payment verification'),
    ('customer', 'Registered retail shopper')
ON CONFLICT (name) DO NOTHING;

-- Payment Methods
INSERT INTO public.payment_methods (code, name, description, is_active, account_type, recipient_number, instructions, sort_order) VALUES
    ('cod', 'Cash On Delivery', 'Pay in cash when your parcel is delivered at your doorstep', true, 'N/A', NULL, 'Keep the exact cash amount ready upon delivery.', 1),
    ('bkash', 'bKash', 'Send Money via bKash personal or merchant payment', true, 'Merchant', '01711-987654', '1. Go to your bKash app or dial *247#\n2. Select "Send Money" or "Make Payment"\n3. Enter Merchant Number: 01711-987654\n4. Enter total order amount as bill\n5. Complete transaction and submit your Transaction ID below.', 2),
    ('nagad', 'Nagad', 'Send money via Nagad wallet', true, 'Merchant', '01722-876543', '1. Dial *167# or use Nagad app\n2. Select "Send Money"\n3. Enter 01722-876543\n4. Submit Transaction ID.', 3),
    ('rocket', 'Rocket', 'Dutch-Bangla Bank Rocket mobile banking', true, 'Personal', '01853-765432', '1. Dial *322# or use Rocket app\n2. Transfer total bill to 01853-765432\n3. Enter Transaction ID.', 4),
    ('bank_transfer', 'Manual Bank Transfer', 'Direct electronic fund transfer via City Bank / DBBL', true, 'Company Account', 'City Bank: 1203498172001', 'Transfer order total to City Bank A/C: 1203498172001 (Name: Crown & Chic Ltd.) and provide deposit slip reference.', 5)
ON CONFLICT (code) DO UPDATE SET 
    recipient_number = EXCLUDED.recipient_number,
    instructions = EXCLUDED.instructions;

-- Site Settings
INSERT INTO public.site_settings (key, value, description, is_public) VALUES
    ('announcement_bar', '{"enabled": true, "text": "Free Shipping All Over Bangladesh on orders over ৳ 2,500 | Easy Return | 100% Original Products | Track Your Order"}', 'Top notification bar', true),
    ('brand_info', '{"name": "Crown & Chic", "tagline": "Fashion, Beauty & Lifestyle", "address": "House 42, Road 11, Banani, Dhaka-1213, Bangladesh", "phone": "+880 1711-987654", "email": "support@crownandchic.com", "whatsapp": "+880 1711-987654"}', 'Company details', true),
    ('social_links', '{"facebook": "https://facebook.com/crownandchic", "instagram": "https://instagram.com/crownandchic", "youtube": "https://youtube.com/@crownandchic", "tiktok": "https://tiktok.com/@crownandchic", "twitter": "https://x.com/crownandchic"}', 'Social media accounts', true),
    ('shipping_rates', '{"inside_dhaka": 60, "outside_dhaka": 120, "free_shipping_threshold": 2500}', 'Delivery fees and free shipping threshold', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Categories
INSERT INTO public.categories (id, name, slug, description, image_url, sort_order, is_active) VALUES
    ('11111111-0001-4000-8000-000000000001', 'Women''s Fashion', 'womens-fashion', 'Exquisite salwar kameez, maxi dresses, kurtis and designer sarees', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80', 1, true),
    ('11111111-0002-4000-8000-000000000002', 'Men''s Fashion', 'mens-fashion', 'Modern casual shirts, formal wear, and traditional panjabi', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80', 2, true),
    ('11111111-0003-4000-8000-000000000003', 'Kids Fashion', 'kids-fashion', 'Adorable designer frocks, ethnic wear, and comfortable kids sets', 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=600&q=80', 3, true),
    ('11111111-0004-4000-8000-000000000004', 'Hijab & Scarf', 'hijab-scarf', 'Premium chiffon, georgette, and modal hijabs & scarves', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', 4, true),
    ('11111111-0005-4000-8000-000000000005', 'Bags & Accessories', 'bags-accessories', 'Luxury designer shoulder bags, clutches, and jewelry', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80', 5, true),
    ('11111111-0006-4000-8000-000000000006', 'Footwear', 'footwear', 'Comfortable sneakers, party heels, and daily flats', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80', 6, true),
    ('11111111-0007-4000-8000-000000000007', 'Beauty & Personal Care', 'beauty-personal-care', 'Authentic skincare, fragrances, and beauty essentials', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', 7, true),
    ('11111111-0008-4000-8000-000000000008', 'Home & Living', 'home-living', 'Boutique decor, bedsheets, and living accessories', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80', 8, true)
ON CONFLICT (id) DO NOTHING;

-- Attributes: Size, Color
INSERT INTO public.product_attributes (id, name) VALUES
    ('22222222-0001-4000-8000-000000000001', 'Size'),
    ('22222222-0002-4000-8000-000000000002', 'Color')
ON CONFLICT (name) DO NOTHING;

-- Attribute Values
INSERT INTO public.product_attribute_values (id, attribute_id, value, color_hex, sort_order) VALUES
    ('33333333-0001-4000-8000-000000000001', '22222222-0001-4000-8000-000000000001', 'S', NULL, 1),
    ('33333333-0002-4000-8000-000000000002', '22222222-0001-4000-8000-000000000001', 'M', NULL, 2),
    ('33333333-0003-4000-8000-000000000003', '22222222-0001-4000-8000-000000000001', 'L', NULL, 3),
    ('33333333-0004-4000-8000-000000000004', '22222222-0001-4000-8000-000000000001', 'XL', NULL, 4),
    ('33333333-0005-4000-8000-000000000002', '22222222-0002-4000-8000-000000000002', 'Rose Pink', '#D85C83', 1),
    ('33333333-0006-4000-8000-000000000002', '22222222-0002-4000-8000-000000000002', 'White', '#FFFFFF', 2),
    ('33333333-0007-4000-8000-000000000002', '22222222-0002-4000-8000-000000000002', 'Black', '#1A1A1A', 3),
    ('33333333-0008-4000-8000-000000000002', '22222222-0002-4000-8000-000000000002', 'Champagne Gold', '#C49A52', 4)
ON CONFLICT (id) DO NOTHING;

-- Featured Products matching Mockup
INSERT INTO public.products (id, title, slug, sku, short_description, description, base_price, base_sale_price, status, is_featured, is_bestseller, is_new_arrival, is_on_sale, rating, review_count) VALUES
    ('44444444-0001-4000-8000-000000000001', 'Embroidered Salwar Kameez', 'embroidered-salwar-kameez', 'CNC-ESK-01', 'Exquisite hand-embroidered rose pink georgette salwar kameez set with matching organza dupatta.', 'Crafted from premium georgette fabric adorned with intricate zardozi and thread embroidery. Includes tailored trousers and an ethereal organza dupatta with scalloped borders.', 2500, 1999, 'published', true, true, true, true, 4.8, 124),
    ('44444444-0002-4000-8000-000000000002', 'Floral Maxi Dress', 'floral-maxi-dress', 'CNC-FMD-02', 'Delicate blossom print chiffon maxi dress featuring feminine tiered ruffles and belted waist.', 'An elegant silhouette designed for garden parties and festive occasions. Breathable chiffon with soft inner lining, balloon sleeves, and a flattering cinch waist.', 1600, 1250, 'published', true, true, false, true, 4.7, 98),
    ('44444444-0003-4000-8000-000000000003', 'Men''s Casual Shirt', 'mens-casual-shirt', 'CNC-MCS-03', 'Tailored slim-fit breathable cotton oxford shirt in deep charcoal black.', 'A versatile essential crafted from 100% long-staple combed cotton. Soft wash finish with mother-of-pearl buttons.', 1200, 850, 'published', false, false, true, true, 4.6, 76),
    ('44444444-0004-4000-8000-000000000004', 'Kids Frock', 'kids-frock', 'CNC-KF-04', 'Soft pastel pink tiered party frock with sweet bow accent for young princesses.', 'Hypoallergenic soft cotton inner lining with delicate tulle overlay and satin bow waist.', 1000, 750, 'published', false, true, false, true, 4.9, 65),
    ('44444444-0005-4000-8000-000000000005', 'Luxury Shoulder Bag', 'luxury-shoulder-bag', 'CNC-LSB-05', 'Structured vegan leather shoulder bag with gold-tone hardware and top handles.', 'Sophisticated and spacious, perfect for carrying essentials with refined poise. Dual compartments with zip closure and detachable crossbody strap.', 1900, 1450, 'published', true, false, true, true, 4.7, 88),
    ('44444444-0006-4000-8000-000000000006', 'Pastel Running Shoes', 'pastel-running-shoes', 'CNC-PRS-06', 'Lightweight cushioned athletic sneakers in blush white with ergonomic sole.', 'Engineered mesh upper for maximum breathability with high-resilience memory foam cushioning.', 2800, 2200, 'published', false, true, true, true, 4.6, 72),
    ('44444444-0007-4000-8000-000000000007', 'Cotton Kurti', 'cotton-kurti', 'CNC-CK-07', 'Boutique handloom cotton kurti with minimal pastel threadwork.', 'Pure combed cotton daily wear kurti with notched neckline and three-quarter sleeves.', 2000, 1600, 'published', true, false, false, true, 4.8, 45),
    ('44444444-0008-4000-8000-000000000008', 'Premium Chiffon Hijab', 'premium-chiffon-hijab', 'CNC-PCH-08', 'Non-slip luxury textured chiffon hijab in signature dusty rose.', 'Lightweight, breathable, and drapes flawlessly without requiring constant pinning.', 600, 450, 'published', true, true, true, true, 4.9, 112)
ON CONFLICT (id) DO NOTHING;

-- Map Categories
INSERT INTO public.product_categories (product_id, category_id, is_primary) VALUES
    ('44444444-0001-4000-8000-000000000001', '11111111-0001-4000-8000-000000000001', true),
    ('44444444-0002-4000-8000-000000000002', '11111111-0001-4000-8000-000000000001', true),
    ('44444444-0003-4000-8000-000000000003', '11111111-0002-4000-8000-000000000002', true),
    ('44444444-0004-4000-8000-000000000004', '11111111-0003-4000-8000-000000000003', true),
    ('44444444-0005-4000-8000-000000000005', '11111111-0005-4000-8000-000000000005', true),
    ('44444444-0006-4000-8000-000000000006', '11111111-0006-4000-8000-000000000006', true),
    ('44444444-0007-4000-8000-000000000007', '11111111-0001-4000-8000-000000000001', true),
    ('44444444-0008-4000-8000-000000000008', '11111111-0004-4000-8000-000000000004', true)
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Product Variants with independent SKU, prices, and stock
INSERT INTO public.product_variants (id, product_id, sku, regular_price, sale_price, stock_quantity, low_stock_threshold, is_active, image_url) VALUES
    -- Embroidered Salwar Kameez variants
    ('55555555-0001-4000-8000-000000000001', '44444444-0001-4000-8000-000000000001', 'CNC-ESK-S-PINK', 2500, 1999, 15, 5, true, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
    ('55555555-0002-4000-8000-000000000002', '44444444-0001-4000-8000-000000000001', 'CNC-ESK-M-PINK', 2500, 1999, 25, 5, true, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
    ('55555555-0003-4000-8000-000000000003', '44444444-0001-4000-8000-000000000001', 'CNC-ESK-L-PINK', 2500, 1999, 18, 5, true, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),
    ('55555555-0004-4000-8000-000000000004', '44444444-0001-4000-8000-000000000001', 'CNC-ESK-XL-PINK', 2500, 1999, 8, 5, true, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'),

    -- Floral Maxi Dress variants
    ('55555555-0005-4000-8000-000000000005', '44444444-0002-4000-8000-000000000002', 'CNC-FMD-S-PINK', 1600, 1250, 12, 4, true, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'),
    ('55555555-0006-4000-8000-000000000006', '44444444-0002-4000-8000-000000000002', 'CNC-FMD-M-PINK', 1600, 1250, 20, 5, true, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'),
    ('55555555-0007-4000-8000-000000000007', '44444444-0002-4000-8000-000000000002', 'CNC-FMD-L-WHITE', 1600, 1250, 14, 4, true, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'),

    -- Men's Shirt variants
    ('55555555-0008-4000-8000-000000000008', '44444444-0003-4000-8000-000000000003', 'CNC-MCS-M-BLACK', 1200, 850, 30, 5, true, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'),
    ('55555555-0009-4000-8000-000000000009', '44444444-0003-4000-8000-000000000003', 'CNC-MCS-L-BLACK', 1200, 850, 25, 5, true, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'),

    -- Kids Frock variants
    ('55555555-0010-4000-8000-000000000010', '44444444-0004-4000-8000-000000000004', 'CNC-KF-M-PINK', 1000, 750, 22, 5, true, 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'),

    -- Bag & Footwear variants
    ('55555555-0011-4000-8000-000000000011', '44444444-0005-4000-8000-000000000005', 'CNC-LSB-BEIGE', 1900, 1450, 16, 4, true, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'),
    ('55555555-0012-4000-8000-000000000012', '44444444-0006-4000-8000-000000000006', 'CNC-PRS-WHITE', 2800, 2200, 18, 5, true, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80'),
    ('55555555-0013-4000-8000-000000000013', '44444444-0007-4000-8000-000000000007', 'CNC-CK-M-WHITE', 2000, 1600, 15, 5, true, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'),
    ('55555555-0014-4000-8000-000000000014', '44444444-0008-4000-8000-000000000008', 'CNC-PCH-ROSE', 600, 450, 40, 10, true, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- Product Images
INSERT INTO public.product_images (product_id, variant_id, image_url, alt_text, is_primary, sort_order) VALUES
    ('44444444-0001-4000-8000-000000000001', '55555555-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 'Embroidered Salwar Kameez - Front view', true, 1),
    ('44444444-0002-4000-8000-000000000002', '55555555-0006-4000-8000-000000000006', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80', 'Floral Maxi Dress - Model front', true, 1),
    ('44444444-0003-4000-8000-000000000003', '55555555-0008-4000-8000-000000000008', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', 'Men''s Casual Shirt in Black', true, 1),
    ('44444444-0004-4000-8000-000000000004', '55555555-0010-4000-8000-000000000010', 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80', 'Kids Pink Party Frock', true, 1),
    ('44444444-0005-4000-8000-000000000005', '55555555-0011-4000-8000-000000000011', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 'Luxury Beige Shoulder Bag', true, 1),
    ('44444444-0006-4000-8000-000000000006', '55555555-0012-4000-8000-000000000012', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', 'Pastel White Running Shoes', true, 1),
    ('44444444-0007-4000-8000-000000000007', '55555555-0013-4000-8000-000000000013', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 'Cotton Kurti in Pristine White', true, 1),
    ('44444444-0008-4000-8000-000000000008', '55555555-0014-4000-8000-000000000014', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 'Premium Chiffon Hijab in Rose', true, 1)
ON CONFLICT (id) DO NOTHING;

-- Hero Banners
INSERT INTO public.banners (title, subtitle, desktop_image, cta_text, cta_link, is_active, sort_order) VALUES
    ('New Collection FOR YOUR BEAUTIFUL YOU', 'Trendy • Elegant • Affordable', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80', 'Shop Now', '/products', true, 1),
    ('Festive Elegance 2026', 'Discover handcrafted artisan luxury for all occasions', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80', 'Explore Collection', '/category/womens-fashion', true, 2)
ON CONFLICT (id) DO NOTHING;





-- ============================================================================
-- BOOTSTRAP: SYNC AUTH USERS TO PROFILES & ASSIGN ROLES
-- ============================================================================

-- Step 1: Ensure all existing auth.users have an entry in public.profiles
INSERT INTO public.profiles (id, email, full_name, phone)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
    COALESCE(raw_user_meta_data->>'phone', '')
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;

-- Step 2: Assign Super Admin Role
INSERT INTO public.user_roles (user_id, role_id)
SELECT id, (SELECT id FROM public.roles WHERE name = 'super_admin')
FROM public.profiles
WHERE email = 'tusharkumardas.ai@gmail.com'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Step 3: Assign Admin Role
INSERT INTO public.user_roles (user_id, role_id)
SELECT id, (SELECT id FROM public.roles WHERE name = 'admin')
FROM public.profiles
WHERE email = 'admin@crownandchic.com'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Step 4: Assign Moderator Role
INSERT INTO public.user_roles (user_id, role_id)
SELECT id, (SELECT id FROM public.roles WHERE name = 'moderator')
FROM public.profiles
WHERE email = 'moderator@crownandchic.com'
ON CONFLICT (user_id, role_id) DO NOTHING;
