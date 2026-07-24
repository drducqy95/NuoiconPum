import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Layout } from './components/Layout';

// Lazy loaded page components for optimal bundle splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const EasyPage = lazy(() => import('./pages/EasyPage').then(m => ({ default: m.EasyPage })));
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase').then(m => ({ default: m.KnowledgeBase })));
const VaccinePage = lazy(() => import('./pages/VaccinePage').then(m => ({ default: m.VaccinePage })));
const DiaryList = lazy(() => import('./pages/DiaryList').then(m => ({ default: m.DiaryList })));
const DiaryEntryForm = lazy(() => import('./pages/DiaryEntryForm').then(m => ({ default: m.DiaryEntryForm })));
const DiaryView = lazy(() => import('./pages/DiaryView').then(m => ({ default: m.DiaryView })));
const Assistant = lazy(() => import('./pages/Assistant').then(m => ({ default: m.Assistant })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

const PageFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-xs font-bold text-gray-500">Đang tải trang...</span>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="easy" element={<EasyPage />} />
              <Route path="easy/:subpage" element={<EasyPage />} />
              <Route path="vaccines" element={<VaccinePage />} />
              <Route path="knowledge" element={<KnowledgeBase />} />
              <Route path="knowledge/:category" element={<KnowledgeBase />} />
              <Route path="diary" element={<DiaryList />} />
              <Route path="diary/new" element={<DiaryEntryForm />} />
              <Route path="diary/:id/edit" element={<DiaryEntryForm />} />
              <Route path="diary/:id" element={<DiaryView />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
