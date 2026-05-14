import { Activity, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { getDashboardStats, getRecentRounds } from '@/lib/actions/dashboard';

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const recentRounds = await getRecentRounds();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <StatCard 
          icon={<ShieldCheck color="#10b981" />} 
          label="Guardias Activos" 
          value={stats.activeGuards.toString()} 
          trend="+2 este turno" 
        />
        <StatCard 
          icon={<Activity color="#38bdf8" />} 
          label="Rondas en Curso" 
          value={stats.activeRounds.toString()} 
          trend="85% completado" 
        />
        <StatCard 
          icon={<AlertCircle color="#f43f5e" />} 
          label="Incidentes Hoy" 
          value={stats.openIncidents.toString()} 
          trend="1 pendiente" 
          isWarning
        />
        <StatCard 
          icon={<Clock color="#f59e0b" />} 
          label="Promedio Respuesta" 
          value={stats.averageResponseTime} 
          trend="-2m vs ayer" 
        />
      </div>

      {/* Real-time Rounds Section */}
      <div className="glass" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '1.25rem' }}>Monitoreo en Tiempo Real</h4>
          <button className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.1)', border: 'none', cursor: 'pointer' }}>
            ● En Vivo
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: '500' }}>Establecimiento</th>
              <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: '500' }}>Guardia</th>
              <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: '500' }}>Estado</th>
              <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: '500' }}>Progreso</th>
              <th style={{ padding: '1rem', color: 'var(--muted)', fontWeight: '500' }}>Inicio</th>
            </tr>
          </thead>
          <tbody>
            {recentRounds.map((round) => (
              <RoundRow 
                key={round.id}
                establishment={round.establishment} 
                guard={round.guard} 
                status={round.status} 
                progress={round.progress} 
                time={round.time}
                hasIncident={round.status === 'incident'}
              />
            ))}

            {recentRounds.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }} className="muted">
                  No hay rondas registradas hoy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  isWarning?: boolean;
}

function StatCard({ icon, label, value, trend, isWarning = false }: StatCardProps) {
  return (
    <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}>{icon}</div>
        <span style={{ fontSize: '0.75rem', color: isWarning ? '#f43f5e' : '#10b981', fontWeight: '600' }}>{trend}</span>
      </div>
      <div>
        <p className="muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ fontSize: '1.75rem', fontWeight: '700' }}>{value}</p>
      </div>
    </div>
  );
}

interface RoundRowProps {
  establishment: string;
  guard: string;
  status: string;
  progress: number;
  time: string;
  hasIncident?: boolean;
}

function RoundRow({ establishment, guard, status, progress, time, hasIncident = false }: RoundRowProps) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <td style={{ padding: '1.25rem' }}>{establishment}</td>
      <td style={{ padding: '1.25rem' }}>{guard}</td>
      <td style={{ padding: '1.25rem' }}>
        <span className={`badge ${hasIncident ? 'badge-error' : progress === 100 ? 'badge-success' : 'badge-warning'}`}>
          {status}
        </span>
      </td>
      <td style={{ padding: '1.25rem' }}>
        <div style={{ width: '100px', height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
        </div>
      </td>
      <td style={{ padding: '1.25rem' }} className="muted">{time}</td>
    </tr>
  );
}
