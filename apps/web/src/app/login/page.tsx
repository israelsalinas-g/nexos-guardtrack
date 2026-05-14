import Image from 'next/image';
import '../globals.css';

export default function LoginPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #0f172a, #020617)'
    }}>
      <div className="glass" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            marginBottom: '1rem'
          }}>
            <Image 
              src="/assets/logo_nexos_guardtrack.png" 
              alt="Nexos GuardTrack Logo" 
              width={160}
              height={80}
              style={{ objectFit: 'contain' }} 
            />
          </div>
          <h2 style={{ fontSize: '1.875rem', marginTop: '0.5rem' }}>Bienvenido</h2>
          <p className="muted">Ingresa tus credenciales para continuar</p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Email</label>
            <input 
              type="email" 
              placeholder="nombre@empresa.com"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid var(--border)', 
                padding: '0.75rem', 
                borderRadius: 'var(--radius)',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid var(--border)', 
                padding: '0.75rem', 
                borderRadius: 'var(--radius)',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <button className="button-primary" style={{ marginTop: '0.5rem' }}>
            Iniciar Sesión
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }} className="muted">
          ¿Olvidaste tu contraseña? <a href="#" style={{ color: 'var(--primary)' }}>Recuperar</a>
        </p>
      </div>
    </div>
  );
}
