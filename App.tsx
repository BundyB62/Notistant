import React, { useState, useCallback, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SplashScreen from './src/components/SplashScreen.simple';
import DashboardScreen from './src/screens/DashboardScreen.simple';
import NotesScreen from './src/screens/NotesScreen.enhanced';
import CalendarScreen from './src/screens/CalendarScreen.simple';

const Tab = createBottomTabNavigator();

// Optimized theme colors
const theme = {
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    primary: '#0f172a',
    accent: '#f97316',
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    border: '#e2e8f0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Memoized screen options for better performance
  const screenOptions = useMemo(() => ({ route }: any) => ({
    headerShown: true,
    headerStyle: {
      backgroundColor: theme.colors.surface,
      shadowColor: 'transparent',
      elevation: 0,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitleStyle: {
      color: theme.colors.text.primary,
      fontWeight: '600',
      fontSize: 18,
    },
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 16, padding: 8 }}
        onPress={() => console.log('Settings pressed')}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="settings-outline" 
          size={24} 
          color={theme.colors.text.primary} 
        />
      </TouchableOpacity>
    ),
    tabBarIcon: ({ focused, color, size }: any) => {
      let iconName: keyof typeof Ionicons.glyphMap;

      switch (route.name) {
        case 'Dashboard':
          iconName = focused ? 'home' : 'home-outline';
          break;
        case 'Notities':
          iconName = focused ? 'document-text' : 'document-text-outline';
          break;
        case 'Kalender':
          iconName = focused ? 'calendar' : 'calendar-outline';
          break;
        default:
          iconName = 'home-outline';
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: theme.colors.accent,
    tabBarInactiveTintColor: theme.colors.text.secondary,
    tabBarStyle: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.border,
      paddingBottom: Platform.OS === 'ios' ? 20 : theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      height: Platform.OS === 'ios' ? 80 : 65,
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 2,
    },
  }), []);

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <StatusBar 
        style="dark" 
        backgroundColor={theme.colors.background} 
        translucent={false}
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={screenOptions}
          initialRouteName="Dashboard"
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ 
              title: 'Dashboard',
              tabBarLabel: 'Home'
            }}
          />
          <Tab.Screen 
            name="Notities" 
            component={NotesScreen}
            options={{ 
              title: 'Mijn Notities',
              tabBarLabel: 'Notities'
            }}
          />
          <Tab.Screen 
            name="Kalender" 
            component={CalendarScreen}
            options={{ 
              title: 'Kalender',
              tabBarLabel: 'Agenda'
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}