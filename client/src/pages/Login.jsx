import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success(t('common.welcomeBack'));
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : t('auth.loginFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-[#0f0f1a]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-3xl font-bold text-indigo-600">
            <BookOpen className="h-8 w-8" />
            SnapLearn
          </div>
          <p className="text-gray-500 dark:text-gray-400">{t('auth.loginSubtitle')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-md dark:bg-[#1a1a2e]"
        >
          <label className="mb-4 block">
            <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
              <Mail className="h-4 w-4" /> {t('auth.email')}
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-[#0f0f1a] dark:text-gray-100 dark:focus:ring-indigo-800"
              placeholder={t('auth.emailPlaceholder')}
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
              <Lock className="h-4 w-4" /> {t('auth.password')}
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-[#0f0f1a] dark:text-gray-100 dark:focus:ring-indigo-800"
              placeholder="********"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? t('auth.loggingIn') : t('auth.login')}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('auth.noAccount')}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
              {t('auth.register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
