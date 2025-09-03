import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarView, CalendarEvent } from '../types';

export default function CalendarScreen() {
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock events voor meerdere weken
  const mockEvents: CalendarEvent[] = [
    // Deze week
    { id: '1', title: 'Team Meeting', startTime: '09:00', endTime: '10:30', date: '2024-01-15', color: '#F97316' },
    { id: '2', title: 'Project Review', startTime: '14:30', endTime: '16:00', date: '2024-01-15', color: '#10B981' },
    { id: '3', title: 'Client Call', startTime: '16:00', endTime: '17:00', date: '2024-01-16', color: '#8B5CF6' },
    { id: '4', title: 'Design Workshop', startTime: '10:00', endTime: '12:00', date: '2024-01-17', color: '#EF4444' },
    { id: '5', title: 'Lunch Meeting', startTime: '12:30', endTime: '13:30', date: '2024-01-18', color: '#F59E0B' },
    
    // Volgende week
    { id: '6', title: 'Sprint Planning', startTime: '09:00', endTime: '11:00', date: '2024-01-22', color: '#3B82F6' },
    { id: '7', title: 'Code Review', startTime: '15:00', endTime: '16:00', date: '2024-01-23', color: '#06B6D4' },
    { id: '8', title: 'Product Demo', startTime: '14:00', endTime: '15:30', date: '2024-01-24', color: '#8B5CF6' },
    
    // Week daarna
    { id: '9', title: 'Quarterly Review', startTime: '10:00', endTime: '12:00', date: '2024-01-29', color: '#EF4444' },
    { id: '10', title: 'Team Building', startTime: '13:00', endTime: '17:00', date: '2024-01-30', color: '#10B981' },
  ];

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
      {/* Header */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-primary">Kalender</Text>
          <TouchableOpacity>
            <Ionicons name="add" size={24} color="#F97316" />
          </TouchableOpacity>
        </View>
        
        {/* View Selector */}
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          {(['day', 'week', 'month', 'year'] as CalendarView[]).map((view) => (
            <TouchableOpacity
              key={view}
              className={`flex-1 py-2 px-3 rounded-md ${
                currentView === view ? 'bg-accent' : ''
              }`}
              onPress={() => setCurrentView(view)}
            >
              <Text className={`text-center text-sm font-medium ${
                currentView === view ? 'text-white' : 'text-primary'
              }`}>
                {view === 'day' ? 'Dag' : view === 'week' ? 'Week' : view === 'month' ? 'Maand' : 'Jaar'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Navigation */}
        <View className="flex-row items-center justify-between mt-3">
          <TouchableOpacity onPress={() => {
            const newDate = new Date(currentDate);
            if (currentView === 'day') newDate.setDate(newDate.getDate() - 1);
            else if (currentView === 'week') newDate.setDate(newDate.getDate() - 7);
            else if (currentView === 'month') newDate.setMonth(newDate.getMonth() - 1);
            else if (currentView === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
            setCurrentDate(newDate);
          }}>
            <Ionicons name="chevron-back" size={20} color="#000" />
          </TouchableOpacity>
          
          <Text className="text-lg font-semibold text-primary">
            {currentView === 'day' 
              ? currentDate.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
              : currentView === 'week'
              ? `Week ${Math.ceil(currentDate.getDate() / 7)} - ${currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`
              : currentView === 'month'
              ? currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
              : currentDate.getFullYear().toString()
            }
          </Text>
          
          <TouchableOpacity onPress={() => {
            const newDate = new Date(currentDate);
            if (currentView === 'day') newDate.setDate(newDate.getDate() + 1);
            else if (currentView === 'week') newDate.setDate(newDate.getDate() + 7);
            else if (currentView === 'month') newDate.setMonth(newDate.getMonth() + 1);
            else if (currentView === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
            setCurrentDate(newDate);
          }}>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Content */}
      {renderCurrentView()}
    </View>
  );
}
