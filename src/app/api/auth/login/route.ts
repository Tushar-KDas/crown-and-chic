import { NextResponse } from 'next/server';
import { store } from '@/lib/db/store';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AppUser, UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    let authUser: AppUser | null = null;

    // 1. Try store authentication
    const authResult = store.authenticateUser(email, password);
    if (authResult.success && authResult.user) {
      authUser = authResult.user;
    }

    // 2. Check with Supabase Auth
    if (!authUser && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const client = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        const { data: sbAuth, error: sbErr } = await client.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (sbAuth?.user) {
          const adminSupabase = getAdminSupabaseClient();
          let roleName: UserRole = 'customer';
          let profileName = sbAuth.user.user_metadata?.full_name || email;
          let profilePhone = sbAuth.user.user_metadata?.phone || '';

          if (adminSupabase) {
            const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', sbAuth.user.id).single();
            const { data: userRoleRow } = await adminSupabase.from('user_roles').select('role_id').eq('user_id', sbAuth.user.id).single();
            if (userRoleRow) {
              const { data: roleRow } = await adminSupabase.from('roles').select('name').eq('id', userRoleRow.role_id).single();
              if (roleRow?.name) roleName = roleRow.name as UserRole;
            }
            if (profile) {
              profileName = profile.full_name || profileName;
              profilePhone = profile.phone || profilePhone;
            }
          }

          authUser = {
            id: sbAuth.user.id,
            email: sbAuth.user.email || email,
            full_name: profileName,
            phone: profilePhone,
            role: roleName,
            status: 'active',
            created_at: sbAuth.user.created_at || new Date().toISOString()
          };

          // Cache in memory store
          store.registerUser({
            email: authUser.email,
            password,
            full_name: authUser.full_name,
            phone: authUser.phone
          });
          store.updateUserRole('tusharkumardas.ai@gmail.com', authUser.id, authUser.role);
        }
      } catch (err) {
        console.warn('Supabase login check warning:', err);
      }
    }

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (authUser.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Your account has been suspended. Please contact customer support.' },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: authUser
    });

    // Set lightweight session cookie for SSR/client sync
    response.cookies.set('cnc_user_id', authUser.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    response.cookies.set('cnc_user_role', authUser.role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
