import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import AIAnalysis from '../components/AIAnalysis';
import VoiceMemo from '../components/VoiceMemo';
import { ExtractedTask, ExtractedReminder, ExtractedEvent } from '../services/AIService';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
// @ts-ignore
import { OPENAI_API_KEY } from '@env';

const { width } = Dimensions.get('window');

interface Note {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesScreen() {
  const { notes, addNote, updateNote, deleteNote, addTask, addReminder, addEvent } = useAppContext();
  const { showToast } = useToast();
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [extractedReminders, setExtractedReminders] = useState<ExtractedReminder[]>([]);
  const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[]>([]);
  
  const richText = useRef<RichEditor>(null);

  const createNewNote = () => {
    // Ga direct naar editor zonder notitie toe te voegen
    setSelectedNote(null);
    setEditorContent('');
    setShowEditor(true);
  };

  const handleVoiceTranscript = (transcript: string) => {
    // Add transcript to editor content
    const currentContent = editorContent || '';
    const newContent = currentContent + (currentContent ? '\n\n' : '') + transcript;
    setEditorContent(newContent);
    
    // Update the rich editor
    if (editorRef.current) {
      editorRef.current.setContentHTML(newContent);
    }
  };

  const generateTitleFromContent = async (content: string): Promise<string> => {
    if (!content.trim()) return 'Lege notitie';
    
    try {
      // Gebruik AI om een titel te genereren
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Je bent een assistent die korte, beschrijvende titels maakt voor notities. Geef alleen de titel terug, geen extra tekst. Maximaal 50 karakters. In het Nederlands.'
            },
            {
              role: 'user',
              content: `Maak een korte titel voor deze notitie: ${content.substring(0, 200)}...`
            }
          ],
          max_tokens: 20,
          temperature: 0.3
        })
      });

      const data = await response.json();
      const generatedTitle = data.choices?.[0]?.message?.content?.trim();
      
      if (generatedTitle && generatedTitle.length > 0) {
        return generatedTitle.substring(0, 50); // Beperk tot 50 karakters
      }
    } catch (error) {
      console.error('Title generation failed:', error);
    }
    
    // Fallback: gebruik eerste woorden van content
    const words = content.trim().split(' ').slice(0, 6).join(' ');
    return words.length > 50 ? words.substring(0, 47) + '...' : words;
  };

  const saveNote = () => {

    richText.current?.getContentHtml().then(async (html) => {
      const plainText = html.replace(/<[^>]*>/g, '').trim();
      
      // Genereer automatisch een titel
      const finalTitle = await generateTitleFromContent(plainText);
      
      if (selectedNote) {
        // Update bestaande notitie
        const updatedNote = { 
          ...selectedNote, 
          title: finalTitle,
          content: plainText, 
          htmlContent: html,
          updatedAt: new Date().toLocaleDateString('nl-NL')
        };
        updateNote(updatedNote);
      } else {
        // Maak nieuwe notitie
        const newNote = {
          id: Date.now().toString(),
          title: finalTitle,
          content: plainText,
          htmlContent: html,
          createdAt: new Date().toLocaleDateString('nl-NL'),
          updatedAt: new Date().toLocaleDateString('nl-NL')
        };
        addNote(newNote);
      }
      
      setShowEditor(false);
      setSelectedNote(null);
      setEditorContent('');
      showToast(`Notitie opgeslagen: "${finalTitle}"`, 'success');
    });
  };

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setEditorContent(note.htmlContent);
    setShowEditor(true);
  };

  const handleDeleteNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    deleteNote(noteId);
    if (selectedNote?.id === noteId) {
      setShowEditor(false);
      setSelectedNote(null);
    }
    showToast(`Notitie "${note?.title || 'Onbekend'}" verwijderd`, 'info');
  };

  const handleTasksExtracted = (tasks: ExtractedTask[]) => {
    tasks.forEach(task => {
      addTask({
        title: task.title,
        completed: false,
        priority: task.priority,
        description: task.description,
        dueDate: task.dueDate,
        category: task.category
      });
    });
    
    if (tasks.length > 0) {
      showToast(`${tasks.length} taak${tasks.length > 1 ? 'en' : ''} toegevoegd!`, 'success');
    }
  };

  const handleRemindersExtracted = (reminders: ExtractedReminder[]) => {
    reminders.forEach(reminder => {
      addReminder({
        title: reminder.title,
        time: reminder.reminderTime || '09:00', // Gebruik reminderTime uit AI service
        description: reminder.description,
        date: reminder.reminderDate // Gebruik reminderDate uit AI service
      });
    });
    
    if (reminders.length > 0) {
      showToast(`${reminders.length} herinnering${reminders.length > 1 ? 'en' : ''} toegevoegd!`, 'success');
    }
  };

  const handleEventsExtracted = (events: ExtractedEvent[]) => {
    events.forEach(event => {
      addEvent({
        title: event.title,
        time: event.time || '10:00', // Fallback tijd
        date: event.date,
        description: event.description || '',
        color: '#f97316' // Default orange color
      });
    });
    
    if (events.length > 0) {
      showToast(`${events.length} afspraak${events.length > 1 ? 'en' : ''} toegevoegd!`, 'success');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notities</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={createNewNote}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Notes List */}
      <ScrollView style={styles.content}>
        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Geen notities</Text>
            <Text style={styles.emptySubtitle}>Maak je eerste notitie aan om te beginnen</Text>
          </View>
        ) : (
          notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <TouchableOpacity 
                style={styles.noteContent}
                onPress={() => openNote(note)}
              >
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.notePreview} numberOfLines={2}>
                  {note.content || 'Lege notitie...'}
                </Text>
                <Text style={styles.noteDate}>
                  Bijgewerkt: {note.updatedAt}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                                    onPress={() => handleDeleteNote(note.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>



      {/* Rich Text Editor Modal */}
      <Modal
        visible={showEditor}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.editorContainer}>
          {/* Editor Header */}
          <View style={styles.editorHeader}>
            <TouchableOpacity 
              onPress={() => setShowEditor(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            
            <Text style={styles.editorTitle} numberOfLines={1}>
              {selectedNote?.title || 'Notitie'}
            </Text>
            
            <TouchableOpacity onPress={saveNote} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Opslaan</Text>
            </TouchableOpacity>
          </View>

          {/* Rich Text Toolbar */}
          <RichToolbar
            editor={richText}
            actions={[
              actions.undo,
              actions.redo,
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.heading1,
              actions.heading2,
              actions.setParagraph,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.alignLeft,
              actions.alignCenter,
              actions.alignRight,
              actions.blockquote,
              actions.code,
              actions.removeFormat,
            ]}
            iconMap={{
              [actions.heading1]: ({ tintColor }: { tintColor: string }) => <Text style={[styles.toolbarText, { color: tintColor }]}>H1</Text>,
              [actions.heading2]: ({ tintColor }: { tintColor: string }) => <Text style={[styles.toolbarText, { color: tintColor }]}>H2</Text>,
              [actions.setParagraph]: ({ tintColor }: { tintColor: string }) => <Text style={[styles.toolbarText, { color: tintColor }]}>P</Text>,
            }}
            style={styles.richToolbar}
            flatContainerStyle={styles.toolbarContainer}
          />

          {/* Rich Text Editor */}
          <VoiceMemo onTranscriptReady={handleVoiceTranscript} />
          
          <RichEditor
            ref={richText}
            style={styles.richEditor}
            placeholder="Begin met typen of gebruik spraak memo..."
            initialContentHTML={editorContent}
            onChange={(content) => setEditorContent(content)}

            initialHeight={300}
            editorStyle={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              contentCSSText: 'font-size: 16px; font-family: System; padding: 16px;',
            }}
          />

          {/* AI Analysis Component */}
          <View style={styles.aiAnalysisContainer}>
            <AIAnalysis
              noteContent={editorContent.replace(/<[^>]*>/g, '').trim()}
              noteTitle={selectedNote?.title || 'Nieuwe Notitie'}
              onTasksExtracted={handleTasksExtracted}
              onRemindersExtracted={handleRemindersExtracted}
              onEventsExtracted={handleEventsExtracted}
            />
          </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noteContent: {
    flex: 1,
    padding: 20,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  notePreview: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 12,
  },
  noteDate: {
    fontSize: 14,
    color: '#94a3b8',
  },
  deleteButton: {
    padding: 20,
    justifyContent: 'center',
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
  createButton: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  editorTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  richToolbar: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  toolbarContainer: {
    paddingHorizontal: 12,
  },
  toolbarText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  richEditor: {
    flex: 1,
    backgroundColor: '#ffffff',
    minHeight: 300,
  },
  aiAnalysisContainer: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
