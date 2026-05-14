import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Modal, Alert } from 'react-native';
import { Shield, QrCode, ClipboardList, AlertTriangle, LogOut } from 'lucide-react-native';
import * as SQLite from 'expo-sqlite';
import { supabase } from '../lib/supabase';
import ScannerScreen from './ScannerScreen';
import { useSync } from '../hooks/useSync';

export default function MainDashboard() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { isSyncing } = useSync();

  const handleLogout = () => supabase.auth.signOut();

  const handleScan = async (token: string) => {
    setIsScannerOpen(false);
    
    try {
      const db = await SQLite.openDatabaseAsync('guardtrack.db');
      
      // Simulate finding a point by token
      // In a real app, we would have pre-downloaded control points for the establishment
      const scanId = Math.random().toString(36).substring(7);
      
      await db.runAsync(
        'INSERT INTO escaneos_local (id, ronda_id, punto_id, timestamp, sincronizado) VALUES (?, ?, ?, ?, ?)',
        [scanId, 'active-round-id', token, Date.now(), 0]
      );

      Alert.alert('Éxito', 'Punto de control escaneado correctamente.');
    } catch (error) {
      console.error('Error saving scan:', error);
      Alert.alert('Error', 'No se pudo guardar el escaneo localmente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Shield color="#38bdf8" size={32} />
          <Text style={styles.logoText}>GuardTrack</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut color="#64748b" size={20} />
        </TouchableOpacity>
      </View>

      {/* Hero / Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Ronda Actual</Text>
        <Text style={styles.statusTime}>En Curso</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '60%' }]} />
        </View>
        <Text style={styles.statusSub}>Edificio Principal • 6/10 puntos</Text>
      </View>

      {/* Actions Grid */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setIsScannerOpen(true)}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
            <QrCode color="#38bdf8" size={28} />
          </View>
          <Text style={styles.actionText}>Escanear QR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <ClipboardList color="#10b981" size={28} />
          </View>
          <Text style={styles.actionText}>Mi Historial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { width: '100%' }]}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
            <AlertTriangle color="#f43f5e" size={28} />
          </View>
          <Text style={styles.actionText}>Reportar Incidente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isSyncing ? 'Sincronizando...' : 'Datos Sincronizados'} • v1.0.0
        </Text>
      </View>

      {/* Scanner Modal */}
      <Modal visible={isScannerOpen} animationType="slide">
        <ScannerScreen 
          onScan={handleScan} 
          onClose={() => setIsScannerOpen(false)} 
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#0f172a',
    borderRadius: 12,
  },
  statusCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  statusTitle: {
    color: '#64748b',
    fontSize: 16,
    marginBottom: 8,
  },
  statusTime: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 4,
  },
  statusSub: {
    color: '#94a3b8',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
  }
});
