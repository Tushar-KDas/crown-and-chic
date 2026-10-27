import { NextResponse } from 'next/server';
import { store } from '@/lib/db/store';

export async function POST(request: Request) {
  try {
    const { announcement_text, bkash_number, nagad_number, rocket_number, inside_dhaka, outside_dhaka, free_shipping_threshold } = await request.json();

    if (announcement_text !== undefined) {
      store.updateSiteSettings({
        announcement_bar: {
          enabled: true,
          text: announcement_text
        }
      });
    }

    if (inside_dhaka !== undefined || outside_dhaka !== undefined || free_shipping_threshold !== undefined) {
      const current = store.getSiteSettings().shipping_rates;
      store.updateSiteSettings({
        shipping_rates: {
          inside_dhaka: Number(inside_dhaka ?? current.inside_dhaka),
          outside_dhaka: Number(outside_dhaka ?? current.outside_dhaka),
          free_shipping_threshold: Number(free_shipping_threshold ?? current.free_shipping_threshold)
        }
      });
    }

    if (bkash_number) store.updatePaymentMethod('bkash', { recipient_number: bkash_number });
    if (nagad_number) store.updatePaymentMethod('nagad', { recipient_number: nagad_number });
    if (rocket_number) store.updatePaymentMethod('rocket', { recipient_number: rocket_number });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
