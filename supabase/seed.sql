-- ============================================================================
-- CROWN & CHIC E-COMMERCE PLATFORM — SEED DATA
-- seed.sql
-- ============================================================================

-- Roles
INSERT INTO public.roles (name, description) VALUES
    ('super_admin', 'Supreme administrator with full system privileges'),
    ('admin', 'General administrator for operations'),
    ('order_manager', 'Manager dedicated to processing and confirming orders'),
    ('product_manager', 'Specialist in product catalog, pricing, and stock'),
    ('support_staff', 'Customer service representative with read/notes access'),
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
