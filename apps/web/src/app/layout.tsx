import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GuardTrack | Nexos',
  description: 'Sistema de supervisión de rondas de seguridad',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
