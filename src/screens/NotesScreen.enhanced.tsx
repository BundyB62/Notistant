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
  const [notes, setNotes] = useState<Note[]>([
    { 
      id: '1', 
      title: 'Welkom bij Notistant', 
      content: 'Dit is je eerste notitie! Je kunt nu rich text editing gebruiken.',
      htmlContent: '<p>Dit is je eerste notitie! Je kunt nu <strong>rich text editing</strong> gebruiken.</p>',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    { 
      id: '2', 
      title: 'Projectideeën', 
      content: 'Nieuwe features voor de app...',
      htmlContent: '<h2>Nieuwe features voor de app</h2><ul><li>Voice notes</li><li>Collaboration</li><li>Export functie</li></ul>',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-14'
    },
  ]);
  
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  
  const richText = useRef<RichEditor>(null);

  const createNewNote = () => {
    if (!newNoteTitle.trim()) {
      Alert.alert('Fout', 'Voer een titel in voor je notitie');
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: '',
      htmlContent: '',
      createdAt: new Date().toLocaleDateString('nl-NL'),
      updatedAt: new Date().toLocaleDateString('nl-NL')
    };

    setNotes([newNote, ...notes]);
    setNewNoteTitle('');
    setShowNewNoteModal(false);
    setSelectedNote(newNote);
    setEditorContent('');
    setShowEditor(true);
  };

  const saveNote = () => {
    if (!selectedNote) return;

    richText.current?.getContentHtml().then((html) => {
      const plainText = html.replace(/<[^>]*>/g, '').trim();
      
      const updatedNotes = notes.map(note => 
        note.id === selectedNote.id 
          ? { 
              ...note, 
              content: plainText, 
              htmlContent: html,
              updatedAt: new Date().toLocaleDateString('nl-NL')
            }
          : note
      );
      
      setNotes(updatedNotes);
      setShowEditor(false);
      setSelectedNote(null);
      Alert.alert('Opgeslagen', 'Je notitie is succesvol opgeslagen!');
    });
  };

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setEditorContent(note.htmlContent);
    setShowEditor(true);
  };

  const deleteNote = (noteId: string) => {
    Alert.alert(
      'Notitie verwijderen',
      'Weet je zeker dat je deze notitie wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Verwijderen', 
          style: 'destructive',
          onPress: () => {
            setNotes(notes.filter(note => note.id !== noteId));
            if (selectedNote?.id === noteId) {
              setShowEditor(false);
              setSelectedNote(null);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notities</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowNewNoteModal(true)}
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
                onPress={() => deleteNote(note.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* New Note Modal */}
      <Modal
        visible={showNewNoteModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewNoteModal(false)}>
              <Text style={styles.cancelButton}>Annuleren</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Nieuwe Notitie</Text>
            
            <TouchableOpacity onPress={createNewNote}>
              <Text style={styles.createButton}>Maken</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              style={styles.titleInput}
              placeholder="Titel van je notitie..."
              placeholderTextColor="#94a3b8"
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
              autoFocus
            />
          </View>
        </SafeAreaView>
      </Modal>

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
              [actions.heading1]: ({ tintColor }) => <Text style={[styles.toolbarText, { color: tintColor }]}>H1</Text>,
              [actions.heading2]: ({ tintColor }) => <Text style={[styles.toolbarText, { color: tintColor }]}>H2</Text>,
              [actions.setParagraph]: ({ tintColor }) => <Text style={[styles.toolbarText, { color: tintColor }]}>P</Text>,
            }}
            style={styles.richToolbar}
            flatContainerStyle={styles.toolbarContainer}
          />

          {/* Rich Text Editor */}
          <RichEditor
            ref={richText}
            style={styles.richEditor}
            placeholder="Begin met typen..."
            initialContentHTML={editorContent}
            onChange={(content) => setEditorContent(content)}
            androidHardwareAccelerationDisabled={true}
            initialHeight={400}
            editorStyle={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: 16,
              fontFamily: 'System',
              padding: 16,
            }}
          />
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
  },
});
