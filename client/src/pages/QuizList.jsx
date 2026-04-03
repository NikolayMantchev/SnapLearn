import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as quizService from '../services/quizService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const difficultyColors = {
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  const difficultyLabels = {
    easy: t('quizList.easy'),
    medium: t('quizList.medium'),
    hard: t('quizList.hard'),
  };

  useEffect(() => {
    let cancelled = false;
    quizService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : data.quizzes ?? [];
          setQuizzes(list);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner />;

  const locale = i18n.language === 'de' ? 'de-DE' : i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">{t('quizList.myQuizzes')}</h1>

      {quizzes.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-md dark:bg-[#1a1a2e]">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-200">{t('quizList.noQuizzes')}</p>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {t('quizList.noQuizzesHint')}
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700"
          >
            {t('quizList.uploadPhoto')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => (
            <Link
              key={q._id}
              to={`/quizzes/${q._id}`}
              className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-[#1a1a2e]"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors dark:text-gray-100">
                  {q.title || 'Quiz'}
                </h3>
                {q.bestScore != null && (
                  <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {q.bestScore}%
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {q.subject && (
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {q.subject}
                  </span>
                )}
                {q.difficulty && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      difficultyColors[q.difficulty] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {difficultyLabels[q.difficulty] || q.difficulty}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" />
                  {q.question_count ?? q.questions?.length ?? 0} {t('common.questions')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(q.createdAt).toLocaleDateString(locale)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
