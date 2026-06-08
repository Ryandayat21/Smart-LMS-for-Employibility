import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock3,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const statCards = [
  { label: 'Total Pengguna', key: 'totalUsers', icon: Users, color: 'from-sky-500 to-indigo-600' },
  { label: 'Instruktur Aktif', key: 'totalInstructors', icon: GraduationCap, color: 'from-emerald-500 to-teal-600' },
  { label: 'Total Kelas', key: 'totalClasses', icon: BookOpen, color: 'from-violet-500 to-fuchsia-600' },
  { label: 'Pengajuan Instruktur', key: 'pendingApplications', icon: Clock3, color: 'from-amber-500 to-orange-600' },
];

const AdminDashboard = ({ user, setActiveTab }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstructors: 0,
    totalClasses: 0,
    pendingApplications: 0,
  });
  const [latestClasses, setLatestClasses] = useState([]);
  const [latestApplications, setLatestApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data());
      setStats((prev) => ({
        ...prev,
        totalUsers: snapshot.size,
        totalInstructors: users.filter((item) => item.role === 'instructor').length,
      }));
      setLoading(false);
    }, (err) => {
      console.error('Error loading users:', err);
      setLoading(false);
    });

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setStats((prev) => ({
        ...prev,
        totalClasses: snapshot.size,
      }));
    }, (err) => console.error('Error loading classes:', err));

    const qPending = query(collection(db, 'instructor_applications'), where('status', '==', 'pending'));
    const unsubPending = onSnapshot(qPending, (snapshot) => {
      setStats((prev) => ({
        ...prev,
        pendingApplications: snapshot.size,
      }));
    }, (err) => console.error('Error loading pending applications:', err));

    const qLatestClasses = query(collection(db, 'classes'), orderBy('createdAt', 'desc'), limit(4));
    const unsubLatestClasses = onSnapshot(qLatestClasses, (snapshot) => {
      setLatestClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error('Error loading latest classes:', err));

    const qLatestApps = query(collection(db, 'instructor_applications'), orderBy('createdAt', 'desc'), limit(4));
    const unsubLatestApps = onSnapshot(qLatestApps, (snapshot) => {
      setLatestApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error('Error loading latest applications:', err));

    return () => {
      unsubUsers();
      unsubClasses();
      unsubPending();
      unsubLatestClasses();
      unsubLatestApps();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-500">Admin Dashboard</p>
            <h1 className="text-3xl font-extrabold text-slate-900">Halo, {user?.name || 'Admin'}.</h1>
            <p className="mt-3 max-w-2xl text-slate-500 text-sm sm:text-base">
              Pantau performa platform, kelola user, instruktur, dan kelas dengan cepat dari satu tempat.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statCards.map(({ label, key, icon: Icon, color }) => (
              <div key={key} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                <div className={`inline-flex items-center justify-center rounded-2xl p-3 bg-gradient-to-br ${color} text-white mb-4`}>
                  <Icon size={18} />
                </div>
                <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{stats[key]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="col-span-2 rounded-3xl border border-slate-100 bg-slate-50 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Rangkuman</p>
                <h2 className="text-xl font-bold text-slate-900">Tindakan cepat</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                <ShieldCheck size={14} /> Aman untuk Admin
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={() => setActiveTab('admin-users')}
                className="group rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Manajemen Pengguna</p>
                    <p className="mt-2 text-xs text-slate-500">Lihat semua user, edit profil, dan akses dashboard siswa.</p>
                  </div>
                  <ArrowRight className="text-slate-400 transition group-hover:text-indigo-600" />
                </div>
              </button>

              <button
                onClick={() => setActiveTab('admin-instructor-management')}
                className="group rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Kelola Instruktur</p>
                    <p className="mt-2 text-xs text-slate-500">Terima, tolak, atau tambahkan instruktur baru.</p>
                  </div>
                  <ArrowRight className="text-slate-400 transition group-hover:text-indigo-600" />
                </div>
              </button>

              <button
                onClick={() => setActiveTab('class-management')}
                className="group rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Kelola Kelas</p>
                    <p className="mt-2 text-xs text-slate-500">Buat kelas baru, lihat kode akses, dan hapus kelas.</p>
                  </div>
                  <ArrowRight className="text-slate-400 transition group-hover:text-indigo-600" />
                </div>
              </button>

              <button
                onClick={() => setActiveTab('site-settings')}
                className="group rounded-3xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Pengaturan Website</p>
                    <p className="mt-2 text-xs text-slate-500">Ubah tampilan dan teks pada halaman utama.</p>
                  </div>
                  <ArrowRight className="text-slate-400 transition group-hover:text-indigo-600" />
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Kegiatan Terbaru</p>
                <h2 className="text-xl font-bold text-slate-900">Update terkini</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <CheckCircle2 size={14} /> Real-time
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Kelas baru</p>
                <div className="mt-3 space-y-3">
                  {latestClasses.length === 0 ? (
                    <p className="text-sm text-slate-500">Belum ada kelas baru.</p>
                  ) : latestClasses.map((cls) => (
                    <div key={cls.id} className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                      <p className="font-semibold text-slate-900 truncate">{cls.className || 'Kelas tanpa judul'}</p>
                      <p className="text-xs text-slate-500">{cls.packageName || 'Paket soal belum ditautkan'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">Pengajuan instruktur</p>
                <div className="mt-3 space-y-3">
                  {latestApplications.length === 0 ? (
                    <p className="text-sm text-slate-500">Belum ada pengajuan baru.</p>
                  ) : latestApplications.map((app) => (
                    <div key={app.id} className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                      <p className="font-semibold text-slate-900 truncate">{app.displayName || app.email}</p>
                      <p className="text-xs text-slate-500">Status: {app.status || 'unknown'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
