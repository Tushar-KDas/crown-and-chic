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
CREATE POLICY "Public can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Public can view published products"
    ON public.products FOR SELECT
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Public can view product categories"
    ON public.product_categories FOR SELECT
    USING (true);

CREATE POLICY "Public can view product attributes"
    ON public.product_attributes FOR SELECT
    USING (true);

CREATE POLICY "Public can view attribute values"
    ON public.product_attribute_values FOR SELECT
    USING (true);

CREATE POLICY "Public can view active variants"
    ON public.product_variants FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Public can view variant attributes"
    ON public.product_variant_attributes FOR SELECT
    USING (true);

CREATE POLICY "Public can view product images"
    ON public.product_images FOR SELECT
    USING (true);

CREATE POLICY "Public can view active banners"
    ON public.banners FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Public can view active payment methods"
    ON public.payment_methods FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Public can view public site settings"
    ON public.site_settings FOR SELECT
    USING (is_public = true OR public.is_admin());

CREATE POLICY "Public can view approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved' OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. CUSTOMER DATA ISOLATION POLICIES
-- ----------------------------------------------------------------------------
-- Profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Addresses
CREATE POLICY "Users can manage own addresses"
    ON public.addresses FOR ALL
    USING (auth.uid() = user_id OR public.is_admin());

-- Carts & Cart Items
CREATE POLICY "Users can manage own cart"
    ON public.carts FOR ALL
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can manage own cart items"
    ON public.cart_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE carts.id = cart_items.cart_id
              AND (carts.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Wishlist
CREATE POLICY "Users can manage own wishlist"
    ON public.wishlists FOR ALL
    USING (auth.uid() = user_id OR public.is_admin());

-- Orders
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Payment submissions
CREATE POLICY "Users can insert payment submission for own order"
    ON public.payment_submissions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payment_submissions.order_id
              AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
        )
    );

CREATE POLICY "Users can view payment submission for own order"
    ON public.payment_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = payment_submissions.order_id
              AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Reviews
CREATE POLICY "Authenticated users can submit review"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. ADMIN MANAGEMENT POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Admins full manage categories"
    ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage products"
    ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage product categories"
    ON public.product_categories FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage product attributes"
    ON public.product_attributes FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage attribute values"
    ON public.product_attribute_values FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage variants"
    ON public.product_variants FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage variant attributes"
    ON public.product_variant_attributes FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage product images"
    ON public.product_images FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage orders"
    ON public.orders FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage order items"
    ON public.order_items FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage order status history"
    ON public.order_status_history FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage payment methods"
    ON public.payment_methods FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage payment submissions"
    ON public.payment_submissions FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage inventory movements"
    ON public.inventory_movements FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage banners"
    ON public.banners FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage reviews"
    ON public.reviews FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage site settings"
    ON public.site_settings FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage audit logs"
    ON public.admin_audit_logs FOR ALL USING (public.is_admin());

CREATE POLICY "Admins full manage fraud flags"
    ON public.fraud_review_flags FOR ALL USING (public.is_admin());

CREATE POLICY "Super admins manage roles"
    ON public.roles FOR ALL USING (public.is_super_admin());

CREATE POLICY "Super admins manage user roles"
    ON public.user_roles FOR ALL USING (public.is_super_admin());

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
CREATE POLICY "Public Read Catalog Images"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('catalog-images', 'brand-assets'));

CREATE POLICY "Admin Upload Catalog Images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('catalog-images', 'brand-assets') AND public.is_admin());

-- Payment proofs: strictly private
-- Only submitting user or admins can view/upload
CREATE POLICY "Private Upload Payment Proofs"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'payment-proofs'
        AND (auth.uid() IS NOT NULL OR public.is_admin())
    );

CREATE POLICY "Private Read Payment Proofs"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'payment-proofs'
        AND (
            public.is_admin()
            OR (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
        )
    );
