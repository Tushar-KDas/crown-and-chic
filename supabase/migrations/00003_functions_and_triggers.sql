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
