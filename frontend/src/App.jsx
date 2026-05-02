import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoadingSpinner from './components/UI/LoadingSpinner';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import TasksPage from './pages/TasksPage';

// Protected route — redirect to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

// Public route — redirect to /dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

    {/* Protected */}
    <Route path="/dashboard"      element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/events"         element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
    <Route path="/events/:id"     element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
    <Route path="/tasks"          element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />

    {/* Default redirects */}
    <Route path="/"  element={<Navigate to="/dashboard" replace />} />
    <Route path="*"  element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            },
            success: { iconTheme: { primary: 'var(--color-success)', secondary: 'var(--color-bg-card)' } },
            error:   { iconTheme: { primary: 'var(--color-danger)', secondary: 'var(--color-bg-card)' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
