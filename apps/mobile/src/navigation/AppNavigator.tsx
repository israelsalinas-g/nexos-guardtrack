import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/screens/LoginScreen';
import GuardStack from './GuardStack';
import SupervisorStack from './SupervisorStack';

type RootStackParamList = {
  Login: undefined;
  GuardApp: undefined;
  SupervisorApp: undefined;
};

const Root = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
        {!session ? (
          <Root.Screen name="Login" component={LoginScreen} />
        ) : user?.rol === 'guardia' ? (
          <Root.Screen name="GuardApp" component={GuardStack} />
        ) : (
          <Root.Screen name="SupervisorApp" component={SupervisorStack} />
        )}
      </Root.Navigator>
    </NavigationContainer>
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
