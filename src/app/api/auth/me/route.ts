import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { store } from '@/lib/db/store';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('cnc_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = store.getUserById(userId);
    if (!user || user.status === 'suspended') {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json({ authenticated: true, user: safeUser });
  } catch (error) {
    console.error('Session me error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
