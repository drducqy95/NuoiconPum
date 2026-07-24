/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { EasyPage } from './pages/EasyPage';
import { DiaryList } from './pages/DiaryList';
import { DiaryEntryForm } from './pages/DiaryEntryForm';
import { DiaryView } from './pages/DiaryView';
import { Assistant } from './pages/Assistant';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="easy" element={<EasyPage />} />
            <Route path="easy/:subpage" element={<EasyPage />} />
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
      </Router>
    </AuthProvider>
  );
}

