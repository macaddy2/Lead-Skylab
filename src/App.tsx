import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './store/DataContext';
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
import './index.css';

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

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
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
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
