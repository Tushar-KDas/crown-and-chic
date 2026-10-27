import { NextResponse } from 'next/server';
import { getLiveCategories } from '@/lib/db/live-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getLiveCategories();
    return NextResponse.json({ success: true, categories });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
