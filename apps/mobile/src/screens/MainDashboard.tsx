import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, QrCode, ClipboardList, AlertTriangle, LogOut, Play, CheckCircle2 } from 'lucide-react-native';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ScannerScreen from './ScannerScreen';
import { useNetSync } from '../hooks/useNetSync';
import { useRound } from '../hooks/useRound';
import { SyncStatusBar } from '../components/SyncStatusBar';
import type { GuardNavProp } from '../navigation/types';

interface Assignment {
  id: string;
  turno: {
    id: string;
    nombre: string;
    establecimiento: {
      id: string;
      nombre: string;
    };
    intervalo_ronda_min: number;
  };
}

interface ControlPoint {
  id: string;
  nombre: string;
}

export default function MainDashboard() {
  const navigation = useNavigation<GuardNavProp>();
  const { signOut } = useAuth();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const { isSyncing, pendingCount, failedCount, syncNow } = useNetSync();
  const { activeRound, scannedPoints, startRound, saveScan, finishRound, loading: loadingRound } = useRound();

  useEffect(() => {
    fetchAssignment();
    downloadControlPoints();
  }, []);

  const downloadControlPoints = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('guardtrack.db');
      
      // Get establishment from assignment if possible, or just fetch all for now
      const { data: points, error } = await supabase
        .from('puntos_control')
        .select('id, establecimiento_id, nombre, qr_token')
        .eq('activo', true);

      if (error) throw error;

      // Update local storage
      if (points) {
        // Clear old ones or just upsert
        for (const p of points) {
          await db.runAsync(
            'INSERT OR REPLACE INTO puntos_control_local (id, establecimiento_id, nombre, qr_token) VALUES (?, ?, ?, ?)',
            [p.id, p.establecimiento_id, p.nombre, p.qr_token]
          );
        }
      }
    } catch (error) {
      console.error('Error downloading control points:', error);
    }
  };

  const fetchAssignment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch active assignment for this guard
      const { data, error } = await supabase
        .from('asignaciones')
        .select(`
          id,
          turno:turnos (
            id,
            nombre,
            establecimiento:establecimientos (
              id,
              nombre
            ),
            intervalo_ronda_min
          )
        `)
        .eq('guardia_id', user.id)
        .eq('activo', true)
        .single();

      if (error) throw error;
      setAssignment(data as unknown as Assignment);
    } catch (error) {
      console.error('Error fetching assignment:', error);
    } finally {
      setLoadingAssignment(false);
    }
  };

  const handleLogout = () => signOut();

  const handleStartRound = async () => {
    if (!assignment) {
      Alert.alert('Error', 'No tienes un turno asignado para iniciar una ronda.');
      return;
    }

    try {
      await startRound(assignment.turno.id, assignment.turno.establecimiento.id);
      syncNow(); // Try to sync round start
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar la ronda.');
    }
  };

  const handleScan = async (token: string) => {
    setIsScannerOpen(false);
    if (!activeRound) return;

    try {
      const db = await SQLite.openDatabaseAsync('guardtrack.db');
      
      // Validate QR Token locally
      const point = await db.getFirstAsync<ControlPoint>(
        'SELECT id, nombre FROM puntos_control_local WHERE qr_token = ?',
        [token]
      );

      if (!point) {
        Alert.alert('Error', 'Código QR no reconocido para este establecimiento.');
        return;
      }

      await saveScan(point.id);
      Alert.alert('Éxito', `Punto detectado: ${point.nombre}`);
      syncNow(); 
    } catch (error) {
      console.error('Scan Error:', error);
      Alert.alert('Error', 'No se pudo procesar el escaneo.');
    }
  };

  const handleFinishRound = async () => {
    Alert.alert(
      'Finalizar Ronda',
      '¿Estás seguro de que deseas finalizar la ronda actual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Finalizar', 
          onPress: async () => {
            await finishRound();
            syncNow();
          } 
        }
      ]
    );
  };

  if (loadingAssignment || loadingRound) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

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
        <Text style={styles.statusTitle}>
          {assignment?.turno?.establecimiento?.nombre || 'Sin Establecimiento'}
        </Text>
        
        {!activeRound ? (
          <>
            <Text style={styles.statusMain}>Sin Ronda Activa</Text>
            <TouchableOpacity style={styles.startBtn} onPress={handleStartRound}>
              <Play color="#fff" size={24} fill="#fff" />
              <Text style={styles.startBtnText}>Iniciar Nueva Ronda</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.statusHeader}>
              <Text style={styles.statusMain}>Ronda en Curso</Text>
              <TouchableOpacity onPress={handleFinishRound}>
                <CheckCircle2 color="#10b981" size={28} />
              </TouchableOpacity>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(100, (scannedPoints.length / 5) * 100)}%` } 
                ]} 
              />
            </View>
            <Text style={styles.statusSub}>
              {scannedPoints.length} puntos registrados • {assignment?.turno?.nombre}
            </Text>
          </>
        )}
      </View>

      {/* Actions Grid */}
      <View style={styles.grid}>
        <TouchableOpacity 
          style={[styles.actionButton, !activeRound && styles.actionButtonDisabled]} 
          onPress={() => activeRound && setIsScannerOpen(true)}
          disabled={!activeRound}
        >
          <View style={[styles.iconBg, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
            <QrCode color={activeRound ? "#38bdf8" : "#475569"} size={28} />
          </View>
          <Text style={[styles.actionText, !activeRound && styles.actionTextDisabled]}>Escanear QR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('History')}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <ClipboardList color="#10b981" size={28} />
          </View>
          <Text style={styles.actionText}>Mi Historial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { width: '100%' }]} onPress={() => navigation.navigate('IncidentReport')}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
            <AlertTriangle color="#f43f5e" size={28} />
          </View>
          <Text style={styles.actionText}>Reportar Incidente</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <SyncStatusBar isSyncing={isSyncing} pendingCount={pendingCount} failedCount={failedCount} />
        <Text style={styles.footerText}>v1.0.0</Text>
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
  centered: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusMain: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    marginBottom: 12,
    marginTop: 5,
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
  actionButtonDisabled: {
    opacity: 0.5,
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
  actionTextDisabled: {
    color: '#475569',
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

