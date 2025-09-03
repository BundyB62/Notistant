import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,

  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

// Nederlandse locale configuratie
LocaleConfig.locales['nl'] = {
  monthNames: [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ],
  monthNamesShort: [
    'Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
  ],
  dayNames: [
    'Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'
  ],
  dayNamesShort: ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'],
  today: 'Vandaag'
};
LocaleConfig.defaultLocale = 'nl';

export default function AgendaScreen() {
  const today = new Date().toISOString().split('T')[0];
  const { events, addEvent, deleteEvent } = useAppContext();
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState(today);
  const [showCalendar, setShowCalendar] = useState(true);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    date: '',
    description: ''
  });

  const addNewEvent = () => {
    if (!newEvent.title.trim()) {
      showToast('Vul een titel in voor je afspraak', 'error');
      return;
    }

    const event = {
      title: newEvent.title,
      time: newEvent.time || '10:00',
      date: newEvent.date || selectedDate,
      description: newEvent.description,
      color: '#f97316'
    };
    
    addEvent(event);
    setNewEvent({ title: '', time: '', date: '', description: '' });
    setShowNewEventModal(false);
    showToast('Nieuwe afspraak toegevoegd!', 'success');
  };

  // Helper functies
  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};
    events.forEach(event => {
      if (event.date && event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        marked[event.date] = {
          marked: true,
          dotColor: event.color || '#f97316',
        };
      }
    });
    
    // Markeer geselecteerde datum
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#f97316',
      };
    }
    
    return marked;
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📅 Agenda</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.viewToggle, showCalendar && styles.viewToggleActive]}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Ionicons 
              name={showCalendar ? "calendar" : "list"} 
              size={20} 
              color={showCalendar ? "white" : "#64748b"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => {
              setNewEvent({...newEvent, date: selectedDate});
              setShowNewEventModal(true);
            }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Calendar View */}
        {showCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              style={styles.calendar}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#0f172a',
                selectedDayBackgroundColor: '#f97316',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#f97316',
                dayTextColor: '#0f172a',
                textDisabledColor: '#cbd5e1',
                dotColor: '#f97316',
                selectedDotColor: '#ffffff',
                arrowColor: '#f97316',
                monthTextColor: '#0f172a',
                indicatorColor: '#f97316',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
              }}
              markedDates={getMarkedDates()}
              enableSwipeMonths={true}
              hideExtraDays={true}
              firstDay={1} // Maandag als eerste dag
            />
          </View>
        )}

        {/* Selected Date Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>
            {selectedDate ? formatDate(selectedDate) : 'Mijn Afspraken'}
          </Text>
        
        {getEventsForDate(selectedDate).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Geen afspraken</Text>
            <Text style={styles.emptySubtitle}>Druk op + om een afspraak toe te voegen</Text>
          </View>
        ) : (
          getEventsForDate(selectedDate).map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
              <View style={styles.eventTime}>
                <Text style={styles.eventTimeText}>{event.time}</Text>
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => {
                    deleteEvent(event.id);
                    showToast('Afspraak verwijderd', 'info');
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        </View>
      </ScrollView>

      {/* New Event Modal */}
      <Modal
        visible={showNewEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewEventModal(false)}>
              <Text style={styles.cancelButton}>Annuleren</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Nieuwe Afspraak</Text>
            
            <TouchableOpacity onPress={addNewEvent}>
              <Text style={styles.saveButton}>Opslaan</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Titel *</Text>
              <TextInput
                style={styles.input}
                placeholder="Afspraak titel..."
                placeholderTextColor="#94a3b8"
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({...newEvent, title: text})}
                autoFocus
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Tijd</Text>
                <TextInput
                  style={styles.input}
                  placeholder="14:00"
                  placeholderTextColor="#94a3b8"
                  value={newEvent.time}
                  onChangeText={(text) => setNewEvent({...newEvent, time: text})}
                />
              </View>

              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Datum</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Vandaag"
                  placeholderTextColor="#94a3b8"
                  value={newEvent.date}
                  onChangeText={(text) => setNewEvent({...newEvent, date: text})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Beschrijving</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Beschrijving van de afspraak..."
                placeholderTextColor="#94a3b8"
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({...newEvent, description: text})}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggle: {
    backgroundColor: '#f1f5f9',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleActive: {
    backgroundColor: '#f97316',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  addButton: {
    backgroundColor: '#f97316',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calendar: {
    borderRadius: 16,
    paddingBottom: 16,
  },
  eventsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  eventColorBar: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  eventTime: {
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  eventTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316',
  },
  eventDateText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  eventContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
    position: 'relative',
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cancelButton: {
    fontSize: 16,
    color: '#64748b',
  },
  saveButton: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputHalf: {
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
