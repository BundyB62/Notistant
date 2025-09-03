import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AIService, { AIAnalysisResult, ExtractedTask, ExtractedReminder, ExtractedEvent } from '../services/AIService';
import { useToast } from '../context/ToastContext';

interface AIAnalysisProps {
  noteContent: string;
  noteTitle: string;
  onTasksExtracted?: (tasks: ExtractedTask[]) => void;
  onRemindersExtracted?: (reminders: ExtractedReminder[]) => void;
  onEventsExtracted?: (events: ExtractedEvent[]) => void;
}

export default function AIAnalysis({ 
  noteContent, 
  noteTitle, 
  onTasksExtracted, 
  onRemindersExtracted, 
  onEventsExtracted 
}: AIAnalysisProps) {
  const { showToast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const analyzeNote = async () => {
    if (!noteContent.trim()) {
      showToast('De notitie is leeg. Voeg eerst inhoud toe.', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await AIService.analyzeNote(noteContent, noteTitle);
      setAnalysisResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      showToast('AI analyse is mislukt. Probeer het opnieuw.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addTasksToApp = () => {
    if (analysisResult?.tasks && onTasksExtracted) {
      onTasksExtracted(analysisResult.tasks);
      showToast(`${analysisResult.tasks.length} taken toegevoegd!`, 'success');
    }
  };

  const addRemindersToApp = () => {
    if (analysisResult?.reminders && onRemindersExtracted) {
      onRemindersExtracted(analysisResult.reminders);
      showToast(`${analysisResult.reminders.length} herinneringen toegevoegd!`, 'success');
    }
  };

  const addEventsToApp = () => {
    if (analysisResult?.events && onEventsExtracted) {
      onEventsExtracted(analysisResult.events);
      showToast(`${analysisResult.events.length} evenementen toegevoegd!`, 'success');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f97316';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'warning';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      {/* AI Analyze Button */}
      <TouchableOpacity 
        style={[styles.analyzeButton, isAnalyzing && styles.analyzingButton]}
        onPress={analyzeNote}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Ionicons name="sparkles" size={20} color="white" />
        )}
        <Text style={styles.analyzeButtonText}>
          {isAnalyzing ? 'AI analyseert...' : '✨ AI Analyse'}
        </Text>
        {!AIService.isAIAvailable() && (
          <View style={styles.demoTag}>
            <Text style={styles.demoTagText}>DEMO</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* API Key Warning */}
      {!AIService.isAIAvailable() && (
        <View style={styles.warningContainer}>
          <Ionicons name="information-circle" size={16} color="#f97316" />
          <Text style={styles.warningText}>
            Demo modus - Voeg je OpenAI API key toe in .env voor echte AI
          </Text>
        </View>
      )}

      {/* Analysis Results */}
      {showResults && analysisResult && (
        <View style={styles.resultsContainer}>
          {/* Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>AI Analyse Resultaat</Text>
            <Text style={styles.summaryText}>{analysisResult.summary}</Text>
            <View style={styles.confidenceContainer}>
              <Ionicons name="analytics" size={16} color="#64748b" />
              <Text style={styles.confidenceText}>
                Betrouwbaarheid: {Math.round(analysisResult.confidence * 100)}%
              </Text>
            </View>
          </View>

          <ScrollView style={styles.itemsContainer} nestedScrollEnabled>
            {/* Tasks */}
            {analysisResult.tasks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkbox" size={20} color="#f97316" />
                  <Text style={styles.sectionTitle}>Taken ({analysisResult.tasks.length})</Text>
                  <TouchableOpacity style={styles.addAllButton} onPress={() => {
                    console.log('DEBUG: Taken knop gedrukt!');
                    if (analysisResult?.tasks && onTasksExtracted) {
                      console.log('DEBUG: Taken worden toegevoegd:', analysisResult.tasks.length);
                      onTasksExtracted(analysisResult.tasks);
                      console.log('DEBUG: Toast wordt aangeroepen');
                      showToast(`${analysisResult.tasks.length} taken toegevoegd!`, 'success');
                    } else {
                      console.log('DEBUG: Geen taken of callback niet gevonden');
                    }
                  }}>
                    <Text style={styles.addAllText}>+ Alle taken</Text>
                  </TouchableOpacity>
                </View>
                
                {analysisResult.tasks.map((task) => (
                  <View key={task.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Ionicons 
                        name={getPriorityIcon(task.priority)} 
                        size={16} 
                        color={getPriorityColor(task.priority)} 
                      />
                      <Text style={styles.itemTitle}>{task.title}</Text>
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                        <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemDescription}>{task.description}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.metaText}>Categorie: {task.category}</Text>
                      {task.dueDate && <Text style={styles.metaText}>Deadline: {task.dueDate}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Reminders */}
            {analysisResult.reminders.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="alarm" size={20} color="#8b5cf6" />
                  <Text style={styles.sectionTitle}>Herinneringen ({analysisResult.reminders.length})</Text>
                  <TouchableOpacity style={styles.addAllButton} onPress={() => {
                    if (analysisResult?.reminders && onRemindersExtracted) {
                      onRemindersExtracted(analysisResult.reminders);
                      showToast(`${analysisResult.reminders.length} herinneringen toegevoegd!`, 'success');
                    }
                  }}>
                    <Text style={styles.addAllText}>+ Alle herinneringen</Text>
                  </TouchableOpacity>
                </View>
                
                {analysisResult.reminders.map((reminder) => (
                  <View key={reminder.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Ionicons name="alarm-outline" size={16} color="#8b5cf6" />
                      <Text style={styles.itemTitle}>{reminder.title}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: '#8b5cf6' }]}>
                        <Text style={styles.typeText}>{reminder.type.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemDescription}>{reminder.description}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.metaText}>Datum: {reminder.reminderDate}</Text>
                      {reminder.reminderTime && <Text style={styles.metaText}>Tijd: {reminder.reminderTime}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Events */}
            {analysisResult.events.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar" size={20} color="#10b981" />
                  <Text style={styles.sectionTitle}>Agenda Items ({analysisResult.events.length})</Text>
                  <TouchableOpacity style={styles.addAllButton} onPress={() => {
                    if (analysisResult?.events && onEventsExtracted) {
                      onEventsExtracted(analysisResult.events);
                      showToast(`${analysisResult.events.length} evenementen toegevoegd!`, 'success');
                    }
                  }}>
                    <Text style={styles.addAllText}>+ Alle evenementen</Text>
                  </TouchableOpacity>
                </View>
                
                {analysisResult.events.map((event) => (
                  <View key={event.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Ionicons name="calendar-outline" size={16} color="#10b981" />
                      <Text style={styles.itemTitle}>{event.title}</Text>
                    </View>
                    <Text style={styles.itemDescription}>{event.description}</Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.metaText}>Datum: {event.date}</Text>
                      {event.time && <Text style={styles.metaText}>Tijd: {event.time}</Text>}
                      {event.duration && <Text style={styles.metaText}>Duur: {event.duration}</Text>}
                      {event.location && <Text style={styles.metaText}>Locatie: {event.location}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* No Results */}
            {analysisResult.tasks.length === 0 && 
             analysisResult.reminders.length === 0 && 
             analysisResult.events.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color="#cbd5e1" />
                <Text style={styles.noResultsTitle}>Geen items gevonden</Text>
                <Text style={styles.noResultsText}>
                  De AI kon geen taken, herinneringen of agenda-items detecteren in deze notitie.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowResults(false)}
          >
            <Text style={styles.closeButtonText}>Sluiten</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  analyzeButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    position: 'relative',
  },
  analyzingButton: {
    backgroundColor: '#a855f7',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  demoTag: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#f97316',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoTagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    color: '#92400e',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 16,
    maxHeight: 500,
  },
  summaryContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  itemsContainer: {
    maxHeight: 300,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
    flex: 1,
  },
  addAllButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addAllText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  itemCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 11,
    color: '#94a3b8',
    marginRight: 12,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  noResultsText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
});
