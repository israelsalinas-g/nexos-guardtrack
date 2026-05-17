import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNav } from '@/components/layout/MobileNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('usuarios')
    .select('nombre, rol')
    .eq('id', user.id)
    .single();

  if (!profile || profile.rol === 'guardia') redirect('/login');

  const userName = profile.nombre ?? user.email ?? 'Usuario';
  const role = profile.rol as 'supervisor' | 'admin';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar role={role} userName={userName} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar role={role} userName={userName} />

        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
