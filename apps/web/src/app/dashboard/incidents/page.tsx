import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { getIncidents, updateIncidentStatus } from '@/lib/actions/incidents';

export default async function IncidentsPage() {
  const incidents = await getIncidents();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>Gestión de Incidentes</h2>
          <p className="muted">Monitoreo y resolución de anomalías en tiempo real.</p>
        </div>
        <div className="badge badge-error" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
          {incidents.filter(i => i.estado !== 'cerrado').length} Pendientes
        </div>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {incidents.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}

        {incidents.length === 0 && (
          <div className="glass" style={{ padding: '5rem', textAlign: 'center' }}>
            <AlertCircle size={48} color="var(--muted)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sin incidentes registrados</h3>
            <p className="muted">Todo parece estar en orden en todos los establecimientos.</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface Incident {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  created_at: string;
  ronda?: {
    establecimiento?: { nombre: string };
    guardia?: { nombre: string };
  };
}

function IncidentCard({ incident }: { incident: Incident }) {
  const statusColors = {
    nuevo: '#f43f5e',
    revisado: '#f59e0b',
    cerrado: '#10b981',
  };

  const typeLabels = {
    ronda_vencida: 'Ronda Vencida',
    ronda_incompleta: 'Ronda Incompleta',
    manual: 'Reporte Manual',
  };

  return (
    <div className="glass" style={{ 
      padding: '1.5rem', 
      borderLeft: `6px solid ${statusColors[incident.estado as keyof typeof statusColors]}`,
      display: 'grid',
      gridTemplateColumns: '1fr 2fr 1fr',
      gap: '2rem',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} color={statusColors[incident.estado as keyof typeof statusColors]} />
          <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', color: statusColors[incident.estado as keyof typeof statusColors] }}>
            {typeLabels[incident.tipo as keyof typeof typeLabels]}
          </span>
        </div>
        <h4 style={{ fontSize: '1.1rem' }}>{incident.ronda?.establecimiento?.nombre || 'General'}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }} className="muted">
          <Clock size={14} />
          {new Date(incident.created_at).toLocaleString()}
        </div>
      </div>

      <div>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1rem' }}>
          {incident.descripcion || 'Sin descripción detallada.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="badge" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--muted)' }}>Guardia:</span>
            {incident.ronda?.guardia?.nombre || 'Sincronizando...'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {incident.estado !== 'cerrado' ? (
          <>
            <form action={async () => {
              'use server';
              await updateIncidentStatus(incident.id, incident.estado === 'nuevo' ? 'revisado' : 'cerrado');
            }}>
              <button className="button-primary" style={{ width: '100%', background: incident.estado === 'nuevo' ? 'var(--secondary)' : '#10b981' }}>
                {incident.estado === 'nuevo' ? 'Marcar como Revisado' : 'Cerrar Incidente'}
              </button>
            </form>
            <button className="button-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)' }}>
              Ver Detalles
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', color: '#10b981' }}>
              <CheckCircle2 size={16} />
              <span style={{ fontWeight: '600' }}>Resuelto</span>
            </div>
            <p style={{ fontSize: '0.75rem' }} className="muted">Cerrado por: Admin</p>
          </div>
        )}
      </div>
    </div>
  );
}
