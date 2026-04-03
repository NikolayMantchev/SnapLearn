import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, BookOpen, Brain, BarChart3, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import * as statsService from '../services/statsService';
import * as quizService from '../services/quizService';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [overview, quizzes] = await Promise.allSettled([
          statsService.getOverview(),
          quizService.getAll(),
        ]);
        if (cancelled) return;
        if (overview.status === 'fulfilled') setStats(overview.value?.stats ?? overview.value);
        if (quizzes.status === 'fulfilled') {
          const list = Array.isArray(quizzes.value) ? quizzes.value : quizzes.value.quizzes ?? [];
          setRecentQuizzes(list.slice(0, 5));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: t('dashboard.quizzes'), value: stats?.totalQuizzes ?? 0, icon: BookOpen, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
    { label: t('dashboard.average'), value: `${stats?.avgScore ?? 0}%`, icon: BarChart3, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    { label: t('dashboard.streak'), value: `${stats?.streak ?? 0} ${t('common.days')}`, icon: TrendingUp, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
    { label: t('dashboard.due'), value: stats?.itemsDue ?? 0, icon: Brain, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
  ];

  const locale = i18n.language === 'de' ? 'de-DE' : i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('dashboard.hello', { username: user?.username })}
      </h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-[#1a1a2e]">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.quickAccess')}</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/upload"
          className="flex items-center gap-3 rounded-xl bg-indigo-600 p-5 text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg"
        >
          <Camera className="h-8 w-8" />
          <div>
            <p className="font-semibold">{t('dashboard.uploadPhoto')}</p>
            <p className="text-sm text-indigo-200">{t('dashboard.photographMaterial')}</p>
          </div>
        </Link>
        <Link
          to="/quizzes"
          className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-md transition-all hover:shadow-lg dark:bg-[#1a1a2e]"
        >
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/30">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.startQuiz')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.playQuizzes')}</p>
          </div>
        </Link>
        <Link
          to="/review"
          className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-md transition-all hover:shadow-lg dark:bg-[#1a1a2e]"
        >
          <div className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.review')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.studyDueCards')}</p>
          </div>
        </Link>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.recentQuizzes')}</h2>
      {recentQuizzes.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-md dark:bg-[#1a1a2e]">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">{t('dashboard.noQuizzesYet')}</p>
          <Link to="/upload" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
            {t('dashboard.uploadPhotoNow')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentQuizzes.map((q) => (
            <Link
              key={q._id}
              to={`/quizzes/${q._id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg dark:bg-[#1a1a2e]"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{q.title || 'Quiz'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {q.question_count ?? q.questions?.length ?? 0} {t('common.questions')} &middot;{' '}
                  {new Date(q.createdAt).toLocaleDateString(locale)}
                </p>
              </div>
              {q.bestScore != null && (
                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {q.bestScore}%
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
