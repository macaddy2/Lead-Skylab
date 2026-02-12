import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './store/DataContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import CommandPalette from './components/ui/CommandPalette';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
// Auth (not lazy - needed immediately)
import Login from './pages/Auth/Login';
import './index.css';

// Lazy-loaded page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LandingPages = lazy(() => import('./pages/LandingPages'));
const LandingPageEditor = lazy(() => import('./pages/LandingPages/Editor'));
const Leads = lazy(() => import('./pages/Leads'));
const LeadDetail = lazy(() => import('./pages/Leads/LeadDetail'));
const Audience = lazy(() => import('./pages/Audience'));
const Experiments = lazy(() => import('./pages/Experiments'));
const ExperimentDetail = lazy(() => import('./pages/Experiments/ExperimentDetail'));
const Surveys = lazy(() => import('./pages/Surveys'));
const SurveyBuilder = lazy(() => import('./pages/Surveys/SurveyBuilder'));
const SurveyRespond = lazy(() => import('./pages/Surveys/SurveyRespond'));
// Content Studio
const ContentStudio = lazy(() => import('./pages/ContentStudio'));
const ProductAnalyzer = lazy(() => import('./pages/ContentStudio/ProductAnalyzer'));
const ContentGenerator = lazy(() => import('./pages/ContentStudio/Generator'));
const ContentCampaigns = lazy(() => import('./pages/ContentStudio/Campaigns'));
const ContentTemplates = lazy(() => import('./pages/ContentStudio/Templates'));
// Launch Autopilot
const LaunchAutopilot = lazy(() => import('./pages/LaunchAutopilot'));
const PlanWizard = lazy(() => import('./pages/LaunchAutopilot/PlanWizard'));
const PlanKanban = lazy(() => import('./pages/LaunchAutopilot/PlanKanban'));
const ContentQueue = lazy(() => import('./pages/LaunchAutopilot/ContentQueue'));
const AutopilotPreferences = lazy(() => import('./pages/LaunchAutopilot/Preferences'));
const AutopilotAnalytics = lazy(() => import('./pages/LaunchAutopilot/Analytics'));

// Loading fallback for Suspense
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
      <div className="loading-spinner" style={{ width: 32, height: 32, border: '3px solid var(--gray-700)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
        <style>{`
          .loading-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--gray-950);
            color: var(--gray-400);
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--gray-700);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: var(--spacing-4);
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Sidebar />
      <Header onSearchClick={() => setCommandPaletteOpen(true)} />
      <main id="main-content" className="main-content" role="main">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />

        {/* Public survey response page - no auth required */}
        <Route path="/survey/:id/respond" element={
          <ErrorBoundary>
            <SurveyRespond />
          </ErrorBoundary>
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/pages" element={
          <ProtectedRoute>
            <AppLayout><LandingPages /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/pages/new" element={
          <ProtectedRoute>
            <AppLayout><LandingPageEditor /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/pages/:id" element={
          <ProtectedRoute>
            <AppLayout><LandingPageEditor /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/leads" element={
          <ProtectedRoute>
            <AppLayout><Leads /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/leads/:id" element={
          <ProtectedRoute>
            <AppLayout><LeadDetail /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/audience" element={
          <ProtectedRoute>
            <AppLayout><Audience /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/experiments" element={
          <ProtectedRoute>
            <AppLayout><Experiments /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/experiments/:id" element={
          <ProtectedRoute>
            <AppLayout><ExperimentDetail /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/surveys" element={
          <ProtectedRoute>
            <AppLayout><Surveys /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/surveys/new" element={
          <ProtectedRoute>
            <AppLayout><SurveyBuilder /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/surveys/:id" element={
          <ProtectedRoute>
            <AppLayout><SurveyBuilder /></AppLayout>
          </ProtectedRoute>
        } />
        {/* Content Studio */}
        <Route path="/content" element={
          <ProtectedRoute>
            <AppLayout><ContentStudio /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/content/analyze" element={
          <ProtectedRoute>
            <AppLayout><ProductAnalyzer /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/content/generate" element={
          <ProtectedRoute>
            <AppLayout><ContentGenerator /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/content/campaigns" element={
          <ProtectedRoute>
            <AppLayout><ContentCampaigns /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/content/templates" element={
          <ProtectedRoute>
            <AppLayout><ContentTemplates /></AppLayout>
          </ProtectedRoute>
        } />
        {/* Launch Autopilot */}
        <Route path="/autopilot" element={
          <ProtectedRoute>
            <AppLayout><LaunchAutopilot /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/autopilot/new" element={
          <ProtectedRoute>
            <AppLayout><PlanWizard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/autopilot/plans/:planId" element={
          <ProtectedRoute>
            <AppLayout><PlanKanban /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/autopilot/queue" element={
          <ProtectedRoute>
            <AppLayout><ContentQueue /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/autopilot/preferences" element={
          <ProtectedRoute>
            <AppLayout><AutopilotPreferences /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/autopilot/analytics" element={
          <ProtectedRoute>
            <AppLayout><AutopilotAnalytics /></AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
