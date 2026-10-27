import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { store } from '@/lib/db/store';
import { UserRole } from '@/types';

// Helper to get authenticated requester
async function getRequester() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('cnc_user_id')?.value;
  if (!userId) return null;
  return store.getUserById(userId);
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

    const userList = store.getUsers();
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

    const result = store.addStaffUser(requester.email, {
      email,
      password,
      full_name,
      phone: phone || '',
      role: role as 'admin' | 'moderator'
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, user: result.user });
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

    if (role) {
      const roleResult = store.updateUserRole(requester.email, userId, role as UserRole);
      if (!roleResult.success) {
        return NextResponse.json({ success: false, error: roleResult.error }, { status: 400 });
      }
    }

    if (status) {
      const statusResult = store.updateUserStatus(requester.email, userId, status as 'active' | 'suspended');
      if (!statusResult.success) {
        return NextResponse.json({ success: false, error: statusResult.error }, { status: 400 });
      }
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
