import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { store } from '@/lib/db/store';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { AppUser, UserRole } from '@/types';

export const dynamic = 'force-dynamic';

function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('cnc_user_id')?.value;
    const userRoleCookie = cookieStore.get('cnc_user_role')?.value as UserRole | undefined;

    if (!userId) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    let user: AppUser | undefined = undefined;

    // 1. Check Super Admin hardcoded IDs
    if (userId === 'user-super-admin' || userId === 'e24c79fc-50db-4bd9-9da3-53712db3b6f9' || userRoleCookie === 'super_admin') {
      user = {
        id: userId,
        email: 'tusharkumardas.ai@gmail.com',
        full_name: 'Tushar Kumar Das',
        phone: '01711-000000',
        role: 'super_admin',
        status: 'active',
        created_at: new Date().toISOString()
      };
    }

    // 2. Check in-memory store
    if (!user) {
      user = store.getUserById(userId);
    }

    // 3. Check Supabase profiles if not found in memory
    if (!user && isUUID(userId)) {
      const adminSupabase = getAdminSupabaseClient();
      if (adminSupabase) {
        try {
          const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', userId).maybeSingle();
          if (profile) {
            const { data: userRoleRow } = await adminSupabase.from('user_roles').select('role_id').eq('user_id', userId).maybeSingle();
            let roleName: UserRole = userRoleCookie || 'customer';

            if (userRoleRow) {
              const { data: roleRow } = await adminSupabase.from('roles').select('name').eq('id', userRoleRow.role_id).maybeSingle();
              if (roleRow?.name) {
                roleName = roleRow.name as UserRole;
              }
            }

            user = {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || profile.email,
              phone: profile.phone || '',
              role: roleName,
              status: 'active',
              created_at: profile.created_at || new Date().toISOString()
            };
          }
        } catch (sbErr) {
          console.warn('Supabase fetch profile in /api/auth/me exception:', sbErr);
        }
      }
    }

    // 4. Fallback from cookie if known staff
    if (!user && userId && userRoleCookie && userRoleCookie !== 'customer') {
      user = {
        id: userId,
        email: 'staff@crownandchic.com',
        full_name: 'Crown & Chic Staff',
        phone: '',
        role: userRoleCookie,
        status: 'active',
        created_at: new Date().toISOString()
      };
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
