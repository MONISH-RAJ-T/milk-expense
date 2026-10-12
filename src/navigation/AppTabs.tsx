import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type AppTabsParamList = {
  Home: undefined;
  Tracker: { monthKey?: string } | undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export const AppTabs: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          lineHeight: 14,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tracker"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Tracker',
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size || 22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

