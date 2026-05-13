import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Search, UserCheck, BarChart, ChevronRight, GraduationCap } from 'lucide-react';

const StudentResults = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 1. Ambil data user dengan role 'user'
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "user"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const filteredStudents = students.filter(s => 
    (s.fullName || s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.targetJob || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><GraduationCap size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Mahasiswa</p>
            <h3 className="text-xl font-black text-slate-800">{students.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><UserCheck size={24}/></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Sudah Asesmen</p>
            <h3 className="text-xl font-black text-slate-800">
              {students.filter(s => s.skills?.technical > 0).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Main List & Search */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart size={20} className="text-indigo-600" />
            Monitoring Progress Mahasiswa
          </h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau target karir..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">Nama Lengkap</th>
                <th className="px-6 py-4 text-left">Target Karir</th>
                <th className="px-6 py-4 text-left">Pendidikan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-700">{student.fullName || student.name}</td>
                  <td className="px-6 py-4 text-slate-500 italic">{student.targetJob || "Belum ditentukan"}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{student.education}</td>
                  <td className="px-6 py-4 text-center">
                    {student.skills?.technical > 0 ? (
                      <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-bold text-[10px]">SELESAI</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full font-bold text-[10px]">BELUM</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => alert(`Review detail untuk: ${student.fullName}`)}
                      className="text-indigo-600 hover:bg-indigo-600 hover:text-white p-2 rounded-lg transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;