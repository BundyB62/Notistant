# 🤖 AI Setup voor Notistant

## OpenAI API Key Configuratie

Om de AI functionaliteiten te gebruiken, moet je een OpenAI API key configureren:

### 1. API Key verkrijgen
1. Ga naar [OpenAI Platform](https://platform.openai.com/api-keys)
2. Log in of maak een account aan
3. Klik op "Create new secret key"
4. Kopieer je API key (begint met `sk-...`)

### 2. API Key configureren
1. Open het `.env` bestand in de project root
2. Vervang `your_openai_api_key_here` met je echte API key:
   ```
   OPENAI_API_KEY=sk-jouw-echte-api-key-hier
   ```
3. Sla het bestand op

### 3. App herstarten
1. Stop de Expo server (Ctrl+C)
2. Clear de cache: `npx expo start --clear`
3. Start de app opnieuw

## ✨ AI Functionaliteiten

Zodra de API key is geconfigureerd, kan de AI:

### 📝 **Uit notities extraheren:**
- **Taken** - To-do items, projecten, acties
- **Herinneringen** - Deadlines, belangrijke data
- **Agenda items** - Meetings, afspraken, evenementen

### 🎯 **Intelligente detectie:**
- Automatische prioriteit toekenning
- Datum/tijd herkenning
- Categorisatie (werk/privé/studie)
- Context begrip

### 💡 **Voorbeelden van tekst die gedetecteerd wordt:**

**Taken:**
- "Ik moet morgen de presentatie afmaken"
- "Vergeet niet om de factuur te betalen"
- "Project deadline is vrijdag"

**Herinneringen:**
- "Belangrijke vergadering om 14:00"
- "Onthouden: doktersafspraak volgende week"
- "Deadline rapport is 15 maart"

**Agenda items:**
- "Meeting met team dinsdag 10:00"
- "Lunch met Sarah woensdag"
- "Presentatie bij klant vrijdag 15:30"

## 🔒 Privacy & Kosten

- **Privacy**: Je notities worden naar OpenAI gestuurd voor analyse
- **Kosten**: Je betaalt per API call aan OpenAI (~$0.001-0.002 per notitie)
- **Demo modus**: Zonder API key werkt de app met demo functionaliteit

## 🛠️ Troubleshooting

### "Demo modus" blijft zichtbaar?
- Check of je API key correct is ingesteld in `.env`
- Herstart de app met `--clear` flag

### API errors?
- Controleer of je OpenAI account credit heeft
- Verifieer dat de API key geldig is
- Check je internet verbinding

### Build errors na .env toevoegen?
- Herstart Metro bundler: `npx expo start --clear`
- Check of babel.config.js correct is geconfigureerd
