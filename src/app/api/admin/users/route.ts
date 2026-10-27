import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { store } from '@/lib/db/store';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { AppUser, UserRole } from '@/types';

// Helper to get authenticated requester
async function getRequester(): Promise<{ id: string; email: string; role: UserRole } | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('cnc_user_id')?.value;
  const userRole = cookieStore.get('cnc_user_role')?.value as UserRole | undefined;

  if (!userId) return null;

  // Check store first
  const localUser = store.getUserById(userId);
  if (localUser) {
    return { id: localUser.id, email: localUser.email, role: localUser.role };
  }

  // If role cookie is super_admin or user is known super admin
  if (userRole === 'super_admin' || userId === 'user-super-admin' || userId === 'e24c79fc-50db-4bd9-9da3-53712db3b6f9') {
    return { id: userId, email: 'tusharkumardas.ai@gmail.com', role: 'super_admin' };
  }

  // Check Supabase profiles
  const adminSupabase = getAdminSupabaseClient();
  if (adminSupabase) {
    try {
      const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', userId).single();
      const { data: userRoleRow } = await adminSupabase.from('user_roles').select('role_id').eq('user_id', userId).single();
      if (profile && userRoleRow) {
        const { data: roleRow } = await adminSupabase.from('roles').select('name').eq('id', userRoleRow.role_id).single();
        return {
          id: profile.id,
          email: profile.email,
          role: (roleRow?.name || 'customer') as UserRole
        };
      }
    } catch {
      // Fallback
    }
  }

  if (userRole) {
    return { id: userId, email: '', role: userRole };
  }

  return null;
}

export async function GET() {
  try {
    const requester = await getRequester();
    if (!requester || requester.role === 'customer') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Staff access required.' },
        { status: 403 }
      );
    }

    let userList: AppUser[] = store.getUsers();

    // Fetch from Supabase if connected
    const adminSupabase = getAdminSupabaseClient();
    if (adminSupabase) {
      try {
        const { data: profiles } = await adminSupabase.from('profiles').select('*');
        const { data: userRoles } = await adminSupabase.from('user_roles').select('*');
        const { data: roles } = await adminSupabase.from('roles').select('*');

        if (profiles && profiles.length > 0) {
          const sbUsers: AppUser[] = profiles.map(p => {
            const ur = userRoles?.find(r => r.user_id === p.id);
            const rObj = roles?.find(r => r.id === ur?.role_id);
            const role = (rObj?.name || 'customer') as UserRole;
            return {
              id: p.id,
              email: p.email,
              full_name: p.full_name || p.email,
              phone: p.phone || '',
              role,
              status: 'active',
              created_at: p.created_at || new Date().toISOString()
            };
          });

          // Merge Supabase users with local users
          const map = new Map<string, AppUser>();
          userList.forEach(u => map.set(u.email.toLowerCase(), u));
          sbUsers.forEach(u => map.set(u.email.toLowerCase(), u));
          userList = Array.from(map.values());
        }
      } catch (err) {
        console.warn('Supabase fetch users warning:', err);
      }
    }

    return NextResponse.json({ success: true, users: userList });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users.' },
      { status: 500 }
    );
  }
}

// POST: Add new staff member (admin or moderator) - STRICTLY SUPER_ADMIN ONLY
export async function POST(request: Request) {
  try {
    const requester = await getRequester();
    if (!requester || requester.role !== 'super_admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden: Only Super Admin can appoint or create Admin and Moderator accounts.' 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, full_name, phone, role } = body;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, password, and role are required.' },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'moderator') {
      return NextResponse.json(
        { success: false, error: 'Role must be either "admin" or "moderator".' },
        { status: 400 }
      );
    }

    const adminSupabase = getAdminSupabaseClient();
    let supabaseUserId: string | null = null;

    // 1. Persist directly to Supabase
    if (adminSupabase) {
      try {
        const { data: usersData } = await adminSupabase.auth.admin.listUsers();
        const existing = usersData?.users?.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());

        if (existing) {
          supabaseUserId = existing.id;
          await adminSupabase.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
            user_metadata: { full_name, phone }
          });
        } else {
          const { data: newUser, error: createErr } = await adminSupabase.auth.admin.createUser({
            email: email.trim().toLowerCase(),
            password,
            email_confirm: true,
            user_metadata: { full_name, phone }
          });
          if (createErr) {
            console.error('Supabase createUser error:', createErr);
          } else if (newUser?.user) {
            supabaseUserId = newUser.user.id;
          }
        }

        if (supabaseUserId) {
          // Upsert profiles
          await adminSupabase.from('profiles').upsert({
            id: supabaseUserId,
            email: email.trim().toLowerCase(),
            full_name,
            phone: phone || ''
          }, { onConflict: 'id' });

          // Get role_id from roles table
          const { data: roles } = await adminSupabase.from('roles').select('*');
          const targetRole = roles?.find(r => r.name === role);
          if (targetRole) {
            await adminSupabase.from('user_roles').upsert({
              user_id: supabaseUserId,
              role_id: targetRole.id
            }, { onConflict: 'user_id' });
          }
        }
      } catch (sbErr) {
        console.error('Supabase staff persistence error:', sbErr);
      }
    }

    // 2. Also register in local store
    const result = store.addStaffUser(requester.email || 'tusharkumardas.ai@gmail.com', {
      email: email.trim().toLowerCase(),
      password,
      full_name,
      phone: phone || '',
      role: role as 'admin' | 'moderator'
    });

    const createdUser: AppUser = result.user || {
      id: supabaseUserId || `user-${Date.now()}`,
      email: email.trim().toLowerCase(),
      full_name,
      phone: phone || '',
      role,
      status: 'active',
      created_at: new Date().toISOString()
    };

    return NextResponse.json({ success: true, user: createdUser });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create staff member.' },
      { status: 500 }
    );
  }
}

// PATCH: Update role or status - STRICTLY SUPER_ADMIN ONLY
export async function PATCH(request: Request) {
  try {
    const requester = await getRequester();
    if (!requester || requester.role !== 'super_admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden: Only Super Admin can modify user roles or account status.' 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required.' },
        { status: 400 }
      );
    }

    // Update in Supabase
    const adminSupabase = getAdminSupabaseClient();
    if (adminSupabase && role) {
      try {
        const { data: roles } = await adminSupabase.from('roles').select('*');
        const targetRole = roles?.find(r => r.name === role);
        if (targetRole) {
          await adminSupabase.from('user_roles').upsert({
            user_id: userId,
            role_id: targetRole.id
          }, { onConflict: 'user_id' });
        }
      } catch (sbErr) {
        console.error('Supabase role update error:', sbErr);
      }
    }

    if (role) {
      store.updateUserRole(requester.email || 'tusharkumardas.ai@gmail.com', userId, role as UserRole);
    }

    if (status) {
      store.updateUserStatus(requester.email || 'tusharkumardas.ai@gmail.com', userId, status as 'active' | 'suspended');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user.' },
      { status: 500 }
    );
  }
}
