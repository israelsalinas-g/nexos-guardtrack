import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ClipboardList } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import { RoundCard } from '@/components/RoundCard';
import type { LocalRound } from '@/types';

interface RoundRow extends LocalRound {
  scanCount: number;
}

async function loadRoundsFromDB(): Promise<RoundRow[]> {
  const db = await SQLite.openDatabaseAsync('guardtrack.db');

  const rounds = await db.getAllAsync<LocalRound>(
    'SELECT * FROM rondas_local ORDER BY inicio_real DESC'
  );

  const rows: RoundRow[] = await Promise.all(
    rounds.map(async r => {
      const countRow = await db.getFirstAsync<{ n: number }>(
        'SELECT COUNT(*) as n FROM escaneos_local WHERE ronda_id = ?',
        [r.id]
      );
      return { ...r, scanCount: countRow?.n ?? 0 };
    })
  );

  return rows;
}

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [rounds, setRounds] = useState<RoundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await loadRoundsFromDB();
      setRounds(data);
    } catch (e) {
      console.error('HistoryScreen load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Mi Historial</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{rounds.length}</Text>
        </View>
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#38bdf8" />
        </View>
      ) : rounds.length === 0 ? (
        <View style={styles.centered}>
          <ClipboardList size={48} color="#1e293b" />
          <Text style={styles.emptyTitle}>Sin rondas registradas</Text>
          <Text style={styles.emptyBody}>Las rondas que completes aparecerán aquí.</Text>
        </View>
      ) : (
        <FlatList
          data={rounds}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor="#38bdf8"
            />
          }
          renderItem={({ item }) => (
            <RoundCard
              estado={item.estado as 'en_curso' | 'completada' | 'incidente'}
              inicioReal={item.inicio_real}
              finReal={item.fin_real}
              scanCount={item.scanCount}
              sincronizado={item.sincronizado}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    gap: 12,
  },
  backBtn: {
    padding: 6,
    backgroundColor: '#0f172a',
    borderRadius: 10,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyBody: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
});
