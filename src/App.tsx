import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './store/DataContext';
import { AuthProvider, useAuth } from './store/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import LandingPages from './pages/LandingPages';
import LandingPageEditor from './pages/LandingPages/Editor';
import Leads from './pages/Leads';
import LeadDetail from './pages/Leads/LeadDetail';
import Audience from './pages/Audience';
import Experiments from './pages/Experiments';
import ExperimentDetail from './pages/Experiments/ExperimentDetail';
import Surveys from './pages/Surveys';
import SurveyBuilder from './pages/Surveys/SurveyBuilder';
// Content Studio
import ContentStudio from './pages/ContentStudio';
import ProductAnalyzer from './pages/ContentStudio/ProductAnalyzer';
import ContentGenerator from './pages/ContentStudio/Generator';
import ContentCampaigns from './pages/ContentStudio/Campaigns';
import ContentTemplates from './pages/ContentStudio/Templates';
// Launch Autopilot
import LaunchAutopilot from './pages/LaunchAutopilot';
import PlanWizard from './pages/LaunchAutopilot/PlanWizard';
import PlanKanban from './pages/LaunchAutopilot/PlanKanban';
import ContentQueue from './pages/LaunchAutopilot/ContentQueue';
import AutopilotPreferences from './pages/LaunchAutopilot/Preferences';
import AutopilotAnalytics from './pages/LaunchAutopilot/Analytics';
// Auth
import Login from './pages/Auth/Login';
import './index.css';

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
  return (
    <div className="app-layout">
      <Sidebar />
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      
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
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;

