import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import './global.css';

import SplashScreen from './src/components/SplashScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import NotesScreen from './src/screens/NotesScreen';
import CalendarScreen from './src/screens/CalendarScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#d6d6d6" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            headerStyle: {
              backgroundColor: '#d6d6d6',
              shadowColor: 'transparent',
              elevation: 0,
            },
            headerTitleStyle: {
              color: '#000000',
              fontWeight: 'bold',
            },
            headerRight: () => (
              <TouchableOpacity
                style={{ marginRight: 16 }}
                onPress={() => console.log('Settings pressed')}
              >
                <Ionicons name="settings-outline" size={24} color="#000000" />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Notities') {
                iconName = focused ? 'document-text' : 'document-text-outline';
              } else if (route.name === 'Kalender') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else {
                iconName = 'home-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#F97316',
            tabBarInactiveTintColor: '#666666',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopColor: '#e5e5e5',
              paddingBottom: 8,
              paddingTop: 8,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          })}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ title: 'Dashboard' }}
          />
          <Tab.Screen 
            name="Notities" 
            component={NotesScreen}
            options={{ title: 'Notities' }}
          />
          <Tab.Screen 
            name="Kalender" 
            component={CalendarScreen}
            options={{ title: 'Kalender' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}