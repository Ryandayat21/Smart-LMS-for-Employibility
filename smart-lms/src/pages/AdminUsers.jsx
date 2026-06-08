import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';

const defaultSkills = {
  technical: 0,
  digitalLiteracy: 0,
  communication: 0,
  leadership: 0,
  teamwork: 0,
  emotionalIntel: 0,
  problemSolving: 0,
  criticalThinking: 0,
  attentionDetail: 0,
  workEthic: 0,
};

const emptyForm = {
  name: '',
  email: '',
  role: 'user',
  targetJob: '',
};

const AdminUsers = ({ onViewDashboard }) => {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          role: data.role || 'user',
          ...data,
        };
      }));
      setLoading(false);
    }, (error) => {
      console.error('Gagal load users:', error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredUsers = users.filter((user) => {
    const role = user.role || 'user';
    const matchesRole = filterRole === 'all' || role === filterRole;
    const query = search.toLowerCase();
    const matchesText =
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.targetJob?.toLowerCase().includes(query) ||
      role.toLowerCase().includes(query);
    return matchesRole && (!query || matchesText);
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'users', editingId), {
          name: form.name,
          email: form.email,
          role: form.role,
          targetJob: form.targetJob,
        });
      } else {
        const newDoc = doc(collection(db, 'users'));
        await setDoc(newDoc, {
          name: form.name,
          email: form.email,
          role: form.role,
          targetJob: form.targetJob,
          skills: defaultSkills,
          uid: newDoc.id,
        });
      }
      resetForm();
    } catch (error) {
      console.error('Gagal simpan user:', error);
      alert('Gagal menyimpan user. Periksa console untuk detail.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    if (onViewDashboard) {
      onViewDashboard(user);
      return;
    }

    setEditingId(user.id);
    setForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      targetJob: user.targetJob || '',
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Hapus user ini? Tindakan ini tidak bisa dibatalkan.');
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error('Gagal menghapus user:', error);
      alert('Gagal menghapus user. Periksa console untuk detail.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-500">Admin User Management</p>
            <h2 className="text-3xl font-extrabold text-slate-900">Manajemen Pengguna</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900"
            >
              <option value="all">Semua Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
            </select>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau role"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm text-slate-500">Formulir User</p>
                  <h3 className="text-xl font-semibold text-slate-900">{editingId ? 'Edit User' : 'Tambah User Baru'}</h3>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Reset
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Nama</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                    placeholder="Nama lengkap"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                    placeholder="email@example.com"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Role</span>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Target Job</span>
                  <input
                    value={form.targetJob}
                    onChange={(e) => setForm({ ...form, targetJob: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                    placeholder="Contoh: Data Analyst"
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : editingId ? 'Update User' : 'Buat User'}
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Daftar Pengguna</p>
                <h3 className="text-xl font-semibold text-slate-900">{filteredUsers.length} hasil</h3>
              </div>
            </div>
            {loading ? (
              <div className="py-10 text-center text-slate-500">Memuat data pengguna...</div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="rounded-3xl bg-slate-50 p-6 text-center text-slate-500">Tidak ada pengguna dengan filter ini.</div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="rounded-3xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{user.name || 'Tanpa Nama'}</p>
                          <p className="text-sm text-slate-500">{user.email || 'Tidak ada email'}</p>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">{user.role || 'user'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="rounded-2xl border border-indigo-600 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            className="rounded-2xl border border-rose-500 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                      {user.targetJob && (
                        <p className="mt-3 text-sm text-slate-600">Target Job: {user.targetJob}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
