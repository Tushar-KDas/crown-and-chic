import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { store } from '@/lib/db/store';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { getLiveOrders } from '@/lib/db/live-data';
import { Order, OrderItem, PaymentMethodCode } from '@/types';

export const dynamic = 'force-dynamic';

function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function isValidBDPhoneNumber(phone: string): boolean {
  const clean = phone.replace(/[\s-]/g, '');
  return /^(?:\+?880|0)1[3-9]\d{8}$/.test(clean);
}

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CNC-${dateStr}-${rand}`;
}

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

    if (!isValidBDPhoneNumber(customer_phone)) {
      return NextResponse.json({ error: 'Please enter a valid Bangladesh mobile number (e.g. 017XXXXXXXX).' }, { status: 400 });
    }

    const orderId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ord-${Date.now()}`;
    const orderNumber = generateOrderNumber();

    // 1. Resolve Items
    let subtotal = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolvedItems: OrderItem[] = items.map((it: any, idx: number) => {
      const unitPrice = Number(it.unit_price || 0);
      const qty = Math.max(1, Number(it.quantity || 1));
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      const itemId = isUUID(it.id) ? it.id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `oi-${Date.now()}-${idx}`);

      return {
        id: itemId,
        order_id: orderId,
        product_id: it.product_id || '',
        variant_id: it.variant_id || '',
        product_title: it.product_title || 'Fashion Item',
        variant_title: it.variant_title || 'Standard',
        sku: it.sku || `SKU-${idx + 1}`,
        unit_price: unitPrice,
        quantity: qty,
        total_price: lineTotal,
        image_url: it.image_url || '/images/products/salwar-kameez.jpg'
      };
    });

    // 2. Shipping calculation
    const isDhaka = division.toLowerCase().includes('dhaka');
    const shippingCharge = subtotal >= 2500 ? 0 : (isDhaka ? 60 : 120);
    const totalAmount = subtotal + shippingCharge;

    // 3. Fraud heuristic check
    let riskScore = 0;
    const riskReasons: string[] = [];
    if (payment_method === 'cod' && totalAmount > 8000) {
      riskScore += 25;
      riskReasons.push('High value Cash On Delivery order (> ৳8,000) requires confirmation.');
    }
    const isFlagged = riskScore >= 25;

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: null,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: customer_email ? customer_email.trim() : null,
      division,
      district,
      thana,
      full_address: full_address.trim(),
      delivery_notes: delivery_notes ? delivery_notes.trim() : null,
      subtotal,
      shipping_charge: shippingCharge,
      discount_amount: 0,
      total_amount: totalAmount,
      payment_method: payment_method as PaymentMethodCode,
      order_status: 'pending_confirmation',
      payment_status: payment_method === 'cod' ? 'unpaid' : (transaction_id ? 'pending_verification' : 'unpaid'),
      is_flagged_for_review: isFlagged,
      risk_score: riskScore,
      risk_reasons: riskReasons,
      items: resolvedItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (transaction_id) {
      newOrder.payment_submission = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ps-${Date.now()}`,
        order_id: orderId,
        payment_method: payment_method as PaymentMethodCode,
        transaction_id: transaction_id.trim(),
        sender_phone: (sender_phone || customer_phone).trim(),
        amount: totalAmount,
        status: 'pending',
        created_at: new Date().toISOString()
      };
    }

    // 4. Save to in-memory store
    store.addCreatedOrder(newOrder);

    // 5. Persist to Supabase
    const sb = getAdminSupabaseClient();
    if (sb) {
      try {
        const orderPayload = {
          id: orderId,
          order_number: newOrder.order_number,
          user_id: null,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email,
          division: newOrder.division,
          district: newOrder.district,
          thana: newOrder.thana,
          full_address: newOrder.full_address,
          delivery_notes: newOrder.delivery_notes,
          subtotal: newOrder.subtotal,
          shipping_charge: newOrder.shipping_charge,
          discount_amount: newOrder.discount_amount,
          total_amount: newOrder.total_amount,
          payment_method: newOrder.payment_method,
          order_status: newOrder.order_status,
          payment_status: newOrder.payment_status,
          is_flagged_for_review: newOrder.is_flagged_for_review,
          risk_score: newOrder.risk_score,
          risk_reasons: newOrder.risk_reasons,
          created_at: newOrder.created_at,
          updated_at: newOrder.updated_at
        };

        const { error: ordErr } = await sb.from('orders').insert(orderPayload);
        if (ordErr) {
          console.error('Supabase order insert error:', ordErr);
        } else {
          // Insert order items
          const itemsPayload = resolvedItems.map(it => ({
            id: isUUID(it.id) ? it.id : crypto.randomUUID(),
            order_id: orderId,
            product_id: isUUID(it.product_id) ? it.product_id : null,
            variant_id: isUUID(it.variant_id) ? it.variant_id : null,
            product_title: it.product_title,
            variant_title: it.variant_title,
            sku: it.sku,
            unit_price: it.unit_price,
            quantity: it.quantity,
            total_price: it.total_price,
            image_url: it.image_url,
            created_at: new Date().toISOString()
          }));

          const { error: itemsErr } = await sb.from('order_items').insert(itemsPayload);
          if (itemsErr) {
            console.error('Supabase order items insert error:', itemsErr);
          }

          // Deduct variant stock in Supabase
          for (const it of resolvedItems) {
            if (isUUID(it.variant_id)) {
              try {
                const { data: vData } = await sb
                  .from('product_variants')
                  .select('stock_quantity')
                  .eq('id', it.variant_id)
                  .maybeSingle();

                if (vData) {
                  const newQty = Math.max(0, (vData.stock_quantity ?? 0) - it.quantity);
                  await sb.from('product_variants').update({ stock_quantity: newQty }).eq('id', it.variant_id);
                }
              } catch (stkErr) {
                console.warn('Stock decrement warning:', stkErr);
              }
            }
          }
        }
      } catch (sbErr) {
        console.error('Supabase order exception:', sbErr);
      }
    }

    // 6. Revalidate caches
    try {
      revalidatePath('/admin', 'page');
      revalidatePath('/admin');
      revalidatePath('/', 'layout');
    } catch {
      // Ignore
    }

    return NextResponse.json({ 
      success: true, 
      order: newOrder,
      orderNumber: newOrder.order_number 
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error occurred during checkout.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    const liveOrders = await getLiveOrders();

    if (orderNumber) {
      const order = liveOrders.find(o => o.order_number.toLowerCase() === orderNumber.trim().toLowerCase());
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, order });
    }

    return NextResponse.json({ success: true, orders: liveOrders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
