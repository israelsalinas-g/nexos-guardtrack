import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { GuardStackParamList } from './types';
import MainDashboard from '@/screens/MainDashboard';

// Placeholders — reemplazados en Fases 4 y 5
import HistoryScreen from '@/screens/HistoryScreen';
import IncidentReportScreen from '@/screens/IncidentReportScreen';

const Stack = createStackNavigator<GuardStackParamList>();

export default function GuardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuardDashboard" component={MainDashboard} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
    </Stack.Navigator>
  );
}
