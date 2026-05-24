import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { 
  Search, UserCheck, BarChart, GraduationCap, 
  ChevronUp, ChevronDown, X, Sparkles, 
  Calendar, Briefcase, ChevronsUpDown 
} from 'lucide-react';

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
        // ✅ Ambil dari Firestore collection ai_summaries
        const summaryRef = doc(db, "ai_summaries", student.id);
        const snap = await getDoc(summaryRef);

        if (snap.exists() && snap.data().summary) {
          setSummary(snap.data().summary);
          // Konversi Firestore timestamp ke Date
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
            <h3 className="text-lg font-black text-slate-800">
              {student.fullName || student.name}
            </h3>
            <p className="text-sm text-indigo-600 font-medium mt-0.5">
              🎯 {student.targetJob || "Belum ditentukan"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {student.education || ""}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Skill Scores */}
        {Object.keys(skills).length > 0 && (
          <div className="p-6 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-4">Skor Skill</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(skills).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="flex items-center gap-2 flex-1 ml-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min((val / 5) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 min-w-5 text-right">
                      {val}
                    </span>
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
                {generatedAt.toLocaleDateString('id-ID', { 
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-2 animate-pulse">
              <div className="h-3 bg-slate-100 rounded-full w-full" />
              <div className="h-3 bg-slate-100 rounded-full w-5/6" />
              <div className="h-3 bg-slate-100 rounded-full w-4/6" />
              <div className="h-3 bg-slate-100 rounded-full w-full mt-2" />
              <div className="h-3 bg-slate-100 rounded-full w-3/4" />
            </div>
          )}

          {/* Error */}
          {!isLoading && summary === "error" && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
              <p className="text-sm text-red-500">Gagal memuat rangkuman.</p>
            </div>
          )}

          {/* Belum ada rangkuman */}
          {!isLoading && summary === "" && (
            <div className="p-6 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <p className="text-amber-600 font-semibold text-sm">
                ⚠️ Rangkuman belum tersedia
              </p>
              <p className="text-amber-500 text-xs mt-1">
                Mahasiswa ini belum melakukan analisis AI di Dashboard mereka.
              </p>
            </div>
          )}

          {/* Rangkuman tersedia */}
          {!isLoading && summary && summary !== "error" && (
            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
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
const StudentResults = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filter State
  const [filterTargetJob, setFilterTargetJob] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | done | pending
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Sorting State
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "user"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // ══════════════════════════════════
  // SORTING HANDLER
  // ══════════════════════════════════
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ChevronsUpDown size={12} className="text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-indigo-600" />
      : <ChevronDown size={12} className="text-indigo-600" />;
  };

  // ══════════════════════════════════
  // FILTER & SORT LOGIC
  // ══════════════════════════════════
  const processedStudents = students
    .filter(s => {
      const name = (s.fullName || s.name || "").toLowerCase();
      const target = (s.targetJob || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchSearch = name.includes(search) || target.includes(search);

      const matchTarget = filterTargetJob
        ? target.includes(filterTargetJob.toLowerCase())
        : true;

      const isDone = s.skills && Object.keys(s.skills).length > 0;
      const matchStatus =
        filterStatus === 'all' ? true :
        filterStatus === 'done' ? isDone :
        !isDone;

      // Filter tanggal berdasarkan createdAt
      let matchDate = true;
      if (filterDateFrom && s.createdAt) {
        const createdDate = s.createdAt?.toDate?.() || new Date(s.createdAt);
        matchDate = createdDate >= new Date(filterDateFrom);
      }
      if (filterDateTo && s.createdAt) {
        const createdDate = s.createdAt?.toDate?.() || new Date(s.createdAt);
        matchDate = matchDate && createdDate <= new Date(filterDateTo + 'T23:59:59');
      }

      return matchSearch && matchTarget && matchStatus && matchDate;
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortKey === 'name') {
        valA = (a.fullName || a.name || "").toLowerCase();
        valB = (b.fullName || b.name || "").toLowerCase();
      } else if (sortKey === 'targetJob') {
        valA = (a.targetJob || "").toLowerCase();
        valB = (b.targetJob || "").toLowerCase();
      } else if (sortKey === 'status') {
        valA = a.skills && Object.keys(a.skills).length > 0 ? 1 : 0;
        valB = b.skills && Object.keys(b.skills).length > 0 ? 1 : 0;
      } else if (sortKey === 'education') {
        valA = (a.education || "").toLowerCase();
        valB = (b.education || "").toLowerCase();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  // Daftar target job unik untuk dropdown filter
  const uniqueTargetJobs = [...new Set(students.map(s => s.targetJob).filter(Boolean))];
  const totalDone = students.filter(s => s.skills && Object.keys(s.skills).length > 0).length;

  return (
    <div className="space-y-6">

      {/* Modal Rangkuman AI */}
      {selectedStudent && (
        <AISummaryModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Mahasiswa</p>
            <h3 className="text-2xl font-black text-slate-800">{students.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Sudah Assessment</p>
            <h3 className="text-2xl font-black text-slate-800">{totalDone}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-2xl text-amber-600">
            <BarChart size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Hasil Filter</p>
            <h3 className="text-2xl font-black text-slate-800">{processedStudents.length}</h3>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <p className="text-xs font-bold text-slate-400 uppercase mb-4">Filter & Pencarian</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Search Nama */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama mahasiswa..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Target Karir */}
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

          {/* Filter Tanggal Dari */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="date"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>

          {/* Filter Tanggal Sampai */}
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

        {/* Filter Status */}
        <div className="flex gap-2 mt-4">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'done', label: '✅ Sudah Assessment' },
            { key: 'pending', label: '⏳ Belum Assessment' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilterStatus(opt.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all
                ${filterStatus === opt.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              {opt.label}
            </button>
          ))}

          {/* Reset Filter */}
          {(searchTerm || filterTargetJob || filterStatus !== 'all' || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterTargetJob("");
                setFilterStatus("all");
                setFilterDateFrom("");
                setFilterDateTo("");
              }}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all ml-auto"
            >
              ✕ Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart size={20} className="text-indigo-600" />
            Monitoring User
            <span className="ml-2 bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {processedStudents.length} user
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                {/* Header dengan Sorting */}
                {[
                  { key: 'name', label: 'Nama Lengkap' },
                  { key: 'targetJob', label: 'Target Karir' },
                  { key: 'education', label: 'Pendidikan' },
                  { key: 'status', label: 'Status' },
                ].map(col => (
                  <th
                    key={col.key}
                    className="px-6 py-4 text-left cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon colKey={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-center">Rangkuman AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {processedStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada mahasiswa yang sesuai filter
                  </td>
                </tr>
              ) : (
                processedStudents.map((student) => {
                  const isDone = student.skills && Object.keys(student.skills).length > 0;
                  return (
                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {student.fullName || student.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 italic">
                        {student.targetJob || "Belum ditentukan"}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {student.education || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {isDone ? (
                          <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-bold text-[10px]">
                            ✅ SELESAI
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full font-bold text-[10px]">
                            ⏳ BELUM
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                        >
                          <Sparkles size={12} />
                          Rangkuman AI
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