import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Clock, AlertTriangle, Cloud, Upload } from 'lucide-react-native';

interface RoundCardProps {
  estado: 'en_curso' | 'completada' | 'incidente';
  inicioReal: number;
  finReal: number | null;
  scanCount: number;
  sincronizado: 0 | 1;
}

const ESTADO_CONFIG = {
  en_curso:   { label: 'En curso',   color: '#38bdf8', Icon: Clock },
  completada: { label: 'Completada', color: '#10b981', Icon: CheckCircle2 },
  incidente:  { label: 'Incidente',  color: '#f43f5e', Icon: AlertTriangle },
} as const;

function formatTime(ms: number): string {
  const d = new Date(ms);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

export function RoundCard({ estado, inicioReal, finReal, scanCount, sincronizado }: RoundCardProps) {
  const { label, color, Icon } = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.en_curso;

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      {/* Badge + sync icon */}
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: color + '22' }]}>
          <Icon size={13} color={color} />
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
        {sincronizado === 1
          ? <Cloud size={15} color="#334155" />
          : <Upload size={15} color="#38bdf8" />}
      </View>

      {/* Timestamps */}
      <View style={styles.row}>
        <Text style={styles.timeMain}>{formatTime(inicioReal)}</Text>
        <Text style={styles.timeSep}>—</Text>
        <Text style={styles.timeMain}>
          {finReal ? formatTime(finReal) : 'En curso'}
        </Text>
        <Text style={styles.dateLabel}>{formatDate(inicioReal)}</Text>
      </View>

      {/* Scan count */}
      <Text style={styles.scans}>
        {scanCount} punto{scanCount !== 1 ? 's' : ''} registrado{scanCount !== 1 ? 's' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flex: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeMain: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  timeSep: {
    color: '#475569',
    fontSize: 14,
  },
  dateLabel: {
    color: '#64748b',
    fontSize: 13,
    marginLeft: 'auto',
  },
  scans: {
    color: '#64748b',
    fontSize: 13,
  },
});
