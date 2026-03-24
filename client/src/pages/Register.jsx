import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen haben');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwoerter stimmen nicht ueberein');
      return;
    }

    setSubmitting(true);
    try {
      await register(username, email, password);
      toast.success('Konto erstellt!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Registrierung fehlgeschlagen');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-3xl font-bold text-indigo-600">
            <BookOpen className="h-8 w-8" />
            SnapLearn
          </div>
          <p className="text-gray-500">Erstelle ein neues Konto</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-md"
        >
          {/* Username */}
          <label className="mb-4 block">
            <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" /> Benutzername
            </span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="max_mustermann"
            />
          </label>

          {/* Email */}
          <label className="mb-4 block">
            <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Mail className="h-4 w-4" /> E-Mail
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="deine@email.de"
            />
          </label>

          {/* Password */}
          <label className="mb-4 block">
            <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Lock className="h-4 w-4" /> Passwort
            </span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Mind. 8 Zeichen"
            />
          </label>

          {/* Confirm */}
          <label className="mb-6 block">
            <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Lock className="h-4 w-4" /> Passwort bestaetigen
            </span>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Passwort wiederholen"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Wird erstellt...' : 'Registrieren'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Bereits ein Konto?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
              Anmelden
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
