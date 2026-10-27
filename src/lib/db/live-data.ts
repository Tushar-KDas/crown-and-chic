import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { store } from '@/lib/db/store';
import { Product, Category, ProductVariant, ProductImage, SiteSettings, PaymentMethodConfig, Banner, Order } from '@/types';

// Helper to extract attributes from variant SKU
function parseVariantAttributes(sku?: string): { size?: string; color?: string; [key: string]: string | undefined } {
  if (!sku) return { size: 'Free Size', color: 'Default' };
  
  const parts = sku.split('-');
  const sizeMatches = sku.match(/\b(XS|S|M|L|XL|XXL|XXXL|38|40|42|44)\b/i);
  const colorMatches = sku.match(/\b(Pink|Red|Blue|Green|Black|White|Gold|Yellow|Purple|Maroon|Navy|Olive|Teal|Beige|Grey)\b/i);

  return {
    size: sizeMatches ? sizeMatches[0].toUpperCase() : (parts.length > 2 ? parts[2] : 'Standard'),
    color: colorMatches ? colorMatches[0] : (parts.length > 3 ? parts[3] : 'Standard')
  };
}

// Convert Supabase raw product to our unified Product model
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSupabaseProduct(p: any): Product {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images: ProductImage[] = (p.product_images || []).map((img: any) => ({
    id: img.id,
    product_id: img.product_id,
    variant_id: img.variant_id || undefined,
    image_url: img.image_url,
    alt_text: img.alt_text || p.title,
    is_primary: Boolean(img.is_primary)
  })).sort((a: ProductImage, b: ProductImage) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

  // If no images attached, provide a default fallback
  if (images.length === 0) {
    images.push({
      id: `img-${p.id}`,
      product_id: p.id,
      image_url: '/images/products/salwar-kameez.jpg',
      alt_text: p.title,
      is_primary: true
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: ProductVariant[] = (p.product_variants || []).map((v: any) => ({
    id: v.id,
    product_id: v.product_id,
    sku: v.sku || `${p.slug}-var`,
    regular_price: Number(v.regular_price ?? p.base_price ?? 0),
    sale_price: v.sale_price !== null && v.sale_price !== undefined ? Number(v.sale_price) : null,
    stock_quantity: Number(v.stock_quantity ?? 0),
    low_stock_threshold: Number(v.low_stock_threshold ?? 5),
    is_active: Boolean(v.is_active ?? true),
    image_url: v.image_url || images[0]?.image_url,
    attributes: parseVariantAttributes(v.sku)
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories: Category[] = (p.product_categories || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((pc: any) => pc.categories)
    .filter(Boolean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image_url: c.image_url || '/images/categories/womens-fashion.jpg',
      sort_order: Number(c.sort_order ?? 1),
      is_active: Boolean(c.is_active ?? true),
      product_count: 0
    }));

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    sku: p.sku || '',
    short_description: p.short_description || '',
    description: p.description || '',
    base_price: Number(p.base_price ?? 0),
    base_sale_price: p.base_sale_price !== null && p.base_sale_price !== undefined ? Number(p.base_sale_price) : null,
    status: p.status || 'published',
    is_featured: Boolean(p.is_featured),
    is_bestseller: Boolean(p.is_bestseller),
    is_new_arrival: Boolean(p.is_new_arrival),
    is_on_sale: Boolean(p.is_on_sale),
    rating: Number(p.rating ?? 4.8),
    review_count: Number(p.review_count ?? 10),
    images,
    variants,
    categories,
    created_at: p.created_at || new Date().toISOString(),
    updated_at: p.updated_at || new Date().toISOString()
  };
}

// =========================================================================
// LIVE CATEGORIES
// =========================================================================
export async function getLiveCategories(): Promise<Category[]> {
  const sb = getAdminSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          image_url: c.image_url || '/images/categories/womens-fashion.jpg',
          sort_order: Number(c.sort_order ?? 1),
          is_active: true,
          product_count: 0
        }));
      }
    } catch (err) {
      console.warn('getLiveCategories Supabase error:', err);
    }
  }
  return store.getCategories();
}

export async function getLiveAllCategories(): Promise<Category[]> {
  const sb = getAdminSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          image_url: c.image_url || '/images/categories/womens-fashion.jpg',
          sort_order: Number(c.sort_order ?? 1),
          is_active: Boolean(c.is_active ?? true),
          product_count: 0
        }));
      }
    } catch (err) {
      console.warn('getLiveAllCategories Supabase error:', err);
    }
  }
  return store.getAllCategories();
}

export async function getLiveCategoryBySlug(slug: string): Promise<Category | null> {
  const sb = getAdminSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          image_url: data.image_url || '/images/categories/womens-fashion.jpg',
          sort_order: Number(data.sort_order ?? 1),
          is_active: Boolean(data.is_active ?? true),
          product_count: 0
        };
      }
    } catch (err) {
      console.warn('getLiveCategoryBySlug Supabase error:', err);
    }
  }
  return store.getCategoryBySlug(slug) || null;
}

// =========================================================================
// LIVE PRODUCTS
// =========================================================================
export async function getLiveProducts(filter?: {
  categorySlug?: string;
  search?: string;
  status?: string;
  limit?: number;
}): Promise<Product[]> {
  const sb = getAdminSupabaseClient();
  if (sb) {
    try {
      let query = sb
        .from('products')
        .select(`
          *,
          product_images (*),
          product_variants (*),
          product_categories (
            is_primary,
            categories (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status);
      } else if (!filter?.status) {
        query = query.eq('status', 'published');
      }

      if (filter?.search) {
        query = query.ilike('title', `%${filter.search}%`);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        let mapped = data.map(mapSupabaseProduct);

        if (filter?.categorySlug) {
          mapped = mapped.filter(p =>
            p.categories.some(c => c.slug === filter.categorySlug)
          );
        }

        if (filter?.limit) {
          mapped = mapped.slice(0, filter.limit);
        }

        return mapped;
      }
    } catch (err) {
      console.warn('getLiveProducts Supabase error:', err);
    }
  }

  return store.getProducts(filter);
}

export async function getLiveProductBySlug(slug: string): Promise<Product | null> {
  const sb = getAdminSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('products')
        .select(`
          *,
          product_images (*),
          product_variants (*),
          product_categories (
            is_primary,
            categories (*)
          )
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return mapSupabaseProduct(data);
      }
    } catch (err) {
      console.warn('getLiveProductBySlug Supabase error:', err);
    }
  }
  return store.getProductBySlug(slug) || null;
}

// =========================================================================
// LIVE BANNERS
// =========================================================================
export async function getLiveBanners(): Promise<Banner[]> {
  const sb = getAdminSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(b => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || '',
          desktop_image: b.desktop_image,
          mobile_image: b.mobile_image || b.desktop_image,
          cta_text: b.cta_text || 'Shop Now',
          cta_link: b.cta_link || '/products',
          sort_order: Number(b.sort_order ?? 1),
          is_active: Boolean(b.is_active ?? true)
        }));
      }
    } catch (err) {
      console.warn('getLiveBanners Supabase error:', err);
    }
  }
  return store.getBanners();
}

// =========================================================================
// LIVE SITE SETTINGS & PAYMENT METHODS
// =========================================================================
export async function getLiveSiteSettings(): Promise<SiteSettings> {
  const sb = getAdminSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb.from('site_settings').select('*');
      if (!error && data && data.length > 0) {
        const fallback = store.getSiteSettings();
        const settingsMap: Record<string, any> = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });

        return {
          brand_info: settingsMap.brand_info || fallback.brand_info,
          social_links: settingsMap.social_links || fallback.social_links,
          shipping_rates: settingsMap.shipping_rates || fallback.shipping_rates,
          announcement_bar: settingsMap.announcement_bar || fallback.announcement_bar
        };
      }
    } catch (err) {
      console.warn('getLiveSiteSettings Supabase error:', err);
    }
  }
  return store.getSiteSettings();
}

export async function getLivePaymentMethods(): Promise<PaymentMethodConfig[]> {
  const sb = getAdminSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('payment_methods')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(pm => ({
          code: pm.code,
          name: pm.name,
          description: pm.description || '',
          is_active: Boolean(pm.is_active ?? true),
          account_type: pm.account_type || '',
          recipient_number: pm.recipient_number || '',
          instructions: pm.instructions || '',
          sort_order: Number(pm.sort_order ?? 1)
        }));
      }
    } catch (err) {
      console.warn('getLivePaymentMethods Supabase error:', err);
    }
  }
  return store.getAllPaymentMethods();
}

export async function getLiveOrders(): Promise<Order[]> {
  const sb = getAdminSupabaseClient();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sbOrders = data.map((o: any) => ({
          id: o.id,
          order_number: o.order_number,
          user_id: o.user_id,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          customer_email: o.customer_email,
          division: o.division || 'Dhaka',
          district: o.district || 'Dhaka',
          thana: o.thana || 'Gulshan',
          full_address: o.full_address,
          delivery_notes: o.delivery_notes,
          subtotal: Number(o.subtotal ?? 0),
          shipping_charge: Number(o.shipping_charge ?? 0),
          discount_amount: Number(o.discount_amount ?? 0),
          total_amount: Number(o.total_amount ?? 0),
          payment_method: o.payment_method,
          order_status: o.order_status,
          payment_status: o.payment_status,
          is_flagged_for_review: Boolean(o.is_flagged_for_review),
          risk_score: Number(o.risk_score ?? 0),
          risk_reasons: o.risk_reasons || [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: (o.order_items || []).map((it: any) => ({
            id: it.id,
            order_id: it.order_id,
            product_id: it.product_id,
            variant_id: it.variant_id,
            product_title: it.product_title,
            variant_title: it.variant_title || '',
            sku: it.sku || '',
            unit_price: Number(it.unit_price ?? 0),
            quantity: Number(it.quantity ?? 1),
            total_price: Number(it.total_price ?? 0),
            image_url: it.image_url
          })),
          created_at: o.created_at || new Date().toISOString(),
          updated_at: o.updated_at || new Date().toISOString()
        }));

        const map = new Map<string, Order>();
        store.getOrders().forEach(o => map.set(o.order_number.toLowerCase(), o));
        sbOrders.forEach(o => map.set(o.order_number.toLowerCase(), o));
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    } catch (err) {
      console.warn('getLiveOrders Supabase error:', err);
    }
  }
  return store.getOrders();
}
