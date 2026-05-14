import './globals.css';

export default function Home() {
  return (
    <main>
      <div className="container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--gradient-primary)', borderRadius: '10px' }}></div>
            <h2 style={{ fontSize: '1.5rem' }}>GuardTrack</h2>
          </div>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" className="muted">Dashboard</a>
            <a href="#" className="muted">Rondas</a>
            <a href="#" className="muted">Incidentes</a>
            <button className="button-primary">Iniciar Sesión</button>
          </nav>
        </header>

        <section style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <span className="badge badge-success" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>Nueva Versión 1.0</span>
          <h1 className="hero-text">Supervisión Inteligente para Seguridad Moderna</h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Monitorea rondas en tiempo real, recibe alertas de incidentes y gestiona puntos de control mediante QR de forma eficiente.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="button-primary">Panel de Control</button>
            <button style={{ 
              background: 'transparent', 
              border: '1px solid var(--border)', 
              color: 'var(--foreground)',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius)',
              fontWeight: '600',
              cursor: 'pointer'
            }}>Ver Documentación</button>
          </div>
        </section>

        <section className="glass" style={{ padding: '3rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>100%</h3>
            <p className="muted">Soporte Offline</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>+150</h3>
            <p className="muted">Escaneos Diarios</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>0ms</h3>
            <p className="muted">Latencia en Alertas</p>
          </div>
        </section>
      </div>
    </main>
  );
}
