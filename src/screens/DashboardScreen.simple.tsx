import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const navigation = useNavigation();
  
  const todayEvents = [
    { id: '1', title: 'Team Meeting', time: '09:00', color: '#f97316' },
    { id: '2', title: 'Project Review', time: '14:30', color: '#10b981' },
    { id: '3', title: 'Client Call', time: '16:00', color: '#8b5cf6' },
  ];

  const recentNotes = [
    { id: '1', title: 'Project Ideas', preview: 'New mobile app concept...' },
    { id: '2', title: 'Meeting Notes', preview: 'Discussed quarterly goals...' },
    { id: '3', title: 'Todo List', preview: 'Complete design mockups...' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welkom terug, Erbil! 👋</Text>
        </View>

        {/* Today's Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vandaag</Text>
          <View style={styles.card}>
            {todayEvents.map((event, index) => (
              <View key={event.id} style={[styles.eventItem, index !== todayEvents.length - 1 && styles.eventBorder]}>
                <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recente Notities</Text>
          {recentNotes.map((note) => (
            <TouchableOpacity key={note.id} style={styles.noteCard}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.notePreview}>{note.preview}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Snelle Acties</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.primaryAction}
              onPress={() => navigation.navigate('Notities' as never)}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.primaryActionText}>Nieuwe Notitie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryAction}>
              <Ionicons name="calendar" size={24} color="#f97316" />
              <Text style={styles.secondaryActionText}>Afspraak</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  eventBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  eventTime: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#64748b',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 4,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryActionText: {
    color: '#f97316',
    fontWeight: '600',
    marginTop: 4,
  },
});
