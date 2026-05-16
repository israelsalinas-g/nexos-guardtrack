import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LogOut, Shield } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function SupervisorDashboard() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Shield size={28} color="#38bdf8" />
          <Text style={styles.title}>GuardTrack</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <LogOut size={22} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.roleLabel}>
          {user?.rol === 'admin' ? 'Administrador' : 'Supervisor'}
        </Text>
        <Text style={styles.name}>{user?.nombre ?? ''}</Text>
        <Text style={styles.placeholder}>
          Panel de supervisión — próximamente
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  logoutBtn: { padding: 4 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  roleLabel: { fontSize: 13, color: '#38bdf8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  placeholder: { color: '#64748b', fontSize: 15, marginTop: 16, textAlign: 'center', paddingHorizontal: 32 },
});
