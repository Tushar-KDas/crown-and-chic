import { NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { PaymentMethodCode } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      customer_name, 
      customer_phone, 
      customer_email, 
      division, 
      district, 
      thana, 
      full_address, 
      delivery_notes, 
      payment_method, 
      items,
      transaction_id,
      sender_phone
    } = body;

    if (!customer_name || !customer_phone || !division || !district || !thana || !full_address || !payment_method || !items || items.length === 0) {
      return NextResponse.json({ error: 'Please provide all required delivery and contact details.' }, { status: 400 });
    }

    // Call atomic order creation with inventory deduction and fraud check
    const orderResult = store.createOrder({
      customer_name,
      customer_phone,
      customer_email,
      division,
      district,
      thana,
      full_address,
      delivery_notes,
      payment_method: payment_method as PaymentMethodCode,
      items
    });

    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json({ error: orderResult.error || 'Failed to process order' }, { status: 400 });
    }

    const createdOrder = orderResult.order;

    // If manual MFS payment submitted with TrxID
    if (payment_method !== 'cod' && transaction_id) {
      store.submitPaymentProof({
        order_id: createdOrder.id,
        payment_method: payment_method as PaymentMethodCode,
        transaction_id,
        sender_phone: sender_phone || customer_phone,
        amount: createdOrder.total_amount
      });
    }

    return NextResponse.json({ 
      success: true, 
      order: createdOrder,
      orderNumber: createdOrder.order_number 
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error occurred during checkout.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get('orderNumber');

  if (orderNumber) {
    const order = store.getOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  }

  // Admin orders list
  const orders = store.getOrders();
  return NextResponse.json({ success: true, orders });
}
