import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  Brain,
  BarChart3,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Hochladen', icon: Upload },
  { to: '/quizzes', label: 'Quizze', icon: BookOpen },
  { to: '/review', label: 'Wiederholen', icon: Brain },
  { to: '/stats', label: 'Statistiken', icon: BarChart3 },
];

/**
 * Top navigation bar with mobile hamburger menu.
 * @param {{ reviewDueCount?: number }} props
 */
export default function Navbar({ reviewDueCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
          <BookOpen className="h-6 w-6" />
          SnapLearn
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
              <Icon className="h-4 w-4" />
              {label}
              {to === '/review' && reviewDueCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white">
                  {reviewDueCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Desktop user menu */}
        <div className="hidden items-center gap-3 md:flex">
          <span className="flex items-center gap-1.5 text-sm text-gray-600">
            <User className="h-4 w-4" />
            {user?.username}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 md:hidden">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {label}
              {to === '/review' && reviewDueCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white">
                  {reviewDueCount}
                </span>
              )}
            </NavLink>
          ))}
          <hr className="my-2 border-gray-200" />
          <div className="flex items-center justify-between px-3 py-2">
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <User className="h-4 w-4" />
              {user?.username}
            </span>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
