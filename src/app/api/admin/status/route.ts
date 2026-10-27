import { NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { OrderStatus } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, orderId, newStatus, verificationStatus, notes } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (action === 'update_order_status') {
      const ok = store.updateOrderStatus(orderId, newStatus as OrderStatus);
      if (!ok) {
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: `Order status changed to ${newStatus}` });
    }

    if (action === 'verify_payment') {
      const ok = store.verifyPayment(orderId, verificationStatus, notes);
      if (!ok) {
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
