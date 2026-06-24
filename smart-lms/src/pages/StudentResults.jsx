import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { 
  Search, UserCheck, BarChart, GraduationCap, 
  ChevronUp, ChevronDown, X, Sparkles, 
  Calendar, Briefcase, ChevronsUpDown, BookOpen
} from 'lucide-react';
import { FileSpreadsheet } from 'lucide-react'; 
import { exportAssessmentToExcel } from '../utils/excelExport';

// ══════════════════════════════════════════════════════════════════
// 💡 UTILITY FUNCTIONS FOR EXTRACTING AND PARSING AI TEXT
// ══════════════════════════════════════════════════════════════════

// 1. Membersihkan teks rangkuman agar murni berisi narasi rekomendasi saja
const getPureSummary = (fullText) => {
  if (!fullText) return "";
  return fullText.replace(/<kecocokan>[\s\S]*?<\/kecocokan>/g, "").trim();
};

// 2. Memecah string tabel Markdown di dalam <kecocokan> menjadi array objek
const extractKecocokanData = (fullText) => {
  if (!fullText) return [];
  
  const match = fullText.match(/<kecocokan>([\s\S]*?)<\/kecocokan>/);
  if (!match || !match[1]) return [];

  const tableText = match[1].trim();
  const lines = tableText.split("\n");
  const dataRows = [];
  
  lines.forEach((line) => {
    if (line.includes("|") && !line.includes("---") && !line.toLowerCase().includes("kompetensi")) {
      const columns = line.split("|").map(col => col.trim()).filter(Boolean);
      if (columns.length >= 3) {
        dataRows.push({
          kompetensi: columns[0],
          skorAktual: columns[1],
          skorTarget: columns[2],
          gap: columns[3] || "0"
        });
      }
    }
  });
  
  return dataRows;
};

// ══════════════════════════════════
// KOMPONEN MODAL RANGKUMAN AI
// ══════════════════════════════════
const AISummaryModal = ({ student, onClose }) => {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      setIsLoading(true);
      try {
        const summaryRef = doc(db, "ai_summaries", student.id);
        const snap = await getDoc(summaryRef);

        if (snap.exists() && snap.data().summary) {
          // Bersihkan modal pop-up agar hanya menampilkan teks narasi saja
          setSummary(getPureSummary(snap.data().summary));
          const ts = snap.data().generatedAt;
          setGeneratedAt(ts?.toDate?.() || null);
        } else {
          setSummary("");
        }
      } catch (e) {
        console.error("Gagal load rangkuman:", e);
        setSummary("error");
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [student.id]);

  const skills = student.skills || {};

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-800">{student.fullName || student.name}</h3>
            <p className="text-sm text-indigo-600 font-medium mt-0.5">🎯 {student.targetJob || "Belum ditentukan"}</p>
            <p className="text-xs text-slate-400 mt-0.5">{student.className ? `🏫 ${student.className}` : "Belum masuk kelas"}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={20} className="text-slate-500" /></button>
        </div>

        {/* Skill Scores */}
        {Object.keys(skills).length > 0 && (
          <div className="p-6 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-4">Skor Skill</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(skills).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center gap-2 flex-1 ml-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((val / 5) * 100, 100)}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 min-w-5 text-right">{val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rangkuman AI */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-indigo-600" />
            <p className="text-xs font-bold text-slate-400 uppercase">Rangkuman AI</p>
            {generatedAt && (
              <span className="ml-auto text-[10px] text-slate-400">
                {generatedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          {isLoading && (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-slate-100 rounded-full w-full" />
              <div className="h-3 bg-slate-100 rounded-full w-5/6" />
              <div className="h-3 bg-slate-100 rounded-full w-4/6" />
            </div>
          )}

          {!isLoading && summary === "error" && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center"><p className="text-sm text-red-500">Gagal memuat rangkuman.</p></div>
          )}

          {!isLoading && summary === "" && (
            <div className="p-6 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <p className="text-amber-600 font-semibold text-sm">⚠️ Rangkuman belum tersedia</p>
              <p className="text-amber-500 text-xs mt-1">Mahasiswa ini belum melakukan analisis AI di Dashboard mereka.</p>
            </div>
          )}

          {!isLoading && summary && summary !== "error" && (
            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════
const StudentResults = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [aiSummaries, setAiSummaries] = useState({}); // State menampung cache dokumen rangkuman AI
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassCode, setFilterClassCode] = useState("");
  const [filterTargetJob, setFilterTargetJob] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Sorting State
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  // 1. Ambil data kelas untuk list dropdown filter
  useEffect(() => {
    if (!user?.uid) return;
    const qClass = query(collection(db, "classes"), where("createdBy", "==", user.uid));
    const unsubscribe = onSnapshot(qClass, (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // 2. Ambil data user mahasiswa secara Real-time & preload data ai_summaries
  useEffect(() => {
    if (!user?.uid || classes.length === 0) {
      setStudents([]);
      return;
    }

    const myClassCodes = classes.map(c => c.classCode).filter(Boolean);
    const q = query(collection(db, "users"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filteredMyStudents = allStudents.filter(student => 
        myClassCodes.includes(student.classCode) && student.role !== 'admin' && student.role !== 'instructor'
      );
      
      setStudents(filteredMyStudents);

      // Preload data bimbingan AI secara real-time dari koleksi ai_summaries
      const unsubscribeSummaries = onSnapshot(collection(db, "ai_summaries"), (sumSnapshot) => {
        const summariesMap = {};
        sumSnapshot.docs.forEach(doc => {
          summariesMap[doc.id] = doc.data().summary || "";
        });
        setAiSummaries(summariesMap);
      });

      return () => unsubscribeSummaries();
    });

    return () => unsubscribe();
  }, [user?.uid, classes]);

  // Handler Sorting Klik
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortButton = ({ colKey }) => {
    if (sortKey !== colKey) return <ChevronsUpDown size={12} className="text-slate-300 ml-1 inline group-hover:text-slate-400" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-indigo-600 ml-1 inline" />
      : <ChevronDown size={12} className="text-indigo-600 ml-1 inline" />;
  };

  // LOGIKA FILTER & SORTING
  const processedStudents = students
    .filter(s => {
      const name = (s.fullName || s.name || "").toLowerCase();
      const target = (s.targetJob || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchSearch = name.includes(search) || target.includes(search);
      const matchClass = filterClassCode ? s.classCode === filterClassCode : true;
      const matchTarget = filterTargetJob ? target === filterTargetJob.toLowerCase() : true;

      const isDone = s.skills && Object.values(s.skills).some(val => val > 0);
      const matchStatus =
        filterStatus === 'all' ? true :
        filterStatus === 'done' ? isDone : !isDone;

      let matchDate = true;
      if (s.createdAt) {
        const createdDate = s.createdAt?.toDate?.() || new Date(s.createdAt);
        if (filterDateFrom) matchDate = createdDate >= new Date(filterDateFrom);
        if (filterDateTo) matchDate = matchDate && createdDate <= new Date(filterDateTo + 'T23:59:59');
      } else if (filterDateFrom || filterDateTo) {
        matchDate = false;
      }

      return matchSearch && matchClass && matchTarget && matchStatus && matchDate;
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortKey === 'name') {
        valA = (a.fullName || a.name || "").toLowerCase();
        valB = (b.fullName || b.name || "").toLowerCase();
      } else if (sortKey === 'targetJob') {
        valA = (a.targetJob || "").toLowerCase();
        valB = (b.targetJob || "").toLowerCase();
      } else if (sortKey === 'className') {
        valA = (a.className || "").toLowerCase();
        valB = (b.className || "").toLowerCase();
      } else if (sortKey === 'status') {
        valA = a.skills && Object.values(a.skills).some(val => val > 0) ? 1 : 0;
        valB = b.skills && Object.values(b.skills).some(val => val > 0) ? 1 : 0;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // ══════════════════════════════════════════════════════════════════
  // ✅ UPDATE LOGIKA HANDLER EXPORT EXCEL (TERPISAH STRUKTUR KOLOM)
  // ══════════════════════════════════════════════════════════════════
  const handleExportExcel = async () => {
    if (processedStudents.length === 0) {
      alert("⚠️ Tidak ada data mahasiswa hasil filter yang bisa di-export!");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = [];

      for (const student of processedStudents) {
        const fullSummaryText = aiSummaries[student.id] || "";
        
        // Memecah teks rangkuman dan data tabel gap secara terpisah
        const cleanSummary = getPureSummary(fullSummaryText) || "Belum melakukan analisis AI";
        const kecocokanList = extractKecocokanData(fullSummaryText);
        
        const gapAnalysisString = kecocokanList
          .map(r => `${r.kompetensi}: ${r.skorAktual}/${r.skorTarget} (Gap: ${r.gap})`)
          .join(" | ");

        const totalScoreValue = student.skills 
          ? Object.values(student.skills).reduce((sum, current) => sum + (parseInt(current) || 0), 0)
          : 0;

        exportData.push({
          studentName: student.fullName || student.name || "Anonymous",
          studentEmail: student.email || "-",
          className: student.className || "Belum Masuk Kelas",
          totalScore: totalScoreValue,
          voiceScore: student.voiceScore || 0, 
          dominantAspect: student.dominantAspect || "-",
          recommendedJob: student.targetJob || "Belum ditentukan",
          // 💡 REVISI EXCEL: Data dipisah ke dalam 2 kolom yang berbeda
          gapAnalysisAI: gapAnalysisString || "Belum dianalisis",
          aiExplanation: cleanSummary
        });
      }

      const currentClassObj = classes.find(c => c.classCode === filterClassCode);
      const currentClassName = currentClassObj ? currentClassObj.className : "Semua_Kelas";

      exportAssessmentToExcel(exportData, `Asesmen_${currentClassName}`);
    } catch (error) {
      console.error("Gagal melakukan eksport excel:", error);
      alert("❌ Terjadi kesalahan saat memproses file Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  const uniqueTargetJobs = [...new Set(students.map(s => s.targetJob).filter(Boolean))];
  const totalDone = students.filter(s => s.skills && Object.values(s.skills).some(val => val > 0)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {selectedStudent && <AISummaryModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><GraduationCap size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Mahasiswa</p>
            <h3 className="text-2xl font-black text-slate-800">{students.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><UserCheck size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Sudah Assessment</p>
            <h3 className="text-2xl font-black text-slate-800">{totalDone}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><BarChart size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Hasil Filter</p>
            <h3 className="text-2xl font-black text-slate-800">{processedStudents.length}</h3>
          </div>
        </div>
      </div>

      {/* Filter Row Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Panel Kontrol & Filter</p>
          
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-100"
          >
            <FileSpreadsheet size={16} />
            {isExporting ? "Memproses..." : "Export ke Excel"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text" placeholder="Cari nama..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
              value={filterClassCode}
              onChange={(e) => setFilterClassCode(e.target.value)}
            >
              <option value="">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.classCode}>{c.className}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none"
              value={filterTargetJob}
              onChange={(e) => setFilterTargetJob(e.target.value)}
            >
              <option value="">Semua Target Karir</option>
              {uniqueTargetJobs.map(job => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="date"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="date"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Semua Status' },
              { key: 'done', label: '✅ Sudah Assessment' },
              { key: 'pending', label: '⏳ Belum Assessment' },
            ].map(opt => (
              <button
                key={opt.key} onClick={() => setFilterStatus(opt.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterStatus === opt.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {(searchTerm || filterClassCode || filterTargetJob || filterStatus !== 'all' || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => {
                setSearchTerm(""); setFilterClassCode(""); setFilterTargetJob("");
                setFilterStatus("all"); setFilterDateFrom(""); setFilterDateTo("");
              }}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all"
            >
              ✕ Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart size={20} className="text-indigo-600" />
            Monitoring User
            <span className="ml-2 bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">{processedStudents.length} user terpilih</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b">
              <tr>
                {[
                  { key: 'name', label: 'Nama Lengkap' },
                  { key: 'className', label: 'Kelas' },
                  { key: 'targetJob', label: 'Target Karir' },
                  { key: 'status', label: 'Status' },
                ].map(col => (
                  <th
                    key={col.key}
                    className="px-6 py-4 text-left cursor-pointer hover:bg-slate-100 select-none group transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center">
                      {col.label}
                      <SortButton colKey={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-left text-[10px] tracking-widest text-slate-500">Total Skor</th>
                <th className="px-6 py-4 text-left text-[10px] tracking-widest text-slate-500">Analisis Kecocokan (Gap AI)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {processedStudents.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Tidak ada data user yang sesuai dengan filter.</td></tr>
              ) : (
                processedStudents.map((student) => {
                  const isDone = student.skills && Object.values(student.skills).some(val => val > 0);
                  
                  // Mengambil data string analisis mentah dari state real-time cache
                  const fullSummaryText = aiSummaries[student.id] || "";
                  const kecocokanRows = extractKecocokanData(fullSummaryText);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{student.fullName || student.name}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-indigo-600">{student.className || <span className="text-slate-300 font-normal">Belum Join</span>}</td>
                      <td className="px-6 py-4 text-slate-500 italic text-xs">{student.targetJob || "Belum diisi"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide uppercase ${isDone ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                          {isDone ? '✅ Selesai' : '⏳ Belum'}
                        </span>
                      </td>

                      {/* KOLOM BARU: TOTAL SKOR */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">
                        {Object.values(student.skills || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(1)}
                      </td>

                      {/* 💡 RENDER ISI KOLOM BARU: MINI WORKSPACE TABLE UNTUK GAP ANALYSIS */}
                      <td className="px-6 py-4">
                        {kecocokanRows.length === 0 ? (
                          <div className="max-w-xs max-h-24 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50 text-[10px] space-y-1 font-medium shadow-inner">
                            <div className="grid grid-cols-2 font-bold text-slate-400 border-b pb-1 mb-1 uppercase tracking-wider text-[8px]">
                              <span>Aspek</span>
                              <span className="text-right">Skor Aktual</span>
                            </div>
                            {Object.entries(student.skills || {}).map(([k, v], idx) => (
                              <div key={idx} className="grid grid-cols-2 text-slate-600 border-b border-slate-100/50 last:border-0 py-0.5">
                                <span className="truncate font-semibold text-slate-700 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="text-right font-mono font-bold text-slate-500">{v}</span>
                              </div>
                            ))}
                            <div className="text-[8px] text-amber-500 italic mt-1 pt-1 border-t text-center">User belum menjalankan Analisis AI</div>
                          </div>
                        ) : (
                          <div className="max-w-xs max-h-24 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50 text-[10px] space-y-1 font-medium shadow-inner">
                            <div className="grid grid-cols-3 font-bold text-slate-400 border-b pb-1 mb-1 uppercase tracking-wider text-[8px]">
                              <span>Aspek</span>
                              <span className="text-center">Skor (Akt/Tar)</span>
                              <span className="text-right">Gap</span>
                            </div>
                            {kecocokanRows.map((row, idx) => (
                              <div key={idx} className="grid grid-cols-3 text-slate-600 border-b border-slate-100/50 last:border-0 py-0.5">
                                <span className="truncate font-semibold text-slate-700 capitalize">{row.kompetensi}</span>
                                <span className="text-center font-mono font-bold text-slate-500">{row.skorAktual} / {row.skorTarget}</span>
                                <span className={`text-right font-mono font-black ${parseFloat(row.gap) < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {parseFloat(row.gap) > 0 ? `+${row.gap}` : row.gap}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <Sparkles size={12} /> Rangkuman AI
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;