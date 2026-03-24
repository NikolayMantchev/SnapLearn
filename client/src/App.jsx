import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import QuizList from './pages/QuizList';
import QuizPlay from './pages/QuizPlay';
import Review from './pages/Review';
import Stats from './pages/Stats';
import * as reviewService from './services/reviewService';

function AppLayout() {
  const { user } = useAuth();
  const [reviewDueCount, setReviewDueCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    reviewService
      .getDue()
      .then((data) => {
        if (!cancelled) {
          const items = Array.isArray(data) ? data : data.items ?? [];
          setReviewDueCount(items.length);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar reviewDueCount={reviewDueCount} />}
      <main className={user ? 'mx-auto max-w-7xl px-4 py-6' : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <QuizList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:id"
            element={
              <ProtectedRoute>
                <QuizPlay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/review"
            element={
              <ProtectedRoute>
                <Review />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
