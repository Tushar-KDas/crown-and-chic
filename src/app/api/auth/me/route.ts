import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { store } from '@/lib/db/store';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { AppUser, UserRole } from '@/types';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('cnc_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    let user: AppUser | undefined = store.getUserById(userId);

    if (!user) {
      const adminSupabase = getAdminSupabaseClient();
      if (adminSupabase) {
        try {
          const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', userId).single();
          if (profile) {
            const { data: userRoleRow } = await adminSupabase.from('user_roles').select('role_id').eq('user_id', userId).single();
            const { data: roleRow } = userRoleRow ? await adminSupabase.from('roles').select('name').eq('id', userRoleRow.role_id).single() : { data: null };

            user = {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || profile.email,
              phone: profile.phone || '',
              role: (roleRow?.name || 'customer') as UserRole,
              status: 'active',
              created_at: profile.created_at || new Date().toISOString()
            };
          }
        } catch {
          // fallback
        }
      }
    }

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
