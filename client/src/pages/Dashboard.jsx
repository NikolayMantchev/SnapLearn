import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, BookOpen, Brain, BarChart3, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as statsService from '../services/statsService';
import * as quizService from '../services/quizService';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
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
    { label: 'Quizze', value: stats?.totalQuizzes ?? 0, icon: BookOpen, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Durchschnitt', value: `${stats?.avgScore ?? 0}%`, icon: BarChart3, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Streak', value: `${stats?.streak ?? 0} Tage`, icon: TrendingUp, color: 'text-amber-600 bg-amber-100' },
    { label: 'Faellig', value: stats?.itemsDue ?? 0, icon: Brain, color: 'text-rose-600 bg-rose-100' },
  ];

  return (
    <div>
      {/* Welcome */}
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Hallo, {user?.username}!
      </h1>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Schnellzugriff</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/upload"
          className="flex items-center gap-3 rounded-xl bg-indigo-600 p-5 text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-lg"
        >
          <Camera className="h-8 w-8" />
          <div>
            <p className="font-semibold">Foto hochladen</p>
            <p className="text-sm text-indigo-200">Lernstoff fotografieren</p>
          </div>
        </Link>
        <Link
          to="/quizzes"
          className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-md transition-all hover:shadow-lg"
        >
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Quiz starten</p>
            <p className="text-sm text-gray-500">Vorhandene Quizze spielen</p>
          </div>
        </Link>
        <Link
          to="/review"
          className="flex items-center gap-3 rounded-xl bg-white p-5 shadow-md transition-all hover:shadow-lg"
        >
          <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Wiederholen</p>
            <p className="text-sm text-gray-500">Faellige Karten lernen</p>
          </div>
        </Link>
      </div>

      {/* Recent quizzes */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Letzte Quizze</h2>
      {recentQuizzes.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-md">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">Noch keine Quizze erstellt.</p>
          <Link to="/upload" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Jetzt Foto hochladen
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentQuizzes.map((q) => (
            <Link
              key={q._id}
              to={`/quizzes/${q._id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{q.title || 'Quiz'}</p>
                <p className="text-sm text-gray-500">
                  {q.question_count ?? q.questions?.length ?? 0} Fragen &middot;{' '}
                  {new Date(q.createdAt).toLocaleDateString('de-DE')}
                </p>
              </div>
              {q.bestScore != null && (
                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
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
