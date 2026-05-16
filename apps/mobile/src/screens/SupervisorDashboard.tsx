import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Shield, LogOut, WifiOff, Clock, AlertTriangle,
  CheckCircle2, RotateCcw, Building2, User,
} from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────────────

interface Establecimiento {
  id: string;
  nombre: string;
}

interface ActiveRound {
  id: string;
  inicio_real: string;
  guardia_nombre: string;
  establecimiento_nombre: string;
}

interface OpenIncident {
  id: string;
  tipo: 'ronda_vencida' | 'ronda_incompleta' | 'manual';
  estado: 'nuevo' | 'revisado' | 'cerrado';
  descripcion: string | null;
  created_at: string;
  establecimiento_nombre: string | null;
}

interface DashboardData {
  establecimientos: Establecimiento[];
  activeRounds: ActiveRound[];
  incidents: OpenIncident[];
}

// ── Helpers ──────────────────────────────────────────────────

function elapsedLabel(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const TIPO_LABEL: Record<OpenIncident['tipo'], string> = {
  ronda_vencida:    'Ronda vencida',
  ronda_incompleta: 'Ronda incompleta',
  manual:           'Reporte manual',
};

const ESTADO_COLOR: Record<OpenIncident['estado'], string> = {
  nuevo:    '#f43f5e',
  revisado: '#f59e0b',
  cerrado:  '#10b981',
};

// ── Data fetching ─────────────────────────────────────────────

async function fetchDashboard(supervisorId: string): Promise<DashboardData> {
  // 1. Supervisor's establishments
  const { data: estabs, error: estabErr } = await supabase
    .from('establecimientos')
    .select('id, nombre')
    .eq('supervisor_id', supervisorId)
    .eq('activo', true);
  if (estabErr) throw estabErr;

  const estabIds = (estabs ?? []).map(e => e.id);

  // 2. Active rounds in those establishments
  let activeRounds: ActiveRound[] = [];
  if (estabIds.length > 0) {
    const { data: rounds, error: roundErr } = await supabase
      .from('rondas')
      .select(`
        id,
        inicio_real,
        guardia:guardia_id ( nombre ),
        establecimiento:establecimiento_id ( nombre )
      `)
      .in('establecimiento_id', estabIds)
      .eq('estado', 'en_curso')
      .order('inicio_real', { ascending: false });
    if (roundErr) throw roundErr;

    activeRounds = (rounds ?? []).map((r: any) => ({
      id: r.id,
      inicio_real: r.inicio_real,
      guardia_nombre: r.guardia?.nombre ?? 'Guardia desconocido',
      establecimiento_nombre: r.establecimiento?.nombre ?? '—',
    }));
  }

  // 3. Open incidents visible to this supervisor (RLS filters by establishment)
  const { data: incData, error: incErr } = await supabase
    .from('incidentes')
    .select(`
      id, tipo, estado, descripcion, created_at,
      ronda:ronda_id (
        establecimiento:establecimiento_id ( nombre )
      )
    `)
    .neq('estado', 'cerrado')
    .order('created_at', { ascending: false });
  if (incErr) throw incErr;

  const incidents: OpenIncident[] = (incData ?? []).map((i: any) => ({
    id: i.id,
    tipo: i.tipo,
    estado: i.estado,
    descripcion: i.descripcion,
    created_at: i.created_at,
    establecimiento_nombre: i.ronda?.establecimiento?.nombre ?? null,
  }));

  return { establecimientos: estabs ?? [], activeRounds, incidents };
}

// ── Component ─────────────────────────────────────────────────

export default function SupervisorDashboard() {
  const { user, signOut } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const result = await fetchDashboard(user.id);
      if (mounted.current) setData(result);
    } catch (e: any) {
      if (mounted.current) setError(e.message ?? 'Error al cargar datos');
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [user]);

  useEffect(() => {
    mounted.current = true;

    const unsubscribe = NetInfo.addEventListener(state => {
      if (!mounted.current) return;
      const online = state.isConnected === true;
      setIsOnline(online);
      if (online && data === null) load();
    });

    NetInfo.fetch().then(state => {
      const online = state.isConnected === true;
      setIsOnline(online);
      if (online) load();
      else setLoading(false);
    });

    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [load]);

  // ── Offline state ─────────────────────────────────────────

  if (!isOnline) {
    return (
      <SafeAreaView style={styles.container}>
        <Header user={user} onSignOut={signOut} />
        <View style={styles.centered}>
          <WifiOff size={52} color="#334155" />
          <Text style={styles.offlineTitle}>Sin conexión</Text>
          <Text style={styles.offlineBody}>
            El panel de supervisión requiere conexión a internet.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading state ──────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header user={user} onSignOut={signOut} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ────────────────────────────────────────────

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header user={user} onSignOut={signOut} />
        <View style={styles.centered}>
          <AlertTriangle size={40} color="#f43f5e" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <RotateCcw size={16} color="#38bdf8" />
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { establecimientos, activeRounds, incidents } = data ?? {
    establecimientos: [], activeRounds: [], incidents: [],
  };

  // ── Main dashboard ─────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <Header user={user} onSignOut={signOut} />

      {/* Summary chips */}
      <View style={styles.summaryRow}>
        <SummaryChip icon={<Building2 size={14} color="#38bdf8" />} value={establecimientos.length} label="establecimientos" />
        <SummaryChip icon={<Clock size={14} color="#10b981" />} value={activeRounds.length} label="rondas activas" color="#10b981" />
        <SummaryChip icon={<AlertTriangle size={14} color="#f43f5e" />} value={incidents.length} label="incidentes" color="#f43f5e" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#38bdf8" />
        }
      >
        {/* ── Rondas en curso ── */}
        <SectionHeader
          title="Rondas en Curso"
          count={activeRounds.length}
          color="#10b981"
        />

        {activeRounds.length === 0 ? (
          <EmptyRow icon={<CheckCircle2 size={18} color="#334155" />} text="Sin rondas activas en este momento" />
        ) : (
          activeRounds.map(r => (
            <View key={r.id} style={[styles.card, { borderLeftColor: '#10b981' }]}>
              <View style={styles.cardRow}>
                <User size={14} color="#94a3b8" />
                <Text style={styles.cardPrimary}>{r.guardia_nombre}</Text>
                <Text style={styles.elapsed}>{elapsedLabel(r.inicio_real)}</Text>
              </View>
              <View style={styles.cardRow}>
                <Building2 size={13} color="#475569" />
                <Text style={styles.cardSecondary}>{r.establecimiento_nombre}</Text>
              </View>
              <Text style={styles.cardMeta}>Iniciada {formatDate(r.inicio_real)}</Text>
            </View>
          ))
        )}

        {/* ── Incidentes abiertos ── */}
        <SectionHeader
          title="Incidentes Abiertos"
          count={incidents.length}
          color="#f43f5e"
          topMargin
        />

        {incidents.length === 0 ? (
          <EmptyRow icon={<CheckCircle2 size={18} color="#334155" />} text="Sin incidentes abiertos" />
        ) : (
          incidents.map(i => (
            <View key={i.id} style={[styles.card, { borderLeftColor: ESTADO_COLOR[i.estado] }]}>
              <View style={styles.cardRow}>
                <View style={[styles.estadoBadge, { backgroundColor: ESTADO_COLOR[i.estado] + '22' }]}>
                  <Text style={[styles.estadoText, { color: ESTADO_COLOR[i.estado] }]}>
                    {i.estado.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.tipoText}>{TIPO_LABEL[i.tipo]}</Text>
              </View>
              {i.descripcion ? (
                <Text style={styles.cardSecondary} numberOfLines={2}>{i.descripcion}</Text>
              ) : null}
              <View style={styles.cardRow}>
                {i.establecimiento_nombre ? (
                  <>
                    <Building2 size={12} color="#475569" />
                    <Text style={styles.cardMeta}>{i.establecimiento_nombre} · </Text>
                  </>
                ) : null}
                <Text style={styles.cardMeta}>{formatDate(i.created_at)}</Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────

function Header({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Shield size={26} color="#38bdf8" />
        <View>
          <Text style={styles.headerTitle}>GuardTrack</Text>
          <Text style={styles.headerSub}>
            {user?.rol === 'admin' ? 'Administrador' : 'Supervisor'} · {user?.nombre ?? ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onSignOut} style={styles.logoutBtn}>
        <LogOut size={20} color="#64748b" />
      </TouchableOpacity>
    </View>
  );
}

function SummaryChip({
  icon, value, label, color = '#38bdf8',
}: { icon: React.ReactNode; value: number; label: string; color?: string }) {
  return (
    <View style={styles.chip}>
      {icon}
      <Text style={[styles.chipValue, { color }]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({
  title, count, color, topMargin,
}: { title: string; count: number; color: string; topMargin?: boolean }) {
  return (
    <View style={[styles.sectionHeader, topMargin && { marginTop: 24 }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionBadge, { backgroundColor: color + '22' }]}>
        <Text style={[styles.sectionCount, { color }]}>{count}</Text>
      </View>
    </View>
  );
}

function EmptyRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.emptyRow}>
      {icon}
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: '#64748b', fontSize: 12, marginTop: 1 },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#0f172a',
    borderRadius: 10,
  },

  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  chipValue: { fontSize: 15, fontWeight: 'bold' },
  chipLabel: { color: '#475569', fontSize: 11, flexShrink: 1 },

  scroll: { padding: 20, paddingBottom: 0 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  sectionBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  sectionCount: { fontSize: 13, fontWeight: 'bold' },

  card: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardPrimary: { color: '#f8fafc', fontSize: 15, fontWeight: '600', flex: 1 },
  cardSecondary: { color: '#94a3b8', fontSize: 13 },
  cardMeta: { color: '#475569', fontSize: 12 },
  elapsed: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  estadoBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  estadoText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  tipoText: { color: '#94a3b8', fontSize: 13, flex: 1 },

  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  emptyText: { color: '#475569', fontSize: 14 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, padding: 32 },
  offlineTitle: { color: '#f8fafc', fontSize: 20, fontWeight: 'bold' },
  offlineBody: { color: '#64748b', fontSize: 14, textAlign: 'center' },
  errorText: { color: '#f43f5e', fontSize: 14, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 4,
  },
  retryText: { color: '#38bdf8', fontSize: 14, fontWeight: '600' },

  bottomSpacer: { height: 32 },
});
