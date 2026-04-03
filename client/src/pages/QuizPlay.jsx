import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as quizService from '../services/quizService';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    let cancelled = false;
    quizService
      .getById(id)
      .then((data) => {
        if (!cancelled) {
          const q = data.quiz ?? data;
          const questions = data.questions ?? q.questions ?? [];
          setQuiz({ ...q, questions });
          setAnswers({});
          setResults(null);
          setCurrent(0);
        }
      })
      .catch(() => toast.error(t('quizPlay.quizNotFound')))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id, t]);

  if (loading) return <LoadingSpinner />;
  if (!quiz) return null;

  const questions = quiz.questions ?? [];
  const total = questions.length;
  const question = questions[current];

  function setAnswer(value) {
    setAnswers((prev) => ({ ...prev, [current]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload = questions.map((q, i) => ({
        questionId: q._id ?? q.id ?? i,
        answer: answers[i] ?? '',
      }));
      const data = await quizService.submit(quiz._id, payload);
      setResults(data);
      toast.success(t('common.quizCompleted'));
    } catch (err) {
      const msg = err.response?.data?.error ?? err.response?.data?.message;
      toast.error(typeof msg === 'string' ? msg : t('quizPlay.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setAnswers({});
    setResults(null);
    setCurrent(0);
  }

  // ---------- Results view ----------
  if (results) {
    const score = results.score ?? results.percentage ?? 0;
    const breakdown = results.results ?? results.breakdown ?? [];

    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 rounded-xl bg-white p-8 text-center shadow-md dark:bg-[#1a1a2e]">
          <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">{t('quizPlay.yourResult')}</p>
          <p className="text-6xl font-bold text-indigo-600">{Math.round(score)}%</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {results.correctAnswers ?? results.correct ?? 0} {t('quizPlay.of')} {results.totalQuestions ?? results.total ?? total} {t('quizPlay.correct')}
          </p>
        </div>

        <div className="space-y-3">
          {breakdown.map((item, i) => {
            const q = questions[i];
            const isCorrect = item.correct ?? item.isCorrect;
            return (
              <div
                key={i}
                className={`rounded-xl border-l-4 bg-white p-5 shadow-md dark:bg-[#1a1a2e] ${
                  isCorrect ? 'border-emerald-500' : 'border-rose-500'
                }`}
              >
                <div className="mb-2 flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  )}
                  <p className="font-medium text-gray-900 dark:text-gray-100">{q?.question_text ?? q?.question ?? t('quizPlay.question', { index: i + 1 })}</p>
                </div>
                {!isCorrect && item.correctAnswer && (
                  <p className="ml-7 text-sm text-emerald-700 dark:text-emerald-300">
                    {t('quizPlay.correctAnswer', { answer: item.correctAnswer })}
                  </p>
                )}
                {item.explanation && (
                  <p className="ml-7 mt-1 text-sm text-gray-500 dark:text-gray-400">{item.explanation}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={restart}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700"
          >
            <RotateCcw className="h-4 w-4" /> {t('quizPlay.tryAgain')}
          </button>
          <button
            onClick={() => navigate('/quizzes')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" /> {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  // ---------- Quiz play view ----------
  const isLast = current === total - 1;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{t('quizPlay.questionOf', { current: current + 1, total })}</span>
          <span>{Math.round(((current + 1) / total) * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-white p-6 shadow-md dark:bg-[#1a1a2e]">
        <p className="mb-6 text-lg font-medium text-gray-900 dark:text-gray-100">{question?.question_text ?? question?.question}</p>

        {(question?.type === 'multiple_choice' || question?.options?.length > 0) && (
          <div className="space-y-3">
            {(question.options ?? []).map((option, oi) => {
              const optionValue = typeof option === 'string' ? option : option.text ?? option.label ?? '';
              const selected = answers[current] === optionValue;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswer(optionValue)}
                  className={`w-full rounded-lg border p-4 text-left text-sm transition-all ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium dark:border-gray-500">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {optionValue}
                </button>
              );
            })}
          </div>
        )}

        {(question?.type === 'free_text' || (!question?.options?.length && question?.type !== 'multiple_choice')) && !question?.options?.length && (
          <textarea
            value={answers[current] ?? ''}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            placeholder={t('quizPlay.yourAnswer')}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-[#0f0f1a] dark:text-gray-100 dark:focus:ring-indigo-800"
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="h-4 w-4" /> {t('common.back')}
        </button>

        <div className="flex-1" />

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? t('quizPlay.submitting') : t('quizPlay.submit')}
          </button>
        ) : (
          <button
            onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700"
          >
            {t('common.next')} <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
