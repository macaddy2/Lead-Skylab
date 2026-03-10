import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

// Protected route layout - handles auth check and app shell
function ProtectedLayout() {
  const { user, loading } = useAuth();
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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-lg" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Sidebar />
      <Header onSearchClick={() => setCommandPaletteOpen(true)} />
      <main id="main-content" className="main-content" role="main">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="page-loader"><div className="spinner-lg" /></div>}>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />

        {/* Public survey response page - no auth required */}
        <Route path="/survey/:id/respond" element={
          <ErrorBoundary>
            <SurveyRespond />
          </ErrorBoundary>
        } />

        {/* Protected routes with app layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pages" element={<LandingPages />} />
          <Route path="/pages/new" element={<LandingPageEditor />} />
          <Route path="/pages/:id" element={<LandingPageEditor />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/audience" element={<Audience />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/experiments/:id" element={<ExperimentDetail />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/surveys/new" element={<SurveyBuilder />} />
          <Route path="/surveys/:id" element={<SurveyBuilder />} />
          {/* Content Studio */}
          <Route path="/content" element={<ContentStudio />} />
          <Route path="/content/analyze" element={<ProductAnalyzer />} />
          <Route path="/content/generate" element={<ContentGenerator />} />
          <Route path="/content/campaigns" element={<ContentCampaigns />} />
          <Route path="/content/templates" element={<ContentTemplates />} />
          {/* Launch Autopilot */}
          <Route path="/autopilot" element={<LaunchAutopilot />} />
          <Route path="/autopilot/new" element={<PlanWizard />} />
          <Route path="/autopilot/plans/:planId" element={<PlanKanban />} />
          <Route path="/autopilot/queue" element={<ContentQueue />} />
          <Route path="/autopilot/preferences" element={<AutopilotPreferences />} />
          <Route path="/autopilot/analytics" element={<AutopilotAnalytics />} />
        </Route>
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
