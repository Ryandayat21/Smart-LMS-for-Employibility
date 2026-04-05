import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LMS from './pages/LMS';
import Assessment from './pages/Assessment';
import Analytics from './pages/Analytics';
// Import yang lain nanti di sini...

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userStats] = useState({
    name: "Kelompok SmartLMS",
    skills: { technical: 85, communication: 70, problemSolving: 90, leadership: 60 },
  });

  const runAiAnalysis = () => alert("AI sedang menganalisis data kelompokmu...");

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto p-8">
        <h2 className="text-2xl font-bold mb-6 capitalize">{activeTab}</h2>
        
        {activeTab === 'dashboard' && <Dashboard userStats={userStats} runAiAnalysis={runAiAnalysis} />}
        {activeTab === 'lms' && <LMS />}
        {activeTab === 'assessment' && <Assessment />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
};

export default App;