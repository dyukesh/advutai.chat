import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './components/auth/AuthPage';
import { ChatPage } from './pages/ChatPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { TasksPage } from './pages/TasksPage';
import { MemoryPage } from './pages/MemoryPage';
import { ResearchPage } from './pages/ResearchPage';
import { FilesPage } from './pages/FilesPage';
import { ContentStudioPage } from './pages/ContentStudioPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';
import { BillingPage } from './pages/BillingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, initialized } = useAppStore();
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-950">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          <p className="text-surface-400 text-sm">Loading AdvutAI...</p>
        </div>
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { initialize, initialized } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="workspace" element={<WorkspacePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="memory" element={<MemoryPage />} />
          <Route path="research" element={<ResearchPage />} />
          <Route path="files" element={<FilesPage />} />
          <Route path="content" element={<ContentStudioPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
