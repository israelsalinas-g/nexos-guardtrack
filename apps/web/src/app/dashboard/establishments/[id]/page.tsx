import { ArrowLeft, Plus, MoveVertical, QrCode } from 'lucide-react';
import Link from 'next/link';
import { getEstablishmentById, getControlPoints } from '@/lib/actions/establishments';
import { QRDownloadButton } from '@/components/QRGenerator';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EstablishmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const establishment = await getEstablishmentById(id);
  const controlPoints = await getControlPoints(id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header>
        <Link href="/admin/establishments" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} />
          Volver a Establecimientos
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '2rem' }}>{establishment.name}</h2>
            <p className="muted">{establishment.address}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {controlPoints.length > 0 && (
              <QRDownloadButton 
                establishmentName={establishment.name} 
                points={controlPoints.map(p => ({ name: p.name, qr_token: p.qr_token }))} 
              />
            )}
            <button className="button-primary">
              <Plus size={20} />
              Agregar Punto
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Control Points List */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Puntos de Control</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {controlPoints.map((point, index) => (
              <div key={point.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ cursor: 'grab', color: 'var(--muted)' }}>
                  <MoveVertical size={18} />
                </div>
                <div style={{ width: '40px', height: '40px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={20} color="#38bdf8" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600' }}>{point.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Token: {point.qr_token}</p>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)' }}>
                  #{index + 1}
                </div>
              </div>
            ))}

            {controlPoints.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '16px' }}>
                <p className="muted">No hay puntos de control configurados.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Config / Shifts Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Configuración de Turnos</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Define los horarios en los que se esperan rondas obligatorias.
            </p>
            <button className="button-primary" style={{ width: '100%', background: 'var(--secondary)', border: '1px solid var(--border)' }}>
              Gestionar Turnos
            </button>
          </div>

          <div className="glass" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
            <h5 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Estado del Sitio</h5>
            <p style={{ fontSize: '0.875rem' }}>Última ronda completada hace 45 minutos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
