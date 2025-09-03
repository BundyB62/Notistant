import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useToast } from '../context/ToastContext';

interface VoiceMemoProps {
  onTranscriptReady: (transcript: string) => void;
}

export default function VoiceMemo({ onTranscriptReady }: VoiceMemoProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microfoon Toestemming',
            message: 'Deze app heeft toegang tot je microfoon nodig voor spraakmemo\'s.',
            buttonNeutral: 'Vraag Later',
            buttonNegative: 'Weigeren',
            buttonPositive: 'Toestaan',
          }
        );
        console.log('Android permission result:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Android permission error:', err);
        return false;
      }
    } else {
      // iOS - use Expo Audio permissions
      const permission = await Audio.requestPermissionsAsync();
      return permission.status === 'granted';
    }
  };

  const startRecording = async () => {
    try {
      console.log('Requesting permissions...');
      const hasPermission = await requestMicrophonePermission();
      
      if (!hasPermission) {
        showToast('Microfoon toegang is nodig voor spraakopname', 'error');
        return;
      }

      console.log('Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      showToast('Opname gestart! 🎤', 'info');

    } catch (error) {
      console.error('Failed to start recording:', error);
      showToast('Fout bij starten opname', 'error');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      console.log('Stopping recording...');
      setIsRecording(false);
      setIsProcessing(true);
      
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      console.log('Recording stopped, URI:', uri);
      showToast('Opname gestopt. Aan het transcriberen...', 'info');

      // Simulate transcription (in real app, you'd use a speech-to-text service)
      setTimeout(() => {
        const mockTranscript = generateMockTranscript();
        onTranscriptReady(mockTranscript);
        setIsProcessing(false);
        showToast('Transcript toegevoegd aan notitie!', 'success');
      }, 2000);

    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
      showToast('Fout bij stoppen opname', 'error');
    }
  };

  const generateMockTranscript = (): string => {
    const mockTranscripts = [
      "Ik moet morgen om 14:00 naar de dokter voor een controle afspraak. Belangrijk om niet te vergeten!",
      "Vergadering met het team om 10:00. Agenda punten: project status, budget bespreking en planning volgende week.",
      "Boodschappen doen: melk, brood, eieren en groenten. Ook tandpasta niet vergeten bij de drogist.",
      "Herinnering: verjaardag van mama volgende week zondag. Cadeau bedenken en kaartje kopen.",
      "Meeting notes: nieuwe functionaliteiten besproken, deadline is eind van de maand. Follow-up meeting vrijdag."
    ];
    
    return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
          isProcessing && styles.recordButtonProcessing
        ]}
        onPress={handlePress}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Ionicons name="hourglass-outline" size={24} color="white" />
        ) : isRecording ? (
          <Ionicons name="stop" size={24} color="white" />
        ) : (
          <Ionicons name="mic" size={24} color="white" />
        )}
      </TouchableOpacity>
      
      <View style={styles.info}>
        <Text style={styles.label}>
          {isProcessing ? 'Transcriberen...' : isRecording ? 'Opname actief' : 'Spraak memo'}
        </Text>
        {isRecording && (
          <Text style={styles.duration}>{formatDuration(recordingDuration)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginVertical: 8,
  },
  recordButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordButtonActive: {
    backgroundColor: '#ef4444',
  },
  recordButtonProcessing: {
    backgroundColor: '#f97316',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  duration: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
  },
});
