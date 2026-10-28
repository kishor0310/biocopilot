import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LimitationsBanner } from './components/LimitationsBanner';
import { CopilotDrawer } from './components/CopilotDrawer';

import { OverviewPage } from './pages/OverviewPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { MetabolicRiskPage } from './pages/MetabolicRiskPage';
import { FeedOptimizerPage } from './pages/FeedOptimizerPage';
import { ScaleUpPage } from './pages/ScaleUpPage';
import { HumanApprovalPage } from './pages/HumanApprovalPage';
import { ReportPage } from './pages/ReportPage';

import { injectSensorFault } from './api/client';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [demoBanner, setDemoBanner] = useState<string | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // 5-MINUTE GUIDED JUDGE DEMO WORKFLOW (P0 Requirement)
  const startDemoMode = async () => {
    setDemoBanner("DEMO STEP 1/6: Validating Dataset & Ingestion Quality...");
    setActiveTab('data');

    setTimeout(async () => {
      setDemoBanner("DEMO STEP 2/6: Starting 12-Channel Virtual Sensor Stream & Injecting Glucose Overfeed Fault...");
      setActiveTab('sensors');
      try {
        await injectSensorFault('glucose_overfeed', 1.5);
      } catch (err) {}
    }, 4000);

    setTimeout(() => {
      setDemoBanner("DEMO STEP 3/6: Metabolic Risk Engine Detects Overflow Lactate Accumulation...");
      setActiveTab('risks');
    }, 8000);

    setTimeout(() => {
      setDemoBanner("DEMO STEP 4/6: AI Model Forecasts Viability Impact with SHAP Feature Importance...");
      setActiveTab('predictions');
    }, 12000);

    setTimeout(() => {
      setDemoBanner("DEMO STEP 5/6: Smart Feed Scheduler Optimizes Nutrient Plan & Media Cost Savings...");
      setActiveTab('feed');
    }, 16000);

    setTimeout(() => {
      setDemoBanner("DEMO STEP 6/6: Evaluating 2 L → 1,000 L Scale-Up & Submitting to Human Approval Queue...");
      setActiveTab('approval');
    }, 20000);

    setTimeout(() => {
      setDemoBanner("5-MIN GUIDED JUDGE DEMO COMPLETED! You may now explore reports or query BioCopilot AI.");
    }, 25000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Disclaimer Banner */}
      <LimitationsBanner />

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        startDemoMode={startDemoMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Demo Workflow Banner Indicator */}
      {demoBanner && (
        <div className="bg-gradient-to-r from-teal-600 to-indigo-600 text-white py-2 px-4 text-center text-xs font-mono font-bold shadow-md animate-pulse">
          {demoBanner}
        </div>
      )}

      {/* Page Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {activeTab === 'overview' && <OverviewPage setActiveTab={setActiveTab} startDemoMode={startDemoMode} />}
        {activeTab === 'data' && <DataQualityPage />}
        {activeTab === 'sensors' && <LiveMonitorPage />}
        {activeTab === 'predictions' && <PredictionsPage />}
        {activeTab === 'risks' && <MetabolicRiskPage />}
        {activeTab === 'feed' && <FeedOptimizerPage />}
        {activeTab === 'scaleup' && <ScaleUpPage />}
        {activeTab === 'approval' && <HumanApprovalPage />}
        {activeTab === 'reports' && <ReportPage />}
      </main>

      {/* Floating AI Copilot Drawer */}
      <CopilotDrawer />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500">
        BioCopilot MVP v1.0 • Built for YUVA Megathon 2026 (SRM IST Trichy) • Explainable Bioprocess Decision Support System
      </footer>
    </div>
  );
}

export default App;
