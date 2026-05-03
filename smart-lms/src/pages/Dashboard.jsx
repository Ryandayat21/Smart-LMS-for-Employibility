import React from 'react';
// Import icon yang lo pake (misal dari lucide-react)
import { Sparkles, Download, BrainCircuit } from 'lucide-react';

const skillColors = {
  leadership: "bg-amber-500",
  digitalLiteracy: "bg-sky-500",
  workEthic: "bg-emerald-500",
  communication: "bg-blue-500",
  technical: "bg-indigo-600",
  emotionalIntelligence: "bg-rose-500",
  attentionToDetail: "bg-violet-500",
  teamwork: "bg-orange-500",
  criticalThinking: "bg-cyan-500",
  problemSolving: "bg-purple-600",
};
const Dashboard = ({ user, runAiAnalysis, aiResult, isAnalysing }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Container Grid: Kiri (Skill) & Kanan (AI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BAGIAN KIRI: Skill Proficiency (Card Putih) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Skill Proficiency</h3>
          </div>
          
          {/* List Progress Bar (Gunakan loop dari data user.skills) */}
          <div className="flex flex-col gap-4">
            {Object.entries(user.skills || {}).map(([skill, value]) => (
              <div key={skill} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-500 capitalize">
                  <span>{skill.replace(/([A-Z])/g, ' $1')}</span>
                  <span>{value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${skillColors[skill] || 'bg-indigo-600'}`} 
                    style={{ width: `${(value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BAGIAN KANAN: Smart Analysis Insight (Card Gelap) */}
        <div className="bg-[#111827] p-6 rounded-3xl text-white shadow-xl flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <button onClick={runAiAnalysis}>
                <Sparkles size={20} className={isAnalysing ? "animate-pulse" : ""} />
              </button>
              <h3 className="font-bold text-lg">Smart Analysis Insight</h3>
            </div>
            {/* Tombol Start AI di pojok kanan atas card */}
            <button 
              onClick={runAiAnalysis}
              disabled={isAnalysing}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <BrainCircuit size={20} className={isAnalysing ? "animate-pulse" : ""} />
            </button>
          </div>

          <div className="flex-1 bg-slate-800/50 rounded-2xl p-5 border border-slate-700 mb-6 overflow-y-auto max-h-87.5">
            {aiResult ? (
              <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                {aiResult}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-10">
                <div className="mb-3 text-indigo-400 opacity-50">✨</div>
                <p className="text-xs">
                  {isAnalysing ? "Sedang menganalisis data..." : "Belum ada analisis. Klik ikon bintang di atas untuk memulai."}
                </p>
              </div>
            )}
          </div>

          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            <Download size={18} />
            Download Career Roadmap (.pdf)
          </button>
        </div>

      </div>
      
      {/* Button Banner di bawah (Opsional jika masih butuh) */}
      {!aiResult && !isAnalysing && (
        <button 
          onClick={runAiAnalysis}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all"
        >
          Cek Rekomendasi Karir AI ✨
        </button>
      )}
    </div>
  );
};

export default Dashboard;