import { NextResponse } from 'next/server';
import { store } from '@/lib/db/store';

export async function POST(request: Request) {
  try {
    const { variantId, newStock } = await request.json();

    if (!variantId || newStock === undefined || isNaN(Number(newStock))) {
      return NextResponse.json({ error: 'Variant ID and valid new stock quantity required' }, { status: 400 });
    }

    const ok = store.updateVariantStock(variantId, Number(newStock));
    if (!ok) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Stock updated successfully' });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
