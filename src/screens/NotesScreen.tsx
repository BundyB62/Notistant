import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotesScreen() {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [showAIPreview, setShowAIPreview] = useState(false);

  const notes = [
    { id: '1', title: 'Project Planning', content: 'Nieuwe app features:\n- Dashboard improvements\n- Calendar integration\n- AI-powered suggestions', updatedAt: '2024-01-15' },
    { id: '2', title: 'Meeting Notes', content: 'Team standup notes:\n- Sprint review completed\n- Next milestone: Q2 release\n- Resource allocation discussion', updatedAt: '2024-01-14' },
    { id: '3', title: 'Ideas', content: 'Random thoughts:\n- Voice notes feature\n- Dark mode implementation\n- Collaboration tools', updatedAt: '2024-01-13' },
  ];

  const aiSuggestion = "AI Suggestie: Overweeg om je project planning op te splitsen in kleinere, uitvoerbare taken. Voeg deadlines toe voor betere voortgangscontrole.";

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row h-full">
        {/* Notes List */}
        <View className="w-1/3 bg-white border-r border-gray-200">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-primary">Notities</Text>
            <TouchableOpacity className="mt-2 bg-accent rounded-lg p-2 items-center">
              <Ionicons name="add" size={16} color="white" />
              <Text className="text-white text-sm font-medium">Nieuwe Notitie</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {notes.map((note) => (
              <TouchableOpacity
                key={note.id}
                className={`p-3 border-b border-gray-100 ${
                  selectedNote === note.id ? 'bg-accent/10' : ''
                }`}
                onPress={() => {
                  setSelectedNote(note.id);
                  setNoteContent(note.content);
                }}
              >
                <Text className="font-medium text-primary">{note.title}</Text>
                <Text className="text-sm text-primary/60 mt-1" numberOfLines={2}>
                  {note.content}
                </Text>
                <Text className="text-xs text-primary/40 mt-2">{note.updatedAt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Editor */}
        <View className="flex-1">
          {selectedNote ? (
            <View className="flex-1">
              {/* Editor Header */}
              <View className="p-4 bg-white border-b border-gray-200 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-primary">
                  {notes.find(n => n.id === selectedNote)?.title}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAIPreview(!showAIPreview)}
                  className={`px-3 py-1 rounded-full ${
                    showAIPreview ? 'bg-accent' : 'bg-gray-200'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    showAIPreview ? 'text-white' : 'text-primary'
                  }`}>
                    AI Preview
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Editor Content */}
              <View className="flex-1 p-4">
                <TextInput
                  className="flex-1 text-primary text-base"
                  value={noteContent}
                  onChangeText={setNoteContent}
                  multiline
                  textAlignVertical="top"
                  placeholder="Begin met typen..."
                  placeholderTextColor="#666"
                />
              </View>

              {/* AI Preview */}
              {showAIPreview && (
                <View className="bg-orange-50 border-t border-accent p-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="bulb" size={16} color="#F97316" />
                    <Text className="text-accent font-medium ml-2">AI Assistent</Text>
                  </View>
                  <Text className="text-primary/80 text-sm">{aiSuggestion}</Text>
                  <TouchableOpacity className="mt-2 bg-accent rounded-lg p-2 self-start">
                    <Text className="text-white text-sm font-medium">Toepassen</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text className="text-primary/60 mt-2">Selecteer een notitie om te bewerken</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
