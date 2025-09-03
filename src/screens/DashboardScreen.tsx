import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const todayEvents = useMemo(() => [
    { id: '1', title: 'Team Meeting', time: '09:00', duration: '1.5h', color: '#f97316', status: 'upcoming' },
    { id: '2', title: 'Project Review', time: '14:30', duration: '2h', color: '#10b981', status: 'upcoming' },
    { id: '3', title: 'Client Call', time: '16:00', duration: '1h', color: '#8b5cf6', status: 'upcoming' },
    { id: '4', title: 'Design Workshop', time: '18:00', duration: '3h', color: '#ef4444', status: 'upcoming' },
  ], []);

  const recentNotes = useMemo(() => [
    { id: '1', title: 'Project Ideas', preview: 'New mobile app concept with AI integration...', updatedAt: '2u geleden', priority: 'high' },
    { id: '2', title: 'Meeting Notes', preview: 'Discussed quarterly goals and roadmap...', updatedAt: '5u geleden', priority: 'medium' },
    { id: '3', title: 'Todo List', preview: 'Complete design mockups for Q2 release...', updatedAt: '1d geleden', priority: 'low' },
  ], []);

  const stats = useMemo(() => [
    { label: 'Afspraken', value: '4', icon: 'calendar-outline', color: '#f97316' },
    { label: 'Notities', value: '12', icon: 'document-text-outline', color: '#10b981' },
    { label: 'Taken', value: '8', icon: 'checkmark-circle-outline', color: '#8b5cf6' },
  ], []);

  const handleQuickAction = useCallback((action: string) => {
    console.log('Quick action:', action);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-background" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 20 : 10 }}
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9']}
        className="px-6 pt-4 pb-6"
      >
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-3xl font-bold text-text-primary">Dashboard</Text>
            <Text className="text-text-secondary mt-1 text-base">Welkom terug, Erbil 👋</Text>
          </View>
          <TouchableOpacity className="bg-white p-3 rounded-xl shadow-soft">
            <Ionicons name="notifications-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>
        
        {/* Quick Stats */}
        <View className="flex-row justify-between mt-4">
          {stats.map((stat, index) => (
            <View key={index} className="bg-white rounded-xl p-4 flex-1 mx-1 shadow-soft">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-2xl font-bold text-text-primary">{stat.value}</Text>
                  <Text className="text-text-secondary text-sm mt-1">{stat.label}</Text>
                </View>
                <View 
                  className="w-10 h-10 rounded-lg items-center justify-center"
                  style={{ backgroundColor: stat.color + '20' }}
                >
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View className="px-6">
        {/* Today's Events */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-text-primary">Vandaag</Text>
            <TouchableOpacity onPress={() => handleQuickAction('viewAllEvents')}>
              <Text className="text-accent font-medium">Alles bekijken</Text>
            </TouchableOpacity>
          </View>
          
          <View className="card">
            {todayEvents.map((event, index) => (
              <TouchableOpacity 
                key={event.id} 
                className={`flex-row items-center py-4 ${index !== todayEvents.length - 1 ? 'border-b border-background-muted' : ''}`}
                onPress={() => handleQuickAction('openEvent')}
              >
                <View 
                  className="w-4 h-4 rounded-full mr-4" 
                  style={{ backgroundColor: event.color }}
                />
                <View className="flex-1">
                  <Text className="text-text-primary font-semibold text-base">{event.title}</Text>
                  <Text className="text-text-secondary text-sm mt-1">{event.time} • {event.duration}</Text>
                </View>
                <View className="bg-background-secondary px-3 py-1 rounded-full">
                  <Text className="text-text-secondary text-xs font-medium">Binnenkort</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Notes */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-text-primary">Recente Notities</Text>
            <TouchableOpacity onPress={() => handleQuickAction('viewAllNotes')}>
              <Text className="text-accent font-medium">Alles bekijken</Text>
            </TouchableOpacity>
          </View>
          
          <View className="space-y-3">
            {recentNotes.map((note) => (
              <TouchableOpacity 
                key={note.id} 
                className="card card-content"
                onPress={() => handleQuickAction('openNote')}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-text-primary font-semibold text-base flex-1">{note.title}</Text>
                  <View 
                    className="w-2 h-2 rounded-full ml-3 mt-2"
                    style={{ backgroundColor: getPriorityColor(note.priority) }}
                  />
                </View>
                <Text className="text-text-secondary text-sm mb-3" numberOfLines={2}>
                  {note.preview}
                </Text>
                <Text className="text-text-muted text-xs">{note.updatedAt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-text-primary mb-4">Snelle Acties</Text>
          
          <View className="space-y-3">
            {/* Primary Actions */}
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="btn-primary flex-1 flex-row items-center justify-center"
                onPress={() => handleQuickAction('newNote')}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Nieuwe Notitie</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="btn-secondary flex-1 flex-row items-center justify-center"
                onPress={() => handleQuickAction('newAppointment')}
              >
                <Ionicons name="calendar" size={20} color="#f97316" />
                <Text className="text-accent font-semibold ml-2">Afspraak</Text>
              </TouchableOpacity>
            </View>
            
            {/* Secondary Actions */}
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="bg-white border border-background-muted rounded-xl p-4 flex-1 flex-row items-center justify-center"
                onPress={() => handleQuickAction('voiceNote')}
              >
                <Ionicons name="mic-outline" size={20} color="#64748b" />
                <Text className="text-text-secondary font-medium ml-2">Voice Note</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-white border border-background-muted rounded-xl p-4 flex-1 flex-row items-center justify-center"
                onPress={() => handleQuickAction('scanDocument')}
              >
                <Ionicons name="scan-outline" size={20} color="#64748b" />
                <Text className="text-text-secondary font-medium ml-2">Scan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* AI Suggestions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-text-primary mb-4">AI Suggesties</Text>
          
          <View className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-accent/20">
            <View className="flex-row items-center mb-3">
              <View className="bg-accent/20 p-2 rounded-lg">
                <Ionicons name="bulb-outline" size={20} color="#f97316" />
              </View>
              <Text className="text-accent font-semibold ml-3">Slimme Tip</Text>
            </View>
            
            <Text className="text-text-secondary text-sm mb-3">
              Je hebt 3 afspraken vandaag. Wil je een reminder instellen voor je eerste meeting om 09:00?
            </Text>
            
            <View className="flex-row space-x-2">
              <TouchableOpacity 
                className="bg-accent px-4 py-2 rounded-lg"
                onPress={() => handleQuickAction('setReminder')}
              >
                <Text className="text-white font-medium text-sm">Ja, stel in</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-white px-4 py-2 rounded-lg border border-background-muted"
                onPress={() => handleQuickAction('dismissSuggestion')}
              >
                <Text className="text-text-secondary font-medium text-sm">Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
