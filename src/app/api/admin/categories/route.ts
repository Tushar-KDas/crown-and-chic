import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { store } from '@/lib/db/store';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { getLiveAllCategories } from '@/lib/db/live-data';
import { Category } from '@/types';

export async function GET() {
  try {
    const categories = await getLiveAllCategories();
    return NextResponse.json({ categories });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const categoryData: Category = {
      id: body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`),
      name: body.name,
      slug,
      description: body.description || '',
      image_url: body.image_url || '/images/categories/womens-fashion.jpg',
      sort_order: Number(body.sort_order) || 1,
      is_active: body.is_active ?? true,
      product_count: body.product_count || 0
    };

    // 1. Update in-memory store
    const saved = store.saveCategory(categoryData);

    // 2. Persist to Supabase
    const sb = getAdminSupabaseClient();
    if (sb) {
      try {
        const payload = {
          name: saved.name,
          slug: saved.slug,
          description: saved.description,
          image_url: saved.image_url,
          sort_order: saved.sort_order,
          is_active: saved.is_active,
          updated_at: new Date().toISOString()
        };

        if (body.id) {
          // Update existing
          const { error: updErr } = await sb.from('categories').update(payload).eq('id', body.id);
          if (updErr) {
            console.error('Supabase update category error:', updErr);
          }
        } else {
          // Insert new
          const { data: insData, error: insErr } = await sb.from('categories').insert({
            id: saved.id,
            ...payload,
            created_at: new Date().toISOString()
          }).select().single();

          if (insErr) {
            console.error('Supabase insert category error:', insErr);
          } else if (insData) {
            saved.id = insData.id;
          }
        }
      } catch (sbErr) {
        console.error('Supabase category persistence exception:', sbErr);
      }
    }

    // 3. Revalidate Next.js storefront cache
    try {
      revalidatePath('/', 'layout');
    } catch {
      // Revalidation in dev or static context
    }

    return NextResponse.json({ success: true, category: saved });
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
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    // 1. Delete from in-memory store
    store.deleteCategory(id);

    // 2. Delete from Supabase
    const sb = getAdminSupabaseClient();
    if (sb) {
      try {
        // Also remove relationships from product_categories
        await sb.from('product_categories').delete().eq('category_id', id);
        const { error: delErr } = await sb.from('categories').delete().eq('id', id);
        if (delErr) {
          console.error('Supabase delete category error:', delErr);
        }
      } catch (sbErr) {
        console.error('Supabase category delete exception:', sbErr);
      }
    }

    // 3. Revalidate storefront
    try {
      revalidatePath('/', 'layout');
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
