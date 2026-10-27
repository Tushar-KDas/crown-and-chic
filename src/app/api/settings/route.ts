import { NextResponse } from 'next/server';
import { getLiveSiteSettings } from '@/lib/db/live-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getLiveSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
