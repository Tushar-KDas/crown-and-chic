import { NextResponse } from 'next/server';
import { store } from '@/lib/db/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required.' },
        { status: 400 }
      );
    }

    const regResult = store.registerUser({
      email,
      password,
      full_name,
      phone: phone || ''
    });

    if (!regResult.success || !regResult.user) {
      return NextResponse.json(
        { success: false, error: regResult.error || 'Registration failed.' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: regResult.user
    });

    response.cookies.set('cnc_user_id', regResult.user.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    response.cookies.set('cnc_user_role', regResult.user.role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
