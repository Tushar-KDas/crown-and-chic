import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { store } from '@/lib/db/store';
import { getAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { variantId, newStock } = await request.json();

    if (!variantId || newStock === undefined || isNaN(Number(newStock))) {
      return NextResponse.json({ error: 'Variant ID and valid new stock quantity required' }, { status: 400 });
    }

    const stockNum = Number(newStock);

    // 1. Update in-memory store
    const ok = store.updateVariantStock(variantId, stockNum);

    // 2. Persist to Supabase
    const sb = getAdminSupabaseClient();
    if (sb) {
      try {
        const { error } = await sb
          .from('product_variants')
          .update({
            stock_quantity: stockNum,
            updated_at: new Date().toISOString()
          })
          .eq('id', variantId);

        if (error) {
          console.error('Supabase updateVariantStock error:', error);
        }
      } catch (sbErr) {
        console.error('Supabase updateVariantStock exception:', sbErr);
      }
    }

    if (!ok && !sb) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    // 3. Revalidate cache
    try {
      revalidatePath('/', 'layout');
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, message: 'Stock updated successfully' });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
