import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { store } from '@/lib/db/store';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { OrderStatus } from '@/types';

function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, orderId, newStatus, verificationStatus, notes } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const sb = getAdminSupabaseClient();

    if (action === 'update_order_status') {
      const ok = store.updateOrderStatus(orderId, newStatus as OrderStatus);

      if (sb) {
        try {
          const filterCol = isUUID(orderId) ? 'id' : 'order_number';
          await sb.from('orders').update({
            order_status: newStatus,
            updated_at: new Date().toISOString()
          }).eq(filterCol, orderId);
        } catch (sbErr) {
          console.warn('Supabase update order status warning:', sbErr);
        }
      }

      try {
        revalidatePath('/admin');
        revalidatePath('/', 'layout');
      } catch {}

      if (!ok && !sb) {
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: `Order status changed to ${newStatus}` });
    }

    if (action === 'verify_payment') {
      const ok = store.verifyPayment(orderId, verificationStatus, notes);

      if (sb) {
        try {
          const filterCol = isUUID(orderId) ? 'id' : 'order_number';
          await sb.from('orders').update({
            payment_status: verificationStatus === 'verified' ? 'paid' : 'failed',
            order_status: verificationStatus === 'verified' ? 'confirmed' : 'pending_confirmation',
            updated_at: new Date().toISOString()
          }).eq(filterCol, orderId);
        } catch (sbErr) {
          console.warn('Supabase verify payment warning:', sbErr);
        }
      }

      try {
        revalidatePath('/admin');
        revalidatePath('/', 'layout');
      } catch {}

      if (!ok && !sb) {
        return NextResponse.json({ error: 'Failed to verify payment submission' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: `Payment marked as ${verificationStatus}` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
