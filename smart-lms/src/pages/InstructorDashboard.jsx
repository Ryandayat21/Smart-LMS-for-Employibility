import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
// ✅ Tambahkan import 'where' dan 'query' dari firebase/firestore
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { School, Layers, Users, BarChart3, ArrowUpRight, Award, GraduationCap } from 'lucide-react';

const InstructorDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalPackages: 0,
    totalStudents: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [myClassCodes, setMyClassCodes] = useState([]);

  // 1. 🔍 QUERY KELAS & PAKET: Hanya ambil kelas & paket yang dibuat oleh instruktur ini
  useEffect(() => {
    if (!user?.uid) return;

    const qClasses = query(collection(db, "classes"), where("createdBy", "==", user.uid));
    const unsubscribeClasses = onSnapshot(qClasses, (classSnapshot) => {
      const codes = classSnapshot.docs.map(doc => doc.data().classCode).filter(Boolean);
      setMyClassCodes(codes);
      setStats(prev => ({ ...prev, totalClasses: classSnapshot.size }));
    });

    const qPackages = query(collection(db, "question_packages"), where("createdBy", "==", user.uid));
    const unsubscribePackages = onSnapshot(qPackages, (pkgSnapshot) => {
      setStats(prev => ({ ...prev, totalPackages: pkgSnapshot.size }));
    });

    return () => {
      unsubscribeClasses();
      unsubscribePackages();
    };
  }, [user?.uid]);

  // 2. 🔍 QUERY USER (MAHASISWA): Pantau mahasiswa dan filter dengan myClassCodes
  useEffect(() => {
    if (!user?.uid || myClassCodes.length === 0) {
      setStats(prev => ({ ...prev, totalStudents: 0 }));
      setRecentUsers([]);
      setIsLoading(false);
      return;
    }

    const qUsers = query(collection(db, "users"), where("role", "==", "user"));
    const unsubscribeUsers = onSnapshot(qUsers, (userSnapshot) => {
      const allStudents = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const filteredStudents = allStudents.filter(student => 
        myClassCodes.includes(student.classCode)
      );

      setStats(prev => ({ ...prev, totalStudents: filteredStudents.length }));
      
      // Sort berdasarkan data terbaru
      const sortedStudents = filteredStudents.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setRecentUsers(sortedStudents.slice(0, 5));
      setIsLoading(false);
    });

    return () => unsubscribeUsers();
  }, [user?.uid, myClassCodes]);

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500 font-medium">Memuat Analisis Dashboard... ⏳</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Ucapan Selamat Datang */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-lg shadow-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black tracking-tight">Selamat Datang Kembali, {user?.name || 'Instruktur'}! 👋</h1>
          <p className="text-indigo-100 text-sm font-medium">
            Pantau perkembangan kompetensi mahasiswa, kelola ruang kelas, dan perbarui paket ujian dalam satu tempat.
          </p>
        </div>
        <span className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <GraduationCap size={14} /> Instructor Panel
        </span>
      </div>

      {/* Grid Metrik Utama (Statistik Ringkas) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Total Kelas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kelas Dikelola</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalClasses}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <School size={24} />
          </div>
        </div>

        {/* Card 2: Total Paket Soal */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Paket Soal</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalPackages}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
            <Layers size={24} />
          </div>
        </div>

        {/* Card 3: Total Mahasiswa */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mahasiswa Terdaftar</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalStudents}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Seksi Konten Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiri: Daftar Mahasiswa yang Baru Bergabung */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Aktivitas Mahasiswa Terbaru</h3>
              <p className="text-slate-400 text-xs font-medium">Koleksi akun pendaftar teranyar di sistem kelas Anda.</p>
            </div>
            <BarChart3 className="text-slate-400" size={20} />
          </div>

          <div className="divide-y divide-slate-50 font-medium text-sm text-slate-600">
            {recentUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-400">Belum ada mahasiswa yang bergabung di kelas Anda.</div>
            ) : (
              recentUsers.map((student, idx) => (
                <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-indigo-600 border">
                      {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">{student.name || "Anonymous"}</div>
                      <div className="text-xs text-slate-400 font-normal">{student.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {student.className ? (
                      <span className="text-[11px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-md font-bold">
                        🏫 {student.className}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 font-normal">Belum Join Kelas</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kanan: Shortcut Tips */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl w-fit">
              <Award size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Tips Inkubasi Startup</h3>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                Pastikan setiap soal pilihan ganda di modul <strong>Kelola Soal</strong> sudah memiliki bobot skor unik 1-5 agar algoritma radar kompetensi AI dapat melakukan pembobotan kecocokan karier secara akurat.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Butuh bantuan sistem?</span>
            <span className="text-indigo-600 flex items-center gap-0.5 hover:underline cursor-pointer">
              Dokumentasi <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;