import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { store } from '@/lib/db/store';
import { getAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { announcement_text, bkash_number, nagad_number, rocket_number, inside_dhaka, outside_dhaka, free_shipping_threshold } = await request.json();

    // 1. Update in-memory store
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

    // 2. Persist to Supabase
    const sb = getAdminSupabaseClient();
    if (sb) {
      try {
        if (announcement_text !== undefined) {
          await sb.from('site_settings').upsert({
            key: 'announcement_bar',
            value: {
              text: announcement_text,
              enabled: true
            },
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        }

        if (inside_dhaka !== undefined || outside_dhaka !== undefined || free_shipping_threshold !== undefined) {
          const currentRates = store.getSiteSettings().shipping_rates;
          await sb.from('site_settings').upsert({
            key: 'shipping_rates',
            value: {
              inside_dhaka: Number(inside_dhaka ?? currentRates.inside_dhaka),
              outside_dhaka: Number(outside_dhaka ?? currentRates.outside_dhaka),
              free_shipping_threshold: Number(free_shipping_threshold ?? currentRates.free_shipping_threshold)
            },
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        }

        if (bkash_number) {
          await sb.from('payment_methods').update({ recipient_number: bkash_number }).eq('code', 'bkash');
        }
        if (nagad_number) {
          await sb.from('payment_methods').update({ recipient_number: nagad_number }).eq('code', 'nagad');
        }
        if (rocket_number) {
          await sb.from('payment_methods').update({ recipient_number: rocket_number }).eq('code', 'rocket');
        }
      } catch (sbErr) {
        console.error('Supabase settings persistence exception:', sbErr);
      }
    }

    // 3. Revalidate cache
    try {
      revalidatePath('/', 'layout');
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
