import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SupervisorStackParamList } from './types';
import SupervisorDashboard from '@/screens/SupervisorDashboard';

const Stack = createStackNavigator<SupervisorStackParamList>();

export default function SupervisorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SupervisorDashboard" component={SupervisorDashboard} />
    </Stack.Navigator>
  );
}
