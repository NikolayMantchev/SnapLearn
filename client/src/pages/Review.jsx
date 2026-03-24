import { useEffect, useState } from 'react';
import { Brain, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import * as reviewService from '../services/reviewService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ratingButtons = [
  { quality: 0, label: 'Keine Ahnung', hint: 'Sofort wieder', color: 'bg-rose-500 hover:bg-rose-600' },
  { quality: 3, label: 'Schwer', hint: 'Bald wieder', color: 'bg-amber-500 hover:bg-amber-600' },
  { quality: 4, label: 'Gut', hint: 'In ein paar Tagen', color: 'bg-blue-500 hover:bg-blue-600' },
  { quality: 5, label: 'Leicht', hint: 'Spaeter wiederholen', color: 'bg-emerald-500 hover:bg-emerald-600' },
];

export default function Review() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    reviewService
      .getDue()
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : data.reviews ?? data.items ?? [];
          setItems(list);
        }
      })
      .catch(() => toast.error('Fehler beim Laden der Wiederholungen'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner />;

  // All done
  if (items.length === 0 || currentIndex >= items.length) {
    return (
      <div className="mx-auto max-w-lg rounded-xl bg-white p-12 text-center shadow-md">
        <div className="mb-4 text-5xl">&#127881;</div>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Keine Wiederholungen faellig!</h2>
        <p className="text-gray-500">Du bist auf dem neuesten Stand. Komm spaeter wieder.</p>
      </div>
    );
  }

  const card = items[currentIndex];
  const remaining = items.length - currentIndex;

  async function handleRate(quality) {
    setSubmitting(true);
    try {
      const cardId = card._id ?? card.id;
      await reviewService.submitReview(cardId, quality);
      setRevealed(false);
      setCurrentIndex((i) => i + 1);
    } catch (err) {
      toast.error('Bewertung fehlgeschlagen');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Wiederholen</h1>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
          {remaining} uebrig
        </span>
      </div>

      {/* Card */}
      <div className="mb-6 rounded-xl bg-white p-8 shadow-md">
        {/* Question */}
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">Frage</p>
          <p className="text-lg font-medium text-gray-900">{card.question_text ?? card.question}</p>
        </div>

        {/* Options for multiple choice */}
        {card.type === 'multiple_choice' && card.options?.length > 0 && !revealed && (
          <div className="mb-4 space-y-2">
            {card.options.map((opt, i) => {
              const label = typeof opt === 'string' ? opt : opt.text ?? opt.label ?? '';
              return (
                <div key={i} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-medium text-gray-400">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {label}
                </div>
              );
            })}
          </div>
        )}

        {/* Answer */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-6 text-sm font-medium text-gray-500 transition-all hover:border-indigo-400 hover:text-indigo-600"
          >
            <Eye className="h-5 w-5" />
            Antwort anzeigen
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">Richtige Antwort</p>
              <p className="text-base font-medium text-emerald-700">{card.correct_answer ?? card.answer}</p>
            </div>
            {card.explanation && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">Erklaerung</p>
                <p className="text-sm text-gray-600">{card.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating buttons */}
      {revealed && (
        <div>
          <p className="mb-2 text-center text-xs text-gray-400">Wie gut wusstest du die Antwort?</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ratingButtons.map(({ quality, label, hint, color }) => (
              <button
                key={quality}
                onClick={() => handleRate(quality)}
                disabled={submitting}
                className={`flex flex-col items-center rounded-lg px-3 py-3 text-white transition-all disabled:opacity-50 ${color}`}
              >
                <span className="text-sm font-semibold">{label}</span>
                <span className="mt-0.5 text-[10px] opacity-80">{hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${(currentIndex / items.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">
          {currentIndex} von {items.length} bearbeitet
        </p>
      </div>
    </div>
  );
}
