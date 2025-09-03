import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { tasks, reminders, notes, toggleTask, deleteTask } = useAppContext();
  const { showToast } = useToast();
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showAllReminders, setShowAllReminders] = useState(false);

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toggleTask(taskId);
      if (!task.completed) {
        showToast('Taak voltooid! ✅', 'success');
      } else {
        showToast('Taak weer actief', 'info');
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      deleteTask(taskId);
      showToast('Taak verwijderd', 'info');
    }
  };

  // Get recent notes (last 3)
  const recentNotes = notes.slice(-3).reverse();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welkom terug, Erbil! 👋</Text>
        </View>

        {/* Taken Overzicht */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Taken</Text>
          <View style={styles.tasksContainer}>
            {tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="list-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>Geen taken</Text>
              </View>
            ) : (
              // Toon eerst niet-voltooide taken, dan voltooide taken
              [...tasks.filter(task => !task.completed), ...tasks.filter(task => task.completed)]
                .slice(0, showAllTasks ? undefined : 3).map((task, index, arr) => (
                <View key={task.id} style={[styles.taskItem, index === arr.length - 1 && styles.lastItem]}>
                  <TouchableOpacity
                    style={[styles.taskCheckbox, task.completed && styles.taskCheckboxCompleted]}
                    onPress={() => handleToggleTask(task.id)}
                  >
                    {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
                  </TouchableOpacity>
                  <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskPriority}>
                    {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.deleteTaskButton}
                    onPress={() => handleDeleteTask(task.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
                                {tasks.length > 3 && (
                      <TouchableOpacity onPress={() => setShowAllTasks(!showAllTasks)}>
                        <Text style={styles.moreItems}>
                          {showAllTasks 
                            ? 'Minder tonen' 
                            : `+${tasks.length - 3} meer...`}
                        </Text>
                      </TouchableOpacity>
                    )}
          </View>
        </View>

        {/* Herinneringen Overzicht */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Herinneringen</Text>
          <View style={styles.remindersContainer}>
            {reminders.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>Geen herinneringen</Text>
              </View>
                                ) : (
                      reminders.slice(0, showAllReminders ? undefined : 3).map((reminder, index, arr) => (
                <View key={reminder.id} style={[styles.reminderItem, index === arr.length - 1 && styles.lastItem]}>
                  <View style={styles.reminderIcon}>
                    <Ionicons name="alarm-outline" size={20} color="#f97316" />
                  </View>
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderTime}>{reminder.time}</Text>
                  </View>
                </View>
              ))
            )}
            {reminders.length > 3 && (
              <TouchableOpacity onPress={() => setShowAllReminders(!showAllReminders)}>
                <Text style={styles.moreItems}>
                  {showAllReminders 
                    ? 'Minder tonen' 
                    : `+${reminders.length - 3} meer...`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Recent Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recente Notities</Text>
          {recentNotes.map((note) => (
            <TouchableOpacity key={note.id} style={styles.noteCard}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.notePreview}>{note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content}</Text>
            </TouchableOpacity>
          ))}
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
  tasksContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
    opacity: 0.6,
  },
  taskPriority: {
    fontSize: 16,
    marginLeft: 8,
  },
  remindersContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  reminderTime: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  moreItems: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: 12,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  deleteTaskButton: {
    padding: 8,
    marginLeft: 8,
  },
});
