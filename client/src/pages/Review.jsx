import { useEffect, useState } from 'react';
import { Brain, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as reviewService from '../services/reviewService';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Review() {
  const { t } = useTranslation();

  const ratingButtons = [
    { quality: 0, label: t('review.noIdea'), hint: t('review.againImmediately'), color: 'bg-rose-500 hover:bg-rose-600' },
    { quality: 3, label: t('review.hard'), hint: t('review.soonAgain'), color: 'bg-amber-500 hover:bg-amber-600' },
    { quality: 4, label: t('review.good'), hint: t('review.inAFewDays'), color: 'bg-blue-500 hover:bg-blue-600' },
    { quality: 5, label: t('review.easy'), hint: t('review.reviewLater'), color: 'bg-emerald-500 hover:bg-emerald-600' },
  ];

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
      .catch(() => toast.error(t('review.loadError')))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [t]);

  if (loading) return <LoadingSpinner />;

  if (items.length === 0 || currentIndex >= items.length) {
    return (
      <div className="mx-auto max-w-lg rounded-xl bg-white p-12 text-center shadow-md dark:bg-[#1a1a2e]">
        <div className="mb-4 text-5xl">&#127881;</div>
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">{t('review.noReviewsDue')}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t('review.allCaughtUp')}</p>
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
      toast.error(t('review.ratingFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('review.title')}</h1>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          {t('review.remaining', { count: remaining })}
        </span>
      </div>

      <div className="mb-6 rounded-xl bg-white p-8 shadow-md dark:bg-[#1a1a2e]">
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">{t('review.questionLabel')}</p>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{card.question_text ?? card.question}</p>
        </div>

        {card.type === 'multiple_choice' && card.options?.length > 0 && !revealed && (
          <div className="mb-4 space-y-2">
            {card.options.map((opt, i) => {
              const label = typeof opt === 'string' ? opt : opt.text ?? opt.label ?? '';
              return (
                <div key={i} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-medium text-gray-400 dark:border-gray-500">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {label}
                </div>
              );
            })}
          </div>
        )}

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-6 text-sm font-medium text-gray-500 transition-all hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          >
            <Eye className="h-5 w-5" />
            {t('review.showAnswer')}
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">{t('review.correctAnswerLabel')}</p>
              <p className="text-base font-medium text-emerald-700 dark:text-emerald-300">{card.correct_answer ?? card.answer}</p>
            </div>
            {card.explanation && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">{t('review.explanationLabel')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{card.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {revealed && (
        <div>
          <p className="mb-2 text-center text-xs text-gray-400">{t('review.howWellDidYouKnow')}</p>
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

      <div className="mt-6">
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${(currentIndex / items.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          {t('review.processed', { current: currentIndex, total: items.length })}
        </p>
      </div>
    </div>
  );
}
