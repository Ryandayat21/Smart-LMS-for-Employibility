import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import {
  getPendingInstructorApplications,
  approveInstructorApplication,
  rejectInstructorApplication,
  createUser
} from '../utils/firebaseUtils.js';
import { Check, X, Mail, User, Calendar, Plus } from 'lucide-react';

const AdminInstructorManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    email: '',
    displayName: '',
    username: '',
    password: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Subscribe to all instructor applications
    const q = query(collection(db, 'instructor_applications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(apps);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching applications:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredApplications = applications.filter(app => app.status === activeTab);

  const handleApprove = async (app) => {
    if (!window.confirm(`Setujui pendaftaran ${app.email}?`)) return;
    
    try {
      await approveInstructorApplication(app.id, app);
      alert('✅ Pendaftaran disetujui dan instruktur sudah ditambahkan!');
    } catch (err) {
      console.error('Error approving:', err);
      alert('❌ Gagal menyetujui: ' + err.message);
    }
  };

  const handleReject = async (app) => {
    if (!window.confirm(`Tolak pendaftaran ${app.email}?`)) return;

    try {
      await rejectInstructorApplication(app.id);
      alert('✅ Pendaftaran ditolak');
    } catch (err) {
      console.error('Error rejecting:', err);
      alert('❌ Gagal menolak: ' + err.message);
    }
  };

  const handleAddInstructor = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (!addFormData.email || !addFormData.displayName || !addFormData.username || !addFormData.password) {
        alert('Semua field (nama, email, username, dan password) harus diisi');
        return;
      }

      // Buat pendaftaran dan langsung setujui
      const appRef = await addDoc(collection(db, "instructor_applications"), {
        email: addFormData.email,
        displayName: addFormData.displayName,
        status: "pending",
        createdAt: new Date()
      });

      await approveInstructorApplication(appRef.id, {
        email: addFormData.email,
        displayName: addFormData.displayName,
        username: addFormData.username,
        password: addFormData.password
      });

      alert('✅ Instruktur berhasil ditambahkan!');
      setAddFormData({ email: '', displayName: '', username: '', password: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding instructor:', err);
      alert('❌ Gagal menambahkan instruktur: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    if (date.toDate) return date.toDate().toLocaleDateString('id-ID');
    return new Date(date).toLocaleDateString('id-ID');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-500">Manajemen Instruktur</p>
            <h2 className="text-3xl font-extrabold text-slate-900">Kelola Pendaftaran Instruktur</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-2xl border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-100 transition flex items-center gap-2"
          >
            <Plus size={16} />
            Tambah Instruktur
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition ${
              activeTab === 'pending'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Menunggu ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition ${
              activeTab === 'approved'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Disetujui ({applications.filter(a => a.status === 'approved').length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition ${
              activeTab === 'rejected'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Ditolak ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Memuat data...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-8 text-center text-slate-500">
            Tidak ada data {activeTab === 'pending' ? 'menunggu' : activeTab === 'approved' ? 'disetujui' : 'ditolak'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <div key={app.id} className="rounded-3xl border border-slate-200 p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{app.displayName || 'Tanpa Nama'}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Mail size={14} />
                            {app.email}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                        <Calendar size={12} />
                        Mendaftar: {formatDate(app.createdAt)}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      {app.status === 'pending' && (
                        <>
                          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                            Menunggu Persetujuan
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(app)}
                              className="rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 text-sm font-semibold transition flex items-center gap-1"
                            >
                              <Check size={16} />
                              Setujui
                            </button>
                            <button
                              onClick={() => handleReject(app)}
                              className="rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 text-sm font-semibold transition flex items-center gap-1"
                            >
                              <X size={16} />
                              Tolak
                            </button>
                          </div>
                        </>
                      )}

                      {app.status === 'approved' && (
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          ✓ Disetujui {app.approvedAt && `(${formatDate(app.approvedAt)})`}
                        </span>
                      )}

                      {app.status === 'rejected' && (
                        <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full">
                          ✗ Ditolak {app.rejectedAt && `(${formatDate(app.rejectedAt)})`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Instructor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Tambah Instruktur Baru</h2>

            <form onSubmit={handleAddInstructor} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nama Lengkap</span>
                <input
                  type="text"
                  value={addFormData.displayName}
                  onChange={(e) => setAddFormData({ ...addFormData, displayName: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                  placeholder="Nama instruktur"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                  placeholder="email@example.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Username</span>
                <input
                  type="text"
                  required
                  value={addFormData.username}
                  onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                  placeholder="Username instruktur"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  required
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
                  placeholder="••••••••"
                />
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstructorManagement;
