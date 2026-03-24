import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 50000,
});
const MODEL = 'claude-haiku-4-5-20251001';

/**
 * Extract learning content from an image of study material using Claude's vision.
 * @param {string} imagePath - Absolute path to the image file.
 * @returns {Promise<string>} The extracted text content.
 */
export const extractTextFromImage = async (imagePath) => {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const ext = imagePath.split('.').pop().toLowerCase();
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  const mimeType = mimeTypes[ext] || 'image/jpeg';

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64Image },
          },
          {
            type: 'text',
            text: `Analysiere dieses Bild von Lehrmaterial und extrahiere den gesamten relevanten Lerninhalt.

Regeln:
- Extrahiere den Text vollständig und genau
- Behalte die Struktur bei (Überschriften, Listen, Absätze)
- Beschreibe relevante Diagramme oder Formeln in Text
- Ignoriere irrelevante Elemente (Seitenzahlen, Wasserzeichen)
- Erkenne das Fach/Thema

Format:
FACH: [erkanntes Fach]
THEMA: [erkanntes Thema]

INHALT:
[extrahierter Text mit Struktur]`,
          },
        ],
      },
    ],
  });

  return response.content[0].text;
};

/**
 * Generate quiz questions from extracted text using Claude.
 * @param {string} extractedText - The source text to generate questions from.
 * @param {object} options - Generation options.
 * @param {number} [options.numQuestions=5] - Number of questions to generate.
 * @param {string} [options.difficulty='medium'] - Difficulty level.
 * @param {string[]} [options.types] - Question types to include.
 * @returns {Promise<object>} Parsed quiz object with title, subject, and questions array.
 */
export const generateQuizQuestions = async (extractedText, options = {}) => {
  const {
    numQuestions = 5,
    difficulty = 'medium',
    types = ['multiple_choice', 'free_text'],
  } = options;

  const diffMap = {
    easy: 'Einfache Wissensfragen',
    medium: 'Mittelschwere Fragen mit Verständnis',
    hard: 'Schwierige Fragen mit Analyse und Transfer',
  };

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Erstelle ${numQuestions} Quiz-Fragen basierend auf folgendem Lerninhalt.

LERNINHALT:
${extractedText}

ANFORDERUNGEN:
- Schwierigkeit: ${diffMap[difficulty] || diffMap.medium}
- Fragetypen: ${types.join(', ')}
- Bei Multiple-Choice: genau 4 Optionen, nur eine richtig
- Jede Frage mit kurzer Erklärung
- Sprache: Deutsch, schülergerecht

Antworte AUSSCHLIESSLICH im folgenden JSON-Format:
{"title":"Quiz-Titel","subject":"Fach","questions":[{"type":"multiple_choice","question_text":"Frage?","options":["A","B","C","D"],"correct_answer":"A","explanation":"Warum A richtig ist"},{"type":"free_text","question_text":"Frage?","options":null,"correct_answer":"Antwort","explanation":"Erklärung"}]}`,
      },
    ],
  });

  const text = response.content[0].text;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Claude hat kein valides JSON zurückgegeben');
  }
};
