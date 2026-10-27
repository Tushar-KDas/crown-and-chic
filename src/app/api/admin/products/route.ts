import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { store } from '@/lib/db/store';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { getLiveProducts } from '@/lib/db/live-data';
import { Product, ProductVariant, ProductImage } from '@/types';

function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function ensureUUID(id?: string): string {
  if (id && isUUID(id)) return id;
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-000000000000';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('categorySlug') || undefined;
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;

    const products = await getLiveProducts({ categorySlug, search, status });
    return NextResponse.json({ products });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support quick status toggle or partial field update
    if (body.id && body.status && !body.title) {
      store.saveProduct({ id: body.id, status: body.status });
      const sb = getAdminSupabaseClient();
      if (sb && isUUID(body.id)) {
        await sb.from('products').update({
          status: body.status,
          updated_at: new Date().toISOString()
        }).eq('id', body.id);
      }
      try {
        revalidatePath('/', 'layout');
      } catch {
        // Ignore
      }
      return NextResponse.json({ success: true, message: 'Status updated' });
    }

    if (!body.title) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    const prodId = ensureUUID(body.id);
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Normalize images with valid UUIDs
    const images: ProductImage[] = (body.images || []).map((img: ProductImage | string, idx: number) => {
      const url = typeof img === 'string' ? img : img.image_url;
      const alt = typeof img === 'string' ? body.title : (img.alt_text || body.title);
      const isPrimary = typeof img === 'string' ? idx === 0 : Boolean(img.is_primary ?? idx === 0);
      const imgId = typeof img === 'object' && img.id && isUUID(img.id) ? img.id : crypto.randomUUID();

      return {
        id: imgId,
        product_id: prodId,
        image_url: url || '/images/products/salwar-kameez.jpg',
        alt_text: alt,
        is_primary: isPrimary
      };
    });

    if (images.length === 0) {
      images.push({
        id: crypto.randomUUID(),
        product_id: prodId,
        image_url: '/images/products/salwar-kameez.jpg',
        alt_text: body.title,
        is_primary: true
      });
    }

    // Normalize variants with valid UUIDs
    const variants: ProductVariant[] = (body.variants || []).map((v: Partial<ProductVariant>, idx: number) => {
      const varId = ensureUUID(v.id);
      return {
        id: varId,
        product_id: prodId,
        sku: v.sku || `${slug}-v${idx + 1}`,
        regular_price: Number(v.regular_price ?? body.base_price ?? 0),
        sale_price: v.sale_price !== null && v.sale_price !== undefined ? Number(v.sale_price) : null,
        stock_quantity: Number(v.stock_quantity ?? 10),
        low_stock_threshold: Number(v.low_stock_threshold ?? 5),
        is_active: Boolean(v.is_active ?? true),
        image_url: v.image_url || images[0].image_url,
        attributes: v.attributes || { size: 'Standard', color: 'Standard' }
      };
    });

    const productToSave: Product = {
      id: prodId,
      title: body.title,
      slug,
      sku: body.sku || `CNC-${Date.now().toString().slice(-4)}`,
      short_description: body.short_description || '',
      description: body.description || '',
      base_price: Number(body.base_price ?? 0),
      base_sale_price: body.base_sale_price !== null && body.base_sale_price !== undefined ? Number(body.base_sale_price) : null,
      status: body.status || 'published',
      is_featured: Boolean(body.is_featured),
      is_bestseller: Boolean(body.is_bestseller),
      is_new_arrival: Boolean(body.is_new_arrival),
      is_on_sale: Boolean(body.is_on_sale ?? (body.base_sale_price && Number(body.base_sale_price) < Number(body.base_price))),
      rating: Number(body.rating ?? 4.8),
      review_count: Number(body.review_count ?? 12),
      images,
      variants,
      categories: body.categories || [],
      created_at: body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Update in-memory store
    const saved = store.saveProduct(productToSave);

    // 2. Persist to Supabase
    const sb = getAdminSupabaseClient();
    if (sb) {
      try {
        const productPayload = {
          title: saved.title,
          slug: saved.slug,
          sku: saved.sku,
          short_description: saved.short_description,
          description: saved.description,
          base_price: saved.base_price,
          base_sale_price: saved.base_sale_price,
          status: saved.status,
          is_featured: saved.is_featured,
          is_bestseller: saved.is_bestseller,
          is_new_arrival: saved.is_new_arrival,
          is_on_sale: saved.is_on_sale,
          rating: saved.rating,
          review_count: saved.review_count,
          updated_at: new Date().toISOString()
        };

        // Upsert product
        const { error: prodErr } = await sb.from('products').upsert({
          id: prodId,
          ...productPayload,
          created_at: saved.created_at
        }, { onConflict: 'id' });

        if (prodErr) {
          console.error('Supabase upsert product error:', prodErr);
        } else {
          // Upsert variants
          if (variants.length > 0) {
            for (const v of variants) {
              await sb.from('product_variants').upsert({
                id: v.id,
                product_id: prodId,
                sku: v.sku,
                regular_price: v.regular_price,
                sale_price: v.sale_price,
                stock_quantity: v.stock_quantity,
                low_stock_threshold: v.low_stock_threshold,
                is_active: v.is_active,
                image_url: v.image_url,
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });
            }
          }

          // Upsert images
          if (images.length > 0) {
            for (let i = 0; i < images.length; i++) {
              const img = images[i];
              await sb.from('product_images').upsert({
                id: img.id,
                product_id: prodId,
                image_url: img.image_url,
                alt_text: img.alt_text,
                sort_order: i + 1,
                is_primary: img.is_primary
              }, { onConflict: 'id' });
            }
          }

          // Link categories
          if (saved.categories && saved.categories.length > 0) {
            for (const cat of saved.categories) {
              // Find matching category ID in Supabase
              const { data: dbCat } = await sb
                .from('categories')
                .select('id')
                .or(`id.eq.${isUUID(cat.id) ? cat.id : '00000000-0000-0000-0000-000000000000'},slug.eq.${cat.slug}`)
                .maybeSingle();

              if (dbCat) {
                await sb.from('product_categories').upsert({
                  product_id: prodId,
                  category_id: dbCat.id,
                  is_primary: true
                }, { onConflict: 'product_id,category_id' });
              }
            }
          }
        }
      } catch (sbErr) {
        console.error('Supabase product persistence exception:', sbErr);
      }
    }

    // 3. Revalidate Next.js cache
    try {
      revalidatePath('/', 'layout');
    } catch {
      // Revalidation in dev
    }

    return NextResponse.json({ success: true, product: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // 1. Delete from in-memory store
    store.deleteProduct(id);

    // 2. Delete from Supabase
    const sb = getAdminSupabaseClient();
    if (sb && isUUID(id)) {
      try {
        await sb.from('product_categories').delete().eq('product_id', id);
        await sb.from('product_images').delete().eq('product_id', id);
        await sb.from('product_variants').delete().eq('product_id', id);
        const { error: delErr } = await sb.from('products').delete().eq('id', id);
        if (delErr) {
          console.error('Supabase delete product error:', delErr);
        }
      } catch (sbErr) {
        console.error('Supabase delete product exception:', sbErr);
      }
    }

    // 3. Revalidate Next.js cache
    try {
      revalidatePath('/', 'layout');
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
