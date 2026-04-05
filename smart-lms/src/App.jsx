import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Target, BarChart3, PlayCircle, 
  CheckCircle, BrainCircuit, Sparkles, 
  ChevronRight, LayoutDashboard, ClipboardList,
  Loader2, Trophy, ArrowRight
} from 'lucide-react';

// --- CONFIGURATION ---
const apiKey = ""; // API Key akan otomatis terisi saat dijalankan di lingkungan ini

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  
  // Data Mockup untuk Simulasi
  const [userStats] = useState({
    name: "Rizky Ramadhan",
    completedCourses: 4,
    quizScoreAvg: 85,
    assessmentScore: 78,
    skills: {
      technical: 80,
      communication: 65,
      problemSolving: 90,
      leadership: 40
    }
  });

  // Fungsi Simulasi AI Analysis (Layer 3)
  const runAiAnalysis = async () => {
    setIsAnalysing(true);
    const systemPrompt = "Anda adalah pakar karir digital. Analisis data mahasiswa berikut dan berikan saran karir dalam 3 poin singkat di Bahasa Indonesia.";
    const userQuery = `Nama: ${userStats.name}, Skor Technical: ${userStats.skills.technical}, Communication: ${userStats.skills.communication}, Problem Solving: ${userStats.skills.problemSolving}. Dia ingin jadi Software Engineer.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });
      const data = await response.json();
      setAiResult(data.candidates?.[0]?.content?.parts?.[0]?.text || "Analisis selesai. Fokuslah pada skill komunikasi.");
    } catch (error) {
      setAiResult("Gagal terhubung ke AI Engine. Namun berdasarkan data, kamu kuat di Problem Solving!");
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2 text-indigo-600">
          <BrainCircuit size={28} />
          <h1 className="text-xl font-bold tracking-tight">SmartLMS</h1>
        </div>
        
        <nav className="flex flex-col gap-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" id="dashboard" active={activeTab} onClick={setActiveTab} />
          <NavItem icon={BookOpen} label="Course Mode" id="lms" active={activeTab} onClick={setActiveTab} />
          <NavItem icon={Target} label="Direct Assessment" id="assessment" active={activeTab} onClick={setActiveTab} />
          <NavItem icon={BarChart3} label="Analytics AI" id="analytics" active={activeTab} onClick={setActiveTab} />
        </nav>

        <div className="mt-auto bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-700 uppercase mb-1">Employability Score</p>
          <div className="text-2xl font-black text-indigo-900">78%</div>
          <p className="text-[10px] text-indigo-600">Top 10% di angkatanmu</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-slate-500 text-sm">Welcome back, {userStats.name}!</p>
          </div>
          <div className="h-10 w-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
        </header>

        {/* LAYER 1: COURSE MODE */}
        {activeTab === 'lms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CourseCard title="Introduction to React" progress={80} modules="12" />
            <CourseCard title="UI/UX Design Masterclass" progress={30} modules="8" />
            <CourseCard title="Node.js Backend Essentials" progress={0} modules="15" />
          </div>
        )}

        {/* LAYER 2: DIRECT ASSESSMENT */}
        {activeTab === 'assessment' && (
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Siap untuk Sertifikasi?</h3>
            <p className="text-slate-500 mb-6 text-sm">Ambil ujian langsung tanpa harus mengikuti kursus. Validasi skillmu untuk industri.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-slate-50 transition-all text-left group">
                <p className="text-xs font-bold text-slate-400 uppercase">Tes Penempatan</p>
                <p className="font-bold group-hover:text-indigo-600">Frontend Entry Level</p>
              </button>
              <button className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-500 hover:bg-slate-50 transition-all text-left group">
                <p className="text-xs font-bold text-slate-400 uppercase">Sertifikasi Internal</p>
                <p className="font-bold group-hover:text-indigo-600">Basic Database Admin</p>
              </button>
            </div>
          </div>
        )}

        {/* LAYER 3: ANALYTICS ENGINE */}
        {activeTab === 'analytics' || activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Skill Bars */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="font-bold mb-6 flex items-center gap-2"><BarChart3 size={18}/> Skill Proficiency</h3>
                <div className="space-y-4">
                  <SkillProgress label="Technical Skills" value={userStats.skills.technical} color="bg-blue-500" />
                  <SkillProgress label="Communication" value={userStats.skills.communication} color="bg-emerald-500" />
                  <SkillProgress label="Problem Solving" value={userStats.skills.problemSolving} color="bg-purple-500" />
                  <SkillProgress label="Leadership" value={userStats.skills.leadership} color="bg-orange-500" />
                </div>
              </div>

              {/* AI Recommendation Box */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl text-white shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg"><Sparkles size={20} /></div>
                    <h3 className="font-bold">AI Career Advisor</h3>
                  </div>
                  
                  {isAnalysing ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="animate-spin mb-2" />
                      <p className="text-xs opacity-80 italic">Menganalisis performamu...</p>
                    </div>
                  ) : aiResult ? (
                    <p className="text-sm leading-relaxed opacity-90 mb-4 whitespace-pre-line">
                      {aiResult}
                    </p>
                  ) : (
                    <p className="text-sm opacity-80 mb-4">Klik tombol di bawah untuk mendapatkan rekomendasi karir cerdas berdasarkan hasil belajarmu.</p>
                  )}
                </div>
                
                <button 
                  onClick={runAiAnalysis}
                  disabled={isAnalysing}
                  className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl shadow-md hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isAnalysing ? "Processing..." : "Generate AI Advice"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const NavItem = ({ icon: Icon, label, id, active, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active === id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const CourseCard = ({ title, progress, modules }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-4">
      <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
        <PlayCircle size={24} />
      </div>
      <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-500 uppercase">{modules} Modules</span>
    </div>
    <h4 className="font-bold text-slate-800 mb-4">{title}</h4>
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Progress</span>
        <span className="font-bold">{progress}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  </div>
);

const SkillProgress = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="font-medium text-slate-600">{label}</span>
      <span className="font-bold text-slate-900">{value}%</span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

export default App;