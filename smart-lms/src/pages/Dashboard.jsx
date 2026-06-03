import React from 'react';
import { Sparkles, Download, BrainCircuit, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import MarkdownRenderer from '../components/MarkdownRenderer';

const jobStandards = {
  "software-eng": {
    technical: 5,
    communication: 3.5,
    problemSolving: 5,
    leadership: 3,
    teamwork: 4,
    emotionalIntel: 3.5,
    digitalLiteracy: 4.5,
    criticalThinking: 4.5,
    attentionDetail: 4.5,
    workEthic: 4.5,
  },
  "data-analyst": {
    technical: 4,
    communication: 4,
    problemSolving: 5,
    leadership: 3,
    teamwork: 4,
    emotionalIntel: 3.5,
    digitalLiteracy: 5,
    criticalThinking: 5,
    attentionDetail: 5,
    workEthic: 4.5,
  },
  "uiux": {
    technical: 4,
    communication: 4,
    problemSolving: 4,
    leadership: 3,
    teamwork: 4.5,
    emotionalIntel: 4,
    digitalLiteracy: 4.5,
    criticalThinking: 4.5,
    attentionDetail: 5,
    workEthic: 4.5,
  },
  "marketing": {
    technical: 3,
    communication: 5,
    problemSolving: 4,
    leadership: 4,
    teamwork: 4.5,
    emotionalIntel: 4.8,
    digitalLiteracy: 4,
    criticalThinking: 4,
    attentionDetail: 3.5,
    workEthic: 4.5,
  },
  "frontend": { // Front Office / Customer Service
    technical: 2.5,
    communication: 5,
    problemSolving: 3.5,
    leadership: 3.5,
    teamwork: 4.5,
    emotionalIntel: 4.8,
    digitalLiteracy: 3.5,
    criticalThinking: 3.5,
    attentionDetail: 4,
    workEthic: 4.8,
  },
  "admin": { // Administrative Assistant
    technical: 3.5,
    communication: 4,
    problemSolving: 3.5,
    leadership: 3,
    teamwork: 4,
    emotionalIntel: 4,
    digitalLiteracy: 4.5,
    criticalThinking: 3.5,
    attentionDetail: 5,
    workEthic: 4.8,
  },
  "default": {
    technical: 3.5,
    communication: 3.5,
    problemSolving: 3.5,
    leadership: 3.5,
    teamwork: 3.5,
    emotionalIntel: 3.5,
    digitalLiteracy: 3.5,
    criticalThinking: 3.5,
    attentionDetail: 3.5,
    workEthic: 3.5,
  }
};

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
const parseAiResult = (text) => {
  if (!text) return null;

  // 1. Try to extract with XML tags
  const extractTag = (tag) => {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  const kecocokan = extractTag('kecocokan');
  const rekomendasi = extractTag('rekomendasi');
  const keselarasan = extractTag('keselarasan');

  if (kecocokan || rekomendasi || keselarasan) {
    return {
      kecocokan: kecocokan || '',
      rekomendasi: rekomendasi || '',
      keselarasan: keselarasan || '',
      hasTags: true
    };
  }

  // 2. Fallback: Parse headings manually
  const sections = {
    kecocokan: '',
    rekomendasi: '',
    keselarasan: '',
    hasTags: false
  };

  const lines = text.split('\n');
  let currentKey = null;
  let currentContent = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
      if (currentKey) {
        sections[currentKey] = currentContent.join('\n').trim();
        currentContent = [];
      }

      const lower = trimmed.toLowerCase();
      if (lower.includes('kecocokan') || lower.includes('tabel') || lower.includes('1.')) {
        currentKey = 'kecocokan';
      } else if (lower.includes('rekomendasi') || lower.includes('skill') || lower.includes('2.')) {
        currentKey = 'rekomendasi';
      } else if (lower.includes('keselarasan') || lower.includes('karir') || lower.includes('3.')) {
        currentKey = 'keselarasan';
      } else {
        if (!currentKey) currentKey = 'kecocokan';
        currentContent.push(line);
      }
    } else {
      if (!currentKey) {
        currentKey = 'kecocokan';
      }
      currentContent.push(line);
    }
  }

  if (currentKey) {
    sections[currentKey] = currentContent.join('\n').trim();
  }

  if (sections.kecocokan && (sections.rekomendasi || sections.keselarasan)) {
    return sections;
  }

  return {
    kecocokan: text,
    rekomendasi: '',
    keselarasan: '',
    hasTags: false,
    isFallbackFull: true
  };
};

const Dashboard = ({ user, runAiAnalysis, aiResult, isAnalysing, setActiveTab, setProfileAction }) => {
  const [activeReportTab, setActiveReportTab] = React.useState('kecocokan');

  const parsedResult = React.useMemo(() => {
    return parseAiResult(aiResult);
  }, [aiResult]);

  const reportTabs = React.useMemo(() => {
    if (!parsedResult) return [];
    if (parsedResult.isFallbackFull) {
      return [{ id: 'kecocokan', label: 'Laporan Lengkap', content: parsedResult.kecocokan }];
    }
    return [
      { id: 'kecocokan', label: '📊 Kesesuaian Kompetensi', content: parsedResult.kecocokan },
      { id: 'rekomendasi', label: '💡 Peningkatan Skill', content: parsedResult.rekomendasi },
      { id: 'keselarasan', label: '🎯 Keselarasan Karir', content: parsedResult.keselarasan },
    ].filter(tab => tab.content);
  }, [parsedResult]);

  React.useEffect(() => {
    if (reportTabs.length > 0) {
      const exists = reportTabs.some(t => t.id === activeReportTab);
      if (!exists) {
        setActiveReportTab(reportTabs[0].id);
      }
    }
  }, [reportTabs, activeReportTab]);

  const toPercent = (val) => (val ? val * 20 : 0);
  const targetJob = user?.targetJob || 'default';
  const standards = jobStandards[targetJob] || jobStandards['default'];

  const skillsData = React.useMemo(() => {
    return [
      { subject: 'Technical',     A: toPercent(user?.skills?.technical),            B: toPercent(standards.technical),            rawA: user?.skills?.technical || 0, rawB: standards.technical },
      { subject: 'Comm.',         A: toPercent(user?.skills?.communication),         B: toPercent(standards.communication),         rawA: user?.skills?.communication || 0, rawB: standards.communication },
      { subject: 'Prob. Solving', A: toPercent(user?.skills?.problemSolving),        B: toPercent(standards.problemSolving),        rawA: user?.skills?.problemSolving || 0, rawB: standards.problemSolving },
      { subject: 'Leadership',    A: toPercent(user?.skills?.leadership),            B: toPercent(standards.leadership),            rawA: user?.skills?.leadership || 0, rawB: standards.leadership },
      { subject: 'Teamwork',      A: toPercent(user?.skills?.teamwork),              B: toPercent(standards.teamwork),              rawA: user?.skills?.teamwork || 0, rawB: standards.teamwork },
      { subject: 'Emotional',     A: toPercent(user?.skills?.emotionalIntel),        B: toPercent(standards.emotionalIntel),        rawA: user?.skills?.emotionalIntel || 0, rawB: standards.emotionalIntel },
      { subject: 'Digital',       A: toPercent(user?.skills?.digitalLiteracy),       B: toPercent(standards.digitalLiteracy),       rawA: user?.skills?.digitalLiteracy || 0, rawB: standards.digitalLiteracy },
      { subject: 'Critical',      A: toPercent(user?.skills?.criticalThinking),      B: toPercent(standards.criticalThinking),      rawA: user?.skills?.criticalThinking || 0, rawB: standards.criticalThinking },
      { subject: 'Detail',        A: toPercent(user?.skills?.attentionDetail),       B: toPercent(standards.attentionDetail),       rawA: user?.skills?.attentionDetail || 0, rawB: standards.attentionDetail },
      { subject: 'Ethics',        A: toPercent(user?.skills?.workEthic),             B: toPercent(standards.workEthic),             rawA: user?.skills?.workEthic || 0, rawB: standards.workEthic },
    ];
  }, [user?.skills, standards]);

  const handleDownloadPdf = () => {
    if (!aiResult) {
      alert("Silakan jalankan Smart Analysis AI terlebih dahulu sebelum mencetak Career Roadmap Anda!");
      return;
    }
    window.print();
  };

  const milestones = [
    {
      id: 1,
      title: "Asesmen Awal (PG)",
      desc: "Menyelesaikan tes tertulis pilihan ganda untuk pemetaan awal 10 aspek kompetensi.",
      isCompleted: !!(user?.skills && Object.values(user.skills).some(val => val > 0)),
      action: () => setActiveTab('assessment'),
      label: "Mulai Tes PG",
    },
    {
      id: 2,
      title: "AI Voice Interview",
      desc: "Menyelesaikan simulasi wawancara verbal interaktif menggunakan mikrofon & AI Voice.",
      isCompleted: !!(user?.skills?.communication && user.skills.communication > 0),
      action: () => setActiveTab('assessment'),
      label: "Mulai Wawancara",
    },
    {
      id: 3,
      title: "Portofolio Proyek",
      desc: "Mengunggah link hasil karya proyek aplikasi di halaman profil.",
      isCompleted: !!(user?.projects && user.projects.length > 0),
      action: () => {
        setActiveTab('profile');
        if (setProfileAction) setProfileAction('add_project');
      },
      label: "Unggah Proyek",
    },
    {
      id: 4,
      title: "Sertifikasi Kompetensi",
      desc: "Mengunggah sertifikasi kompetensi pendukung di halaman profil.",
      isCompleted: !!(user?.certifications && user.certifications.length > 0),
      action: () => {
        setActiveTab('profile');
        if (setProfileAction) setProfileAction('add_certification');
      },
      label: "Unggah Sertifikat",
    },
    {
      id: 5,
      title: "Smart Analysis AI",
      desc: "Menjalankan rekomendasi AI Career Expert untuk memetakan gap kesiapan karir.",
      isCompleted: !!aiResult,
      action: runAiAnalysis,
      label: "Mulai Analisis AI",
    }
  ];

  const completedCount = milestones.filter(m => m.isCompleted).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);
  const activeNodeIndex = milestones.findIndex(m => !m.isCompleted);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl text-white shadow-lg border border-slate-800/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Student Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat datang kembali, {user.fullName || user.name}! 👋
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Karir Impian: <span className="text-indigo-400 font-bold capitalize">{user.targetJob ? user.targetJob.replace('-', ' ') : 'Belum ditentukan'}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl backdrop-blur-md">
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                <circle cx="32" cy="32" r="28" className="stroke-indigo-500" strokeWidth="6" fill="transparent"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-black text-indigo-400">{progressPercent}%</span>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Employability Score</p>
              <p className="text-slate-200 text-xs font-semibold">{completedCount} dari 5 Milestone Selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Career Roadmap (Horizontal Timeline) */}
      <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-100">
        <div className="flex items-center gap-3.5 mb-8">
          <span className="flex p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <Trophy size={22} />
          </span>
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg">Peta Jalan Kesiapan Karir</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">Lengkapi 5 milestone persiapan karir untuk mencapai kesiapan industri</p>
          </div>
        </div>

        {/* Timeline Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 relative">
          {/* Horizontal connecting line for desktop */}
          <div className="hidden md:block absolute top-[38px] left-[8%] right-[8%] h-[3px] bg-slate-100 z-0">
            <div 
              className="h-full bg-indigo-500 transition-all duration-700 ease-out"
              style={{ width: `${Math.max(0, (completedCount - 1) / (milestones.length - 1)) * 100}%` }}
            ></div>
          </div>

          {milestones.map((m, idx) => {
            const isActive = idx === activeNodeIndex;
            return (
              <div 
                key={m.id} 
                className={`relative z-10 flex flex-col justify-between p-5 bg-slate-50/50 rounded-2xl border transition-all min-h-[180px] hover:shadow-xs ${
                  m.isCompleted 
                    ? 'border-emerald-100 bg-emerald-50/5' 
                    : isActive 
                    ? 'border-indigo-500 bg-white ring-2 ring-indigo-50 shadow-xs' 
                    : 'border-slate-100 bg-slate-50/20 opacity-55'
                }`}
              >
                {/* Node Top: Circle and Badge */}
                <div className="flex justify-between items-center mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    m.isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {m.isCompleted ? <CheckCircle2 size={14} /> : m.id}
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    m.isCompleted 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {m.isCompleted ? "Selesai" : isActive ? "Aktif" : "Terkunci"}
                  </span>
                </div>

                {/* Node Middle: Title and Desc */}
                <div className="space-y-1 flex-1">
                  <h4 className={`text-sm sm:text-base font-extrabold truncate ${m.isCompleted ? 'text-slate-700' : isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3" title={m.desc}>
                    {m.desc}
                  </p>
                </div>

                {/* Node Bottom: Button */}
                <div className="mt-4">
                  {m.isCompleted ? (
                    <div className="w-full py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1 cursor-default">
                      <CheckCircle2 size={12} />
                      Selesai
                    </div>
                  ) : (
                    <button
                      onClick={m.action}
                      disabled={idx > activeNodeIndex}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed'
                      }`}
                    >
                      {m.label}
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Analysis Insight (Full Width, Wide Layout) */}
      <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-100 transition-all duration-300 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col space-y-5">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles size={16} className="animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">AI Expert Advisor</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-800">Smart Analysis Insight</h3>
            </div>

            <div className="flex gap-2">
              {aiResult && (
                <button 
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-xs"
                >
                  <Download size={12} />
                  Cetak PDF
                </button>
              )}
              <button 
                onClick={runAiAnalysis}
                disabled={isAnalysing}
                className="flex items-center justify-center p-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-600 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                title="Analisis Ulang"
              >
                <BrainCircuit size={16} className={isAnalysing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Mac-style Editor window for output presentation */}
          <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl flex flex-col overflow-hidden">
            {/* Editor Header dots & Tabs */}
            <div className="bg-slate-100/80 px-5 py-3 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/80 gap-3">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-xs"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-xs"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-xs"></span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">ADVISOR_REPORT.md</span>
              </div>
              
              {aiResult && reportTabs.length > 0 && (
                <div className="flex flex-wrap gap-1 bg-slate-200/60 p-1 rounded-xl border border-slate-200/40">
                  {reportTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveReportTab(tab.id)}
                      className={`px-3 py-1 text-[11px] font-bold transition-all cursor-pointer rounded-lg ${
                        activeReportTab === tab.id
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Editor Body */}
            <div className="p-6 max-h-[520px] overflow-y-auto custom-scrollbar text-xs leading-relaxed text-slate-700">
              {aiResult ? (
                <div className="space-y-4">
                  {reportTabs.map(tab => {
                    if (tab.id !== activeReportTab) return null;

                    if (tab.id === 'kecocokan') {
                      return (
                        <div key={tab.id} className="space-y-6 transition-opacity duration-300">
                          {/* Radar Chart & Gap Table Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                            {/* Radar Chart */}
                            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white border border-slate-200/60 rounded-2xl p-4 min-h-[260px] shadow-xs">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Grafik Radar Kompetensi</span>
                              <div className="w-full h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis
                                      dataKey="subject"
                                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 600 }}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                      name="Skor Aktual Anda"
                                      dataKey="A"
                                      stroke="#4f46e5"
                                      strokeWidth={2}
                                      fill="#4f46e5"
                                      fillOpacity={0.15}
                                    />
                                    <Radar
                                      name="Standar Industri"
                                      dataKey="B"
                                      stroke="#94a3b8"
                                      strokeWidth={1.5}
                                      strokeDasharray="3 3"
                                      fill="#64748b"
                                      fillOpacity={0.03}
                                    />
                                    <Legend verticalAlign="bottom" height={18} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 500, color: '#475569' }} />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Gap Table */}
                            <div className="lg:col-span-7 overflow-x-auto border border-slate-200/60 rounded-2xl bg-white shadow-xs">
                              <table className="min-w-full divide-y divide-slate-200 text-[10px]">
                                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                  <tr>
                                    <th className="px-3 py-2 text-left font-bold uppercase tracking-wider">Kompetensi</th>
                                    <th className="px-2 py-2 text-center font-bold uppercase tracking-wider">Aktual</th>
                                    <th className="px-2 py-2 text-center font-bold uppercase tracking-wider">Target</th>
                                    <th className="px-3 py-2 text-right font-bold uppercase tracking-wider">Status Gap</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                                  {skillsData.map((item, rIdx) => {
                                    const gap = item.A - item.B;
                                    const isRowEven = rIdx % 2 === 0;
                                    return (
                                      <tr key={item.subject} className={isRowEven ? "bg-slate-50/20" : "bg-white"}>
                                        <td className="px-3 py-1.5 font-bold text-slate-700">{item.subject}</td>
                                        <td className="px-2 py-1.5 text-center font-extrabold text-slate-900">{item.rawA}</td>
                                        <td className="px-2 py-1.5 text-center text-slate-500 font-semibold">{item.rawB}</td>
                                        <td className="px-3 py-1.5 text-right font-black">
                                          {gap < 0 ? (
                                            <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                                              {gap}% Gap
                                            </span>
                                          ) : (
                                            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                              ✓ Ready
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Text analysis markdown report below */}
                          {tab.content && (
                            <div className="border-t border-slate-200 pt-4">
                              <MarkdownRenderer content={tab.content} isDark={false} />
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={tab.id} className="transition-opacity duration-300">
                        <MarkdownRenderer content={tab.content} isDark={false} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-slate-400 py-8 space-y-4">
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-500 animate-pulse">
                    <Sparkles size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-800 font-extrabold text-sm">AI Analysis Report Ready</p>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[240px] mx-auto font-medium">
                      {isAnalysing ? "Sedang memproses analisis AI..." : "Selesaikan seluruh langkah peta jalan kesiapan karir di atas untuk membuka rekomendasi kustom Anda."}
                    </p>
                  </div>
                  
                  {!isAnalysing && (
                    <div className="pt-3 grid grid-cols-1 gap-2 text-left text-[10px] font-bold text-slate-500 max-w-[240px] mx-auto border-t border-slate-200 w-full">
                      <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 📊 Tabel Kualitatif Aktual vs Target</div>
                      <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 💡 Analisis Portofolio Proyek & Sertifikat</div>
                      <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 🎯 Alternatif Karir Yang Lebih Sesuai</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;