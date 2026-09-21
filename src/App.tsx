import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { MarketsPage } from './pages/MarketsPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { HistoryPage } from './pages/HistoryPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Application Shell Routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

