import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

// Types voor AI extracted items
export interface ExtractedTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category: string;
}

export interface ExtractedReminder {
  id: string;
  title: string;
  description: string;
  reminderDate: string;
  reminderTime?: string;
  type: 'once' | 'daily' | 'weekly' | 'monthly';
}

export interface ExtractedEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  duration?: string;
  location?: string;
  attendees?: string[];
}

export interface AIAnalysisResult {
  tasks: ExtractedTask[];
  reminders: ExtractedReminder[];
  events: ExtractedEvent[];
  summary: string;
  confidence: number;
}

class AIService {
  private openai: OpenAI;

  constructor() {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.warn('⚠️ OpenAI API key not configured. Please add your API key to .env file');
    }
    
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY || 'demo-key',
    });
  }

  async analyzeNote(noteContent: string, noteTitle: string): Promise<AIAnalysisResult> {
    try {
      // Als er geen API key is, gebruik demo data
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
        return this.getDemoAnalysis(noteContent, noteTitle);
      }

      const prompt = this.buildAnalysisPrompt(noteContent, noteTitle);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // Goedkoper dan gpt-4
        messages: [
          {
            role: "system",
            content: "Je bent een AI assistent die notities analyseert en er taken, herinneringen en agenda-items uit extraheert. Antwoord altijd in het Nederlands en in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Geen response van OpenAI ontvangen');
      }

      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      
      // Fallback naar demo analysis bij fout
      return this.getDemoAnalysis(noteContent, noteTitle);
    }
  }

  private buildAnalysisPrompt(noteContent: string, noteTitle: string): string {
    return `
Analyseer de volgende notitie en extraheer alle mogelijke taken, herinneringen en agenda-items.

NOTITIE TITEL: "${noteTitle}"
NOTITIE INHOUD: "${noteContent}"

Zoek naar:
- TAKEN: Dingen die gedaan moeten worden (acties, to-do's, projecten)
- HERINNERINGEN: Dingen om te onthouden (deadlines, belangrijke data, follow-ups)
- AGENDA ITEMS: Afspraken, meetings, evenementen met specifieke data/tijden

Geef je antwoord in dit EXACTE JSON format:
{
  "tasks": [
    {
      "id": "task_1",
      "title": "Korte titel",
      "description": "Gedetailleerde beschrijving",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD of null",
      "category": "werk|persoonlijk|studie|overig"
    }
  ],
  "reminders": [
    {
      "id": "reminder_1",
      "title": "Herinnering titel",
      "description": "Wat te onthouden",
      "reminderDate": "YYYY-MM-DD",
      "reminderTime": "HH:MM of null",
      "type": "once|daily|weekly|monthly"
    }
  ],
  "events": [
    {
      "id": "event_1",
      "title": "Event naam",
      "description": "Event beschrijving",
      "date": "YYYY-MM-DD",
      "time": "HH:MM of null",
      "duration": "X uur of null",
      "location": "Locatie of null",
      "attendees": ["persoon1", "persoon2"] of null
    }
  ],
  "summary": "Korte samenvatting van wat er geëxtraheerd is",
  "confidence": 0.85
}

BELANGRIJK: Geef alleen valide JSON terug, geen extra tekst!`;
  }

  private parseAIResponse(response: string): AIAnalysisResult {
    try {
      // Clean de response (verwijder mogelijk markdown formatting)
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      // Valideer de structuur
      return {
        tasks: parsed.tasks || [],
        reminders: parsed.reminders || [],
        events: parsed.events || [],
        summary: parsed.summary || 'Analyse voltooid',
        confidence: parsed.confidence || 0.7
      };
    } catch (error) {
      console.error('JSON Parse Error:', error);
      console.log('Raw response:', response);
      
      // Fallback response
      return {
        tasks: [],
        reminders: [],
        events: [],
        summary: 'Kon de AI response niet verwerken',
        confidence: 0.1
      };
    }
  }

  private getDemoAnalysis(noteContent: string, noteTitle: string): AIAnalysisResult {
    // Demo analysis voor wanneer er geen API key is
    const words = noteContent.toLowerCase();
    const tasks: ExtractedTask[] = [];
    const reminders: ExtractedReminder[] = [];
    const events: ExtractedEvent[] = [];

    // Eenvoudige keyword detection voor demo
    if (words.includes('vergadering') || words.includes('meeting') || words.includes('afspraak') || words.includes('dokter')) {
      events.push({
        id: 'demo_event_1',
        title: 'Afspraak gepland',
        description: `Afspraak gevonden in: ${noteTitle}`,
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Morgen
        time: '14:00',
        duration: '1 uur'
      });
    }

    if (words.includes('taak') || words.includes('doen') || words.includes('maken') || words.includes('moet') || words.includes('presentatie')) {
      tasks.push({
        id: 'demo_task_1',
        title: 'Gedetecteerde taak',
        description: `Taak geëxtraheerd uit: ${noteTitle}`,
        priority: 'high',
        category: 'werk',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Over 3 dagen
      });
    }

    if (words.includes('onthouden') || words.includes('deadline') || words.includes('belangrijk') || words.includes('herinnering')) {
      reminders.push({
        id: 'demo_reminder_1',
        title: 'Belangrijke herinnering',
        description: `Herinnering uit: ${noteTitle}`,
        reminderDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Morgen
        reminderTime: '09:00',
        type: 'once'
      });
    }

    return {
      tasks,
      reminders,
      events,
      summary: `Demo analyse van "${noteTitle}" - ${tasks.length} taken, ${reminders.length} herinneringen, ${events.length} evenementen gevonden`,
      confidence: 0.8
    };
  }

  // Helper method om te checken of AI beschikbaar is
  isAIAvailable(): boolean {
    return !!(OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here');
  }
}

export default new AIService();
