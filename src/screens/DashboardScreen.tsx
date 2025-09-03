import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const todayEvents = [
    { id: '1', title: 'Team Meeting', time: '09:00', color: '#F97316' },
    { id: '2', title: 'Project Review', time: '14:30', color: '#10B981' },
    { id: '3', title: 'Client Call', time: '16:00', color: '#8B5CF6' },
  ];

  const recentNotes = [
    { id: '1', title: 'Project Ideas', preview: 'New mobile app concept...' },
    { id: '2', title: 'Meeting Notes', preview: 'Discussed quarterly goals...' },
    { id: '3', title: 'Todo List', preview: 'Complete design mockups...' },
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-primary">Dashboard</Text>
          <Text className="text-primary/70 mt-1">Welkom terug</Text>
        </View>

        {/* Today's Events */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-primary mb-3">Vandaag</Text>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            {todayEvents.map((event) => (
              <View key={event.id} className="flex-row items-center py-2">
                <View 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: event.color }}
                />
                <View className="flex-1">
                  <Text className="text-primary font-medium">{event.title}</Text>
                  <Text className="text-primary/60 text-sm">{event.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Notes */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-primary mb-3">Recente Notities</Text>
          {recentNotes.map((note) => (
            <TouchableOpacity 
              key={note.id} 
              className="bg-white rounded-lg p-4 mb-2 shadow-sm"
            >
              <Text className="text-primary font-medium mb-1">{note.title}</Text>
              <Text className="text-primary/60 text-sm">{note.preview}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-primary mb-3">Snelle Acties</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-accent rounded-lg p-4 flex-1 mr-2 items-center">
              <Ionicons name="add" size={24} color="white" />
              <Text className="text-white font-medium mt-1">Nieuwe Notitie</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-white border border-accent rounded-lg p-4 flex-1 ml-2 items-center">
              <Ionicons name="calendar" size={24} color="#F97316" />
              <Text className="text-accent font-medium mt-1">Afspraak</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
