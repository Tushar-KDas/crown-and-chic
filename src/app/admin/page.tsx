import { store } from '@/lib/db/store';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { getAdminSupabaseClient } from '@/lib/supabase/server';
import { AppUser, UserRole } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const initialOrders = store.getOrders();
  const products = store.getProducts();
  const categories = store.getAllCategories();
  const paymentMethods = store.getAllPaymentMethods();
  const siteSettings = store.getSiteSettings();
  let initialUsers = store.getUsers();

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

        const map = new Map<string, AppUser>();
        initialUsers.forEach(u => map.set(u.email.toLowerCase(), u));
        sbUsers.forEach(u => map.set(u.email.toLowerCase(), u));
        initialUsers = Array.from(map.values());
      }
    } catch (err) {
      console.warn('Supabase fetch in AdminPage warning:', err);
    }
  }

  return (
    <AdminDashboardClient
      initialOrders={initialOrders}
      products={products}
      categories={categories}
      paymentMethods={paymentMethods}
      siteSettings={siteSettings}
      initialUsers={initialUsers}
    />
  );
}
