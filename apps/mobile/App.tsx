import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SQLite from 'expo-sqlite';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { initDatabase } from '@/lib/database';
import LoginScreen from '@/screens/LoginScreen';
import MainDashboard from '@/screens/MainDashboard';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Init SQLite
    initDatabase().then(() => setDbReady(true));

    // 2. Check Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading || !dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {!session ? (
        <LoginScreen onLoginSuccess={() => {}} />
      ) : (
        <MainDashboard />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
