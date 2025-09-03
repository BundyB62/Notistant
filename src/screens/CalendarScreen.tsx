import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarView, CalendarEvent } from '../types';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default function CalendarScreen() {
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Enhanced mock events with more details
  const mockEvents: CalendarEvent[] = useMemo(() => [
    // Deze week
    { id: '1', title: 'Team Meeting', startTime: '09:00', endTime: '10:30', date: '2024-01-15', color: '#f97316', location: 'Vergaderruimte A', attendees: ['John', 'Sarah', 'Mike'], description: 'Weekly team standup en sprint planning' },
    { id: '2', title: 'Project Review', startTime: '14:30', endTime: '16:00', date: '2024-01-15', color: '#10b981', location: 'Online - Zoom', attendees: ['Lisa', 'Tom'], description: 'Q1 project deliverables review' },
    { id: '3', title: 'Client Call', startTime: '16:00', endTime: '17:00', date: '2024-01-16', color: '#8b5cf6', location: 'Online - Teams', attendees: ['Client ABC'], description: 'Requirements gathering sessie' },
    { id: '4', title: 'Design Workshop', startTime: '10:00', endTime: '12:00', date: '2024-01-17', color: '#ef4444', location: 'Design Studio', attendees: ['Design Team'], description: 'UI/UX brainstorm voor nieuwe features' },
    { id: '5', title: 'Lunch Meeting', startTime: '12:30', endTime: '13:30', date: '2024-01-18', color: '#f59e0b', location: 'Restaurant Central', attendees: ['Partner XYZ'], description: 'Business development gesprek' },
    
    // Volgende week
    { id: '6', title: 'Sprint Planning', startTime: '09:00', endTime: '11:00', date: '2024-01-22', color: '#3b82f6', location: 'Vergaderruimte B', attendees: ['Dev Team'], description: 'Sprint 12 planning en backlog refinement' },
    { id: '7', title: 'Code Review', startTime: '15:00', endTime: '16:00', date: '2024-01-23', color: '#06b6d4', location: 'Online', attendees: ['Senior Devs'], description: 'Peer review van nieuwe features' },
    { id: '8', title: 'Product Demo', startTime: '14:00', endTime: '15:30', date: '2024-01-24', color: '#8b5cf6', location: 'Demo Room', attendees: ['Stakeholders'], description: 'Q1 product showcase voor management' },
    
    // Week daarna
    { id: '9', title: 'Quarterly Review', startTime: '10:00', endTime: '12:00', date: '2024-01-29', color: '#ef4444', location: 'Boardroom', attendees: ['Leadership'], description: 'Q1 resultaten en Q2 planning' },
    { id: '10', title: 'Team Building', startTime: '13:00', endTime: '17:00', date: '2024-01-30', color: '#10b981', location: 'Escape Room Utrecht', attendees: ['Hele Team'], description: 'Quarterly team building activiteit' },
  ], []);

  const handleEventPress = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  }, []);

  const handleNewEvent = useCallback(() => {
    setShowNewEventModal(true);
  }, []);

  const handleViewChange = useCallback((view: CalendarView) => {
    setCurrentView(view);
  }, []);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (currentView === 'year') {
      newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  }, [currentDate, currentView]);

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours * 60 + minutes) / 60 * 60; // 60px per hour
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return hours;
  };

  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start op maandag
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    return (hours * 60 + minutes) / 60 * 60; // 60px per hour
  };

  const getEventHeight = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    return duration / 60 * 60; // 60px per hour
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const renderDayView = () => (
    <View className="flex-1">
      <ScrollView ref={scrollViewRef} className="flex-1">
        <View className="relative">
          {/* Uur labels */}
          {generateHours().map((hour, index) => (
            <View key={hour} className="flex-row border-b border-gray-200 h-15">
              <View className="w-16 p-2">
                <Text className="text-xs text-primary/60">{hour}</Text>
              </View>
              <View className="flex-1 relative">
                {/* Events voor deze dag */}
                {mockEvents
                  .filter(event => event.date === formatDate(currentDate))
                  .map(event => (
                    <View
                      key={event.id}
                      className="absolute left-1 right-1 rounded p-1"
                      style={{
                        top: getEventPosition(event.startTime),
                        height: getEventHeight(event.startTime, event.endTime),
                        backgroundColor: event.color + '20',
                        borderLeftWidth: 3,
                        borderLeftColor: event.color,
                      }}
                    >
                      <Text className="text-xs font-medium text-primary">{event.title}</Text>
                      <Text className="text-xs text-primary/60">{event.startTime} - {event.endTime}</Text>
                    </View>
                  ))
                }
              </View>
            </View>
          ))}
          
          {/* Huidige tijd lijn */}
          <View 
            className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
            style={{ top: getCurrentTimePosition() }}
          >
            <View className="absolute left-2 w-2 h-2 bg-red-500 rounded-full -mt-1" />
            <Text className="absolute left-4 -mt-2 text-xs text-red-500 bg-white px-1">
              {getCurrentTime()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <View className="flex-1">
        {/* Dagen header */}
        <View className="flex-row border-b border-gray-200 bg-white">
          <View className="w-16" />
          {weekDays.map((day, index) => (
            <View key={index} className="flex-1 p-2 items-center">
              <Text className="text-xs text-primary/60">
                {day.toLocaleDateString('nl-NL', { weekday: 'short' }).toUpperCase()}
              </Text>
              <Text className="text-sm font-medium text-primary mt-1">
                {day.getDate()}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView ref={scrollViewRef} className="flex-1">
          <View className="relative">
            {/* Uur raster */}
            {generateHours().map((hour, hourIndex) => (
              <View key={hour} className="flex-row border-b border-gray-200 h-15">
                <View className="w-16 p-2">
                  <Text className="text-xs text-primary/60">{hour}</Text>
                </View>
                {weekDays.map((day, dayIndex) => (
                  <View key={dayIndex} className="flex-1 border-r border-gray-100 relative">
                    {/* Events voor deze dag */}
                    {mockEvents
                      .filter(event => event.date === formatDate(day))
                      .map(event => (
                        <View
                          key={event.id}
                          className="absolute left-0 right-0 rounded p-1 mx-0.5"
                          style={{
                            top: getEventPosition(event.startTime),
                            height: getEventHeight(event.startTime, event.endTime),
                            backgroundColor: event.color + '20',
                            borderLeftWidth: 2,
                            borderLeftColor: event.color,
                          }}
                        >
                          <Text className="text-xs font-medium text-primary" numberOfLines={1}>
                            {event.title}
                          </Text>
                          <Text className="text-xs text-primary/60">
                            {event.startTime}
                          </Text>
                        </View>
                      ))
                    }
                  </View>
                ))}
              </View>
            ))}
            
            {/* Huidige tijd lijn - alleen als vandaag in de week zit */}
            {weekDays.some(day => formatDate(day) === formatDate(new Date())) && (
              <View 
                className="absolute left-16 right-0 h-0.5 bg-red-500 z-10"
                style={{ top: getCurrentTimePosition() }}
              >
                <View className="absolute left-2 w-2 h-2 bg-red-500 rounded-full -mt-1" />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderMonthView = () => (
    <View className="flex-1 p-4">
      <Text className="text-center text-primary/60">Maand weergave - Coming Soon</Text>
    </View>
  );

  const renderYearView = () => (
    <View className="flex-1 p-4">
      <Text className="text-center text-primary/60">Jaar weergave - Coming Soon</Text>
    </View>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      case 'year':
        return renderYearView();
      default:
        return renderWeekView();
    }
  };

  // Scroll naar huidige tijd bij laden
  useEffect(() => {
    if ((currentView === 'day' || currentView === 'week') && scrollViewRef.current) {
      setTimeout(() => {
        const currentTimePosition = getCurrentTimePosition();
        scrollViewRef.current?.scrollTo({ y: Math.max(0, currentTimePosition - 200), animated: true });
      }, 100);
    }
  }, [currentView]);

  return (
    <View className="flex-1 bg-background">
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        className="px-6 pt-4 pb-6 border-b border-background-muted"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-3xl font-bold text-text-primary">Kalender</Text>
            <Text className="text-text-secondary mt-1">
              {currentView === 'day' && 'Dagweergave'}
              {currentView === 'week' && 'Weekweergave'}
              {currentView === 'month' && 'Maandweergave'}
              {currentView === 'year' && 'Jaarweergave'}
            </Text>
          </View>
          
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="bg-background-secondary p-3 rounded-xl">
              <Ionicons name="search" size={20} color="#64748b" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-accent p-3 rounded-xl shadow-soft"
              onPress={handleNewEvent}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Enhanced View Selector */}
        <View className="bg-background-secondary rounded-xl p-1 mb-4">
          <View className="flex-row">
            {(['day', 'week', 'month'] as CalendarView[]).map((view) => (
              <TouchableOpacity
                key={view}
                className={`flex-1 py-3 px-4 rounded-lg ${
                  currentView === view ? 'bg-accent shadow-soft' : ''
                }`}
                onPress={() => handleViewChange(view)}
              >
                <Text className={`text-center text-sm font-semibold ${
                  currentView === view ? 'text-white' : 'text-text-secondary'
                }`}>
                  {view === 'day' ? 'Dag' : view === 'week' ? 'Week' : 'Maand'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Enhanced Date Navigation */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            className="bg-white p-3 rounded-xl shadow-soft"
            onPress={() => navigateDate('prev')}
          >
            <Ionicons name="chevron-back" size={20} color="#0f172a" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-1 mx-4">
            <Text className="text-xl font-bold text-text-primary text-center">
              {currentView === 'day' 
                ? currentDate.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
                : currentView === 'week'
                ? `Week ${Math.ceil(currentDate.getDate() / 7)} - ${currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`
                : currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
              }
            </Text>
            <Text className="text-sm text-text-secondary text-center mt-1">
              {currentView === 'day' && currentDate.toLocaleDateString('nl-NL', { year: 'numeric' })}
              {currentView === 'week' && `${Math.ceil(currentDate.getDate() / 7)} van 52 weken`}
              {currentView === 'month' && `${currentDate.getDate()} dagen`}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-white p-3 rounded-xl shadow-soft"
            onPress={() => navigateDate('next')}
          >
            <Ionicons name="chevron-forward" size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Calendar Content */}
      {renderCurrentView()}
      
      {/* New Event Modal */}
      <Modal
        visible={showNewEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background">
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            className="px-6 py-4 border-b border-background-muted"
          >
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowNewEventModal(false)}>
                <Text className="text-accent font-semibold">Annuleren</Text>
              </TouchableOpacity>
              
              <Text className="text-xl font-bold text-text-primary">Nieuwe Afspraak</Text>
              
              <TouchableOpacity onPress={() => {
                setShowNewEventModal(false);
                Alert.alert('Opgeslagen', 'Je afspraak is toegevoegd aan de kalender.');
              }}>
                <Text className="text-accent font-semibold">Opslaan</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
          
          <ScrollView className="flex-1 px-6 py-4 space-y-4">
            <View>
              <Text className="text-sm font-semibold text-text-secondary mb-2">TITEL</Text>
              <TextInput
                className="input-field"
                placeholder="Afspraak titel..."
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <View>
              <Text className="text-sm font-semibold text-text-secondary mb-2">BESCHRIJVING</Text>
              <TextInput
                className="input-field h-24"
                placeholder="Beschrijving (optioneel)..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
              />
            </View>
            
            <View>
              <Text className="text-sm font-semibold text-text-secondary mb-2">LOCATIE</Text>
              <TextInput
                className="input-field"
                placeholder="Locatie..."
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text-secondary mb-2">STARTTIJD</Text>
                <TouchableOpacity className="input-field flex-row items-center justify-between">
                  <Text className="text-text-primary">09:00</Text>
                  <Ionicons name="time-outline" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text-secondary mb-2">EINDTIJD</Text>
                <TouchableOpacity className="input-field flex-row items-center justify-between">
                  <Text className="text-text-primary">10:00</Text>
                  <Ionicons name="time-outline" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View>
              <Text className="text-sm font-semibold text-text-secondary mb-2">KLEUR</Text>
              <View className="flex-row space-x-3">
                {['#f97316', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#3b82f6'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    className="w-10 h-10 rounded-xl border-2 border-white shadow-soft"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      
      {/* Event Details Modal */}
      <Modal
        visible={showEventDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedEvent && (
          <View className="flex-1 bg-background">
            <LinearGradient
              colors={[selectedEvent.color + '20', selectedEvent.color + '10']}
              className="px-6 py-4 border-b border-background-muted"
            >
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={() => setShowEventDetails(false)}>
                  <Ionicons name="close" size={24} color="#0f172a" />
                </TouchableOpacity>
                
                <View className="flex-row space-x-3">
                  <TouchableOpacity className="bg-white/80 px-4 py-2 rounded-xl">
                    <Text className="font-semibold text-text-primary">Bewerken</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="bg-red-500 px-4 py-2 rounded-xl">
                    <Text className="font-semibold text-white">Verwijderen</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text className="text-2xl font-bold text-text-primary mb-2">
                {selectedEvent.title}
              </Text>
              
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text className="text-text-secondary ml-2">
                  {selectedEvent.startTime} - {selectedEvent.endTime}
                </Text>
              </View>
            </LinearGradient>
            
            <ScrollView className="flex-1 px-6 py-4 space-y-6">
              {selectedEvent.description && (
                <View>
                  <Text className="text-sm font-semibold text-text-secondary mb-2">BESCHRIJVING</Text>
                  <Text className="text-text-primary">{selectedEvent.description}</Text>
                </View>
              )}
              
              {selectedEvent.location && (
                <View>
                  <Text className="text-sm font-semibold text-text-secondary mb-2">LOCATIE</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={20} color="#64748b" />
                    <Text className="text-text-primary ml-2">{selectedEvent.location}</Text>
                  </View>
                </View>
              )}
              
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <View>
                  <Text className="text-sm font-semibold text-text-secondary mb-2">DEELNEMERS</Text>
                  <View className="space-y-2">
                    {selectedEvent.attendees.map((attendee, index) => (
                      <View key={index} className="flex-row items-center">
                        <View className="w-8 h-8 bg-accent/20 rounded-full items-center justify-center">
                          <Text className="text-accent font-semibold text-sm">
                            {attendee.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text className="text-text-primary ml-3">{attendee}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}
