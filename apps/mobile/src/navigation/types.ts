import { StackNavigationProp } from '@react-navigation/stack';

export type GuardStackParamList = {
  GuardDashboard: undefined;
  History: undefined;
  IncidentReport: undefined;
};

export type SupervisorStackParamList = {
  SupervisorDashboard: undefined;
};

export type GuardNavProp = StackNavigationProp<GuardStackParamList>;
export type SupervisorNavProp = StackNavigationProp<SupervisorStackParamList>;
