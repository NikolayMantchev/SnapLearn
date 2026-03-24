import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { BookOpen, HelpCircle, BarChart3, TrendingUp } from 'lucide-react';
import * as statsService from '../services/statsService';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Stats() {
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ov, hist] = await Promise.allSettled([
          statsService.getOverview(),
          statsService.getHistory(),
        ]);
        if (cancelled) return;
        if (ov.status === 'fulfilled') setOverview(ov.value?.stats ?? ov.value);
        if (hist.status === 'fulfilled') {
          const list = Array.isArray(hist.value) ? hist.value : hist.value.history ?? [];
          setHistory(list);
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
    { label: 'Quizze gesamt', value: overview?.totalQuizzes ?? 0, icon: BookOpen, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Versuche', value: overview?.totalAttempts ?? 0, icon: HelpCircle, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Durchschnitt', value: `${overview?.avgScore ?? 0}%`, icon: BarChart3, color: 'text-amber-600 bg-amber-100' },
    { label: 'Faellig', value: overview?.itemsDue ?? 0, icon: TrendingUp, color: 'text-rose-600 bg-rose-100' },
  ];

  // Format history dates for chart display
  const chartData = history.map((item) => ({
    ...item,
    dateLabel: item.date
      ? new Date(item.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
      : '',
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Statistiken</h1>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl bg-white p-6 shadow-md">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Score over time */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Durchschnittliche Punktzahl</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v) => [`${v}%`, 'Durchschnitt']}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#4f46e5' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quizzes per day */}
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Quizze pro Tag</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v) => [v, 'Quizze']}
                />
                <Bar
                  dataKey="quizzesTaken"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="rounded-xl bg-white p-12 text-center shadow-md">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">Noch keine Verlaufsdaten vorhanden.</p>
        </div>
      )}
    </div>
  );
}
