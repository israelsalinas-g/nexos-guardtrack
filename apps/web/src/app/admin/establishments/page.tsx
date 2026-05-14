import { Plus, MapPin, QrCode, Trash2, ChevronRight } from 'lucide-react';
import { getEstablishments } from '@/lib/actions/establishments';
import Link from 'next/link';

export default async function EstablishmentsPage() {
  const establishments = await getEstablishments();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem' }}>Establecimientos</h2>
          <p className="muted">Gestiona los locales y sus puntos de control</p>
        </div>
        <button className="button-primary">
          <Plus size={20} />
          Nuevo Establecimiento
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {establishments.map((est) => (
          <div key={est.id} className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px' }}>
                  <MapPin color="#38bdf8" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.125rem' }}>{est.name}</h4>
                  <p className="muted" style={{ fontSize: '0.875rem' }}>{est.address || 'Sin dirección'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Puntos de Control</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QrCode size={16} color="#10b981" />
                  <span style={{ fontWeight: '600' }}>8 Puntos</span>
                </div>
              </div>
              <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Guardias</p>
                <span style={{ fontWeight: '600' }}>3 Activos</span>
              </div>
            </div>

            <Link 
              href={`/admin/establishments/${est.id}`}
              className="button-primary" 
              style={{ justifyContent: 'center', background: 'var(--secondary)', border: '1px solid var(--border)' }}
            >
              Configurar Puntos y Turnos
              <ChevronRight size={18} />
            </Link>
          </div>
        ))}

        {establishments.length === 0 && (
          <div className="glass" style={{ padding: '4rem', gridColumn: '1 / -1', textAlign: 'center' }}>
            <p className="muted">No hay establecimientos registrados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
