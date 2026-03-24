# SnapLearn

Eine KI-gestuetzte Lern-App fuer Schueler. Fotografiere dein Lehrmaterial, lass automatisch Quizfragen generieren und lerne mit Spaced Repetition.

**Live Demo:** [snaplearn-two.vercel.app](https://snaplearn-two.vercel.app)

## Features

- **Foto-Upload** — Lehrmaterial (Buecher, Hefte, Tafel) mit dem Handy fotografieren oder Bilder hochladen. Mehrere Bilder gleichzeitig moeglich.
- **KI-Texterkennung** — Claude Vision extrahiert automatisch den Lerninhalt aus Bildern.
- **Quiz-Generierung** — Automatische Multiple-Choice und Freitext-Fragen basierend auf dem erkannten Text. Schwierigkeit und Anzahl waehlbar.
- **Spaced Repetition** — Falsch beantwortete Fragen werden mit dem SM-2 Algorithmus intelligent wiederholt.
- **Statistiken** — Lernfortschritt, Durchschnittswerte und Verlauf im Ueberblick.
- **Benutzerkonten** — Registrierung und Login mit JWT-Authentifizierung.

## Tech-Stack

| Bereich | Technologie |
|---------|------------|
| Frontend | React 18, Tailwind CSS, Vite |
| Backend | Node.js, Express |
| Datenbank | MongoDB Atlas (Mongoose) |
| KI | Anthropic Claude API (Vision + Text) |
| Auth | JWT + bcrypt |
| Upload | Multer (lokaler Speicher / /tmp auf Vercel) |
| Deployment | Vercel (Serverless Functions) |

## Projektstruktur

```
snaplearn/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute, LoadingSpinner
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Dashboard, Upload, QuizPlay, QuizList, Review, Stats, Login, Register
│   │   └── services/        # API-Service Layer (axios)
│   └── ...
├── server/                  # Express Backend
│   ├── config/              # MongoDB-Verbindung
│   ├── middleware/           # Auth, Upload, ErrorHandler
│   ├── models/              # User, Upload, Quiz, Question, QuizAttempt, ReviewItem
│   ├── routes/              # auth, uploads, quizzes, reviews, stats
│   └── services/            # claudeService, quizGenerator, spacedRepetition
├── api/                     # Vercel Serverless Entry Point
│   └── index.js
├── vercel.json
└── .env
```

## Setup

### Voraussetzungen

- Node.js 18+
- MongoDB Atlas Account (oder lokale MongoDB)
- Anthropic API Key ([console.anthropic.com](https://console.anthropic.com))

### Installation

```bash
git clone https://github.com/<dein-username>/snaplearn.git
cd snaplearn
npm run install:all
```

### Umgebungsvariablen

Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=dein-geheimer-schluessel
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/snaplearn
UPLOAD_DIR=./server/uploads
MAX_FILE_SIZE=10485760
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Entwicklung starten

```bash
npm run dev
```

Startet Frontend (localhost:5173) und Backend (localhost:3001) gleichzeitig.

### Produktion bauen

```bash
npm run build
npm start
```

## Deployment (Vercel)

1. Vercel CLI installieren: `npm i -g vercel`
2. Umgebungsvariablen in Vercel setzen: `vercel env add`
3. Deployen: `vercel --prod`

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| POST | /api/auth/register | Registrierung |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Aktueller User |
| POST | /api/uploads | Bild hochladen + Texterkennung |
| GET | /api/uploads | Alle Uploads |
| GET | /api/uploads/:id | Upload-Details mit Quizzen |
| DELETE | /api/uploads/:id | Upload loeschen |
| POST | /api/quizzes/generate | Quiz aus Upload(s) generieren |
| GET | /api/quizzes | Alle Quizze |
| GET | /api/quizzes/:id | Quiz mit Fragen |
| POST | /api/quizzes/:id/submit | Quiz abgeben + Bewertung |
| GET | /api/reviews/due | Faellige Wiederholungen |
| POST | /api/reviews/:id | Wiederholung bewerten |
| GET | /api/stats/overview | Statistik-Uebersicht |
| GET | /api/stats/history | 30-Tage Verlauf |

## Lizenz

All Rights Reserved. Dieses Projekt darf ohne ausdrueckliche Genehmigung nicht kopiert, veraendert oder weiterverbreitet werden.
