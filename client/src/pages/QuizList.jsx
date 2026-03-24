import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, HelpCircle } from 'lucide-react';
import * as quizService from '../services/quizService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const difficultyColors = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
};

const difficultyLabels = {
  easy: 'Leicht',
  medium: 'Mittel',
  hard: 'Schwer',
};

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Meine Quizze</h1>

      {quizzes.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-md">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="mb-2 text-lg font-medium text-gray-700">Noch keine Quizze</p>
          <p className="mb-4 text-sm text-gray-500">
            Lade ein Foto hoch, um dein erstes Quiz zu erstellen.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700"
          >
            Foto hochladen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((q) => (
            <Link
              key={q._id}
              to={`/quizzes/${q._id}`}
              className="group rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {q.title || 'Quiz'}
                </h3>
                {q.bestScore != null && (
                  <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {q.bestScore}%
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {q.subject && (
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {q.subject}
                  </span>
                )}
                {q.difficulty && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      difficultyColors[q.difficulty] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {difficultyLabels[q.difficulty] || q.difficulty}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" />
                  {q.question_count ?? q.questions?.length ?? 0} Fragen
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(q.createdAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
