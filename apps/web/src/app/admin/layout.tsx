import { Shield, LayoutDashboard, Map, Users, Settings, LogOut, Bell } from 'lucide-react';
import '../globals.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        borderRight: '1px solid var(--border)', 
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield color="#38bdf8" />
          <h2 style={{ fontSize: '1.25rem' }}>GuardTrack</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Map size={20} />} label="Establecimientos" />
          <NavItem icon={<Users size={20} />} label="Usuarios" />
          <NavItem icon={<Settings size={20} />} label="Configuración" />
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(244, 63, 94, 0.05)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <LogOut size={20} color="#f43f5e" />
          <span style={{ color: '#f43f5e', fontWeight: '600' }}>Cerrar Sesión</span>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          height: '80px', 
          borderBottom: '1px solid var(--border)', 
          padding: '0 3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Resumen General</h3>
            <p className="muted" style={{ fontSize: '0.875rem' }}>Miércoles, 13 Mayo 2026</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
              <Bell size={20} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>Admin User</p>
                <p className="muted" style={{ fontSize: '0.75rem' }}>Administrador</p>
              </div>
              <div style={{ width: '40px', height: '40px', background: 'var(--gradient-primary)', borderRadius: '50%' }}></div>
            </div>
          </div>
        </header>

        <div style={{ padding: '3rem', overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      padding: '0.875rem 1rem', 
      borderRadius: 'var(--radius)',
      background: active ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
      color: active ? '#38bdf8' : 'var(--muted)',
      fontWeight: active ? '600' : '400',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
