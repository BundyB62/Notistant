import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  dueDate?: string;
  category?: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  description?: string;
  date?: string;
}

export interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
  color: string;
  description?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface AppContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  
  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  deleteReminder: (reminderId: string) => void;
  
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  deleteEvent: (eventId: string) => void;
  
  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Initial data
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Project presentatie afmaken', completed: false, priority: 'high' },
    { id: '2', title: 'Team meeting voorbereiden', completed: false, priority: 'medium' },
    { id: '3', title: 'Email beantwoorden', completed: true, priority: 'low' },
    { id: '4', title: 'Design mockups reviewen', completed: false, priority: 'medium' },
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', title: 'Doktersafspraak', time: 'Morgen 14:00' },
    { id: '2', title: 'Verjaardag Maria', time: 'Vrijdag' },
    { id: '3', title: 'Auto APK', time: 'Volgende week' },
  ]);

  const [events, setEvents] = useState<Event[]>([
    { id: '1', title: 'Team Meeting', time: '09:00', date: today, color: '#f97316' },
    { id: '2', title: 'Project Review', time: '14:30', date: today, color: '#10b981' },
    { id: '3', title: 'Client Call', time: '16:00', date: tomorrow, color: '#8b5cf6' },
  ]);

  const [notes, setNotes] = useState<Note[]>([
    { 
      id: '1', 
      title: 'Project Ideas', 
      content: 'New mobile app concept...', 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    { 
      id: '2', 
      title: 'Meeting Notes', 
      content: 'Discussed quarterly goals...', 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  ]);

  // Task functions
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Reminder functions
  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const deleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
  };

  // Event functions
  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  // Note functions
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    setNotes(prev => [...prev, newNote]);
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const value: AppContextType = {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    reminders,
    addReminder,
    deleteReminder,
    events,
    addEvent,
    deleteEvent,
    notes,
    addNote,
    updateNote,
    deleteNote,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
