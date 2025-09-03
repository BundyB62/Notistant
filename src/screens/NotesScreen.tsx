import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, Dimensions, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  wordCount: number;
}

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function NotesScreen() {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const notes: Note[] = useMemo(() => [
    { 
      id: '1', 
      title: 'Project Planning', 
      content: 'Nieuwe app features:\n\n- Dashboard improvements met real-time data\n- Calendar integration met Google/Outlook\n- AI-powered suggestions voor productiviteit\n- Voice notes met transcriptie\n- Collaboration tools voor teams\n\nTimeline: Q2 2024\nBudget: €50,000\nTeam: 5 developers', 
      updatedAt: '2u geleden',
      category: 'work',
      priority: 'high',
      tags: ['project', 'planning', 'features'],
      wordCount: 45
    },
    { 
      id: '2', 
      title: 'Meeting Notes - Sprint Review', 
      content: 'Team standup notes:\n\n✅ Sprint review completed\n✅ User testing feedback incorporated\n🔄 Next milestone: Q2 release\n📋 Resource allocation discussion\n\nAction items:\n- Update design system\n- Performance optimizations\n- Security audit\n\nAttendees: John, Sarah, Mike, Lisa', 
      updatedAt: '5u geleden',
      category: 'work',
      priority: 'medium',
      tags: ['meeting', 'sprint', 'review'],
      wordCount: 52
    },
    { 
      id: '3', 
      title: 'Creative Ideas', 
      content: 'Random thoughts en inspiratie:\n\n💡 Voice notes feature met AI transcriptie\n🎨 Dark mode implementation\n👥 Collaboration tools voor real-time editing\n📱 Mobile-first responsive design\n🔔 Smart notifications systeem\n\nResearch needed:\n- Voice recognition APIs\n- Real-time collaboration frameworks\n- Push notification services', 
      updatedAt: '1d geleden',
      category: 'personal',
      priority: 'low',
      tags: ['ideas', 'features', 'brainstorm'],
      wordCount: 67
    },
    {
      id: '4',
      title: 'Grocery List',
      content: 'Boodschappenlijst voor deze week:\n\n🥬 Groenten:\n- Broccoli\n- Wortelen\n- Paprika (rood/geel)\n\n🥩 Vlees/Vis:\n- Kippendijen\n- Zalm filet\n\n🥛 Zuivel:\n- Melk (halfvol)\n- Griekse yoghurt\n- Kaas (jong belegen)\n\n🍞 Brood/Granen:\n- Volkoren brood\n- Havermout',
      updatedAt: '3d geleden',
      category: 'personal',
      priority: 'medium',
      tags: ['shopping', 'food', 'weekly'],
      wordCount: 58
    }
  ], []);

  const categories = useMemo(() => [
    { id: 'all', name: 'Alle', icon: 'grid-outline', count: notes.length },
    { id: 'work', name: 'Werk', icon: 'briefcase-outline', count: notes.filter(n => n.category === 'work').length },
    { id: 'personal', name: 'Persoonlijk', icon: 'person-outline', count: notes.filter(n => n.category === 'personal').length },
  ], [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [notes, searchQuery, selectedCategory]);

  const aiSuggestions = useMemo(() => {
    const currentNote = notes.find(n => n.id === selectedNote);
    if (!currentNote) return [];
    
    const suggestions = [
      {
        type: 'structure',
        title: 'Structuur Verbetering',
        description: 'Voeg headers en bullet points toe voor betere leesbaarheid.',
        action: 'apply_structure'
      },
      {
        type: 'tasks',
        title: 'Taken Extractie',
        description: 'Converteer items naar actionable taken met deadlines.',
        action: 'extract_tasks'
      },
      {
        type: 'summary',
        title: 'Samenvatting',
        description: 'Genereer een korte samenvatting van de hoofdpunten.',
        action: 'create_summary'
      }
    ];
    
    return suggestions;
  }, [selectedNote, notes]);

  const handleNewNote = useCallback(() => {
    setShowNewNoteModal(true);
  }, []);

  const handleSelectNote = useCallback((noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setSelectedNote(noteId);
      setNoteContent(note.content);
      setIsEditing(false);
    }
  }, [notes]);

  const handleSaveNote = useCallback(() => {
    if (selectedNote && noteContent !== notes.find(n => n.id === selectedNote)?.content) {
      // Here you would typically save to your backend/storage
      Alert.alert('Opgeslagen', 'Je notitie is succesvol opgeslagen.');
      setIsEditing(false);
    }
  }, [selectedNote, noteContent, notes]);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }, []);

  const formatUpdatedAt = useCallback((updatedAt: string) => {
    // Simple formatting - in real app you'd use a proper date library
    return updatedAt;
  }, []);

  return (
    <View className="flex-1 bg-background">
      <View className={`flex-row h-full ${isTablet ? '' : 'flex-col'}`}>
        {/* Notes List */}
        <View className={`${isTablet ? 'w-1/3' : 'flex-1'} bg-white ${isTablet ? 'border-r border-background-muted' : ''}`}>
          {/* Header */}
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            className="px-6 pt-4 pb-6 border-b border-background-muted"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-text-primary">Notities</Text>
              <TouchableOpacity 
                className="bg-accent p-2 rounded-xl shadow-soft"
                onPress={handleNewNote}
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Search */}
            <View className="bg-background-secondary rounded-xl px-4 py-3 flex-row items-center mb-4">
              <Ionicons name="search" size={20} color="#64748b" />
              <TextInput
                className="flex-1 ml-3 text-text-primary"
                placeholder="Zoek in notities..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`px-4 py-2 rounded-xl flex-row items-center ${
                      selectedCategory === category.id ? 'bg-accent' : 'bg-background-secondary'
                    }`}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={16} 
                      color={selectedCategory === category.id ? 'white' : '#64748b'} 
                    />
                    <Text className={`ml-2 font-medium ${
                      selectedCategory === category.id ? 'text-white' : 'text-text-secondary'
                    }`}>
                      {category.name} ({category.count})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </LinearGradient>
          
          {/* Notes List */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredNotes.map((note) => (
              <TouchableOpacity
                key={note.id}
                className={`p-4 border-b border-background-muted ${
                  selectedNote === note.id ? 'bg-accent/5 border-l-4 border-l-accent' : ''
                }`}
                onPress={() => handleSelectNote(note.id)}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="font-semibold text-text-primary flex-1" numberOfLines={1}>
                    {note.title}
                  </Text>
                  <View 
                    className="w-2 h-2 rounded-full ml-2 mt-1"
                    style={{ backgroundColor: getPriorityColor(note.priority) }}
                  />
                </View>
                
                <Text className="text-sm text-text-secondary mb-3" numberOfLines={3}>
                  {note.content.replace(/\n/g, ' ')}
                </Text>
                
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-text-muted">
                    {formatUpdatedAt(note.updatedAt)} • {note.wordCount} woorden
                  </Text>
                  
                  <View className="flex-row space-x-1">
                    {note.tags.slice(0, 2).map((tag) => (
                      <View key={tag} className="bg-background-secondary px-2 py-1 rounded">
                        <Text className="text-xs text-text-secondary">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {filteredNotes.length === 0 && (
              <View className="flex-1 items-center justify-center p-8">
                <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
                <Text className="text-text-muted mt-4 text-center">
                  {searchQuery ? 'Geen notities gevonden voor je zoekopdracht' : 'Geen notities in deze categorie'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Editor - Only show on tablet or when note is selected on mobile */}
        {(isTablet || selectedNote) && (
          <View className={`${isTablet ? 'flex-1' : 'flex-1'}`}>
            {selectedNote ? (
              <View className="flex-1">
                {/* Editor Header */}
                <View className="bg-white border-b border-background-muted px-6 py-4">
                  <View className="flex-row items-center justify-between mb-3">
                    {!isTablet && (
                      <TouchableOpacity 
                        onPress={() => setSelectedNote(null)}
                        className="mr-3 p-1"
                      >
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                      </TouchableOpacity>
                    )}
                    
                    <Text className="text-xl font-bold text-text-primary flex-1" numberOfLines={1}>
                      {notes.find(n => n.id === selectedNote)?.title}
                    </Text>
                    
                    <View className="flex-row items-center space-x-2">
                      <TouchableOpacity
                        onPress={() => setIsEditing(!isEditing)}
                        className={`px-3 py-2 rounded-lg ${
                          isEditing ? 'bg-accent' : 'bg-background-secondary'
                        }`}
                      >
                        <Text className={`text-sm font-medium ${
                          isEditing ? 'text-white' : 'text-text-secondary'
                        }`}>
                          {isEditing ? 'Lezen' : 'Bewerken'}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => setShowAIPreview(!showAIPreview)}
                        className={`px-3 py-2 rounded-lg ${
                          showAIPreview ? 'bg-accent' : 'bg-background-secondary'
                        }`}
                      >
                        <Ionicons 
                          name="bulb-outline" 
                          size={16} 
                          color={showAIPreview ? 'white' : '#64748b'} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Note Meta Info */}
                  <View className="flex-row items-center space-x-4">
                    <Text className="text-sm text-text-secondary">
                      {notes.find(n => n.id === selectedNote)?.updatedAt}
                    </Text>
                    <Text className="text-sm text-text-secondary">
                      {notes.find(n => n.id === selectedNote)?.wordCount} woorden
                    </Text>
                    <View 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getPriorityColor(notes.find(n => n.id === selectedNote)?.priority || 'low') }}
                    />
                  </View>
                  
                  {/* Save Button - only show when editing */}
                  {isEditing && (
                    <TouchableOpacity 
                      className="btn-primary self-end mt-3"
                      onPress={handleSaveNote}
                    >
                      <Text className="text-white font-semibold">Opslaan</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Editor Content */}
                <View className="flex-1">
                  <ScrollView className="flex-1 px-6 py-4">
                    <TextInput
                      className="text-text-primary text-base leading-6 min-h-full"
                      value={noteContent}
                      onChangeText={(text) => {
                        setNoteContent(text);
                        if (!isEditing) setIsEditing(true);
                      }}
                      multiline
                      textAlignVertical="top"
                      placeholder="Begin met typen..."
                      placeholderTextColor="#94a3b8"
                      editable={isEditing}
                      style={{
                        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
                        fontSize: 16,
                        lineHeight: 24,
                      }}
                    />
                  </ScrollView>
                </View>

                {/* AI Preview Panel */}
                {showAIPreview && (
                  <View className="bg-gradient-to-r from-orange-50 to-orange-100 border-t border-accent/20 p-6">
                    <View className="flex-row items-center mb-4">
                      <View className="bg-accent/20 p-2 rounded-lg">
                        <Ionicons name="bulb" size={20} color="#f97316" />
                      </View>
                      <Text className="text-accent font-bold ml-3 text-lg">AI Assistent</Text>
                    </View>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row space-x-3">
                        {aiSuggestions.map((suggestion, index) => (
                          <TouchableOpacity
                            key={index}
                            className="bg-white rounded-xl p-4 border border-accent/20 min-w-64"
                            onPress={() => console.log('Apply suggestion:', suggestion.action)}
                          >
                            <Text className="font-semibold text-text-primary mb-2">
                              {suggestion.title}
                            </Text>
                            <Text className="text-sm text-text-secondary mb-3">
                              {suggestion.description}
                            </Text>
                            <View className="bg-accent px-3 py-1 rounded-lg self-start">
                              <Text className="text-white text-xs font-medium">Toepassen</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}
              </View>
            ) : (
              <View className="flex-1 items-center justify-center bg-background-secondary/30">
                <View className="items-center">
                  <View className="bg-white p-6 rounded-full shadow-soft mb-4">
                    <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
                  </View>
                  <Text className="text-text-primary font-semibold text-lg mb-2">
                    Selecteer een notitie
                  </Text>
                  <Text className="text-text-muted text-center max-w-sm">
                    Kies een notitie uit de lijst om te bekijken en bewerken, of maak een nieuwe notitie aan.
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* New Note Modal */}
      <Modal
        visible={showNewNoteModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background">
          <View className="bg-white border-b border-background-muted px-6 py-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowNewNoteModal(false)}>
                <Text className="text-accent font-medium">Annuleren</Text>
              </TouchableOpacity>
              
              <Text className="text-lg font-bold text-text-primary">Nieuwe Notitie</Text>
              
              <TouchableOpacity onPress={() => setShowNewNoteModal(false)}>
                <Text className="text-accent font-medium">Opslaan</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="flex-1 p-6">
            <TextInput
              className="input-field mb-4"
              placeholder="Titel van je notitie..."
              placeholderTextColor="#94a3b8"
            />
            
            <TextInput
              className="flex-1 bg-background-secondary border border-background-muted rounded-xl px-4 py-3 text-text-primary"
              placeholder="Begin met typen..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
