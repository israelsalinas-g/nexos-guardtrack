import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { CloudOff, CheckCircle } from 'lucide-react-native';

interface SyncStatusBarProps {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
}

export function SyncStatusBar({ isSyncing, pendingCount, failedCount }: SyncStatusBarProps) {
  if (failedCount > 0) {
    return (
      <View style={styles.row}>
        <CloudOff size={12} color="#f43f5e" />
        <Text style={[styles.text, styles.error]}>
          {failedCount} registro{failedCount !== 1 ? 's' : ''} sin sincronizar
        </Text>
      </View>
    );
  }

  if (isSyncing || pendingCount > 0) {
    return (
      <View style={styles.row}>
        <ActivityIndicator size={12} color="#38bdf8" />
        <Text style={[styles.text, styles.syncing]}>
          {isSyncing ? 'Sincronizando...' : `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <CheckCircle size={12} color="#10b981" />
      <Text style={[styles.text, styles.ok]}>Datos Sincronizados</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 12,
  },
  ok: { color: '#475569' },
  syncing: { color: '#38bdf8' },
  error: { color: '#f43f5e' },
});
