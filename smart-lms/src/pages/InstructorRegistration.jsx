import React, { useState } from 'react';
import { createInstructorApplication } from '../utils/firebaseUtils.js';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';

const InstructorRegistration = ({ onBack }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasi
    if (!formData.displayName || !formData.email) {
      setError('Semua field harus diisi');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email tidak valid');
      return;
    }

    setLoading(true);
    try {
      await createInstructorApplication({
        displayName: formData.displayName,
        email: formData.email
      });
      setSuccess(true);
      setFormData({
        displayName: '',
        email: ''
      });
    } catch (err) {
      setError(err.message || 'Gagal mengirim pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Pendaftaran Diterima!</h2>
          <p className="text-slate-600 mb-6">
            Terima kasih telah mendaftar sebagai instruktur. Admin akan meninjau pendaftaran Anda dalam waktu 24-48 jam dan akan mengirimkan konfirmasi melalui email.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            <ArrowLeft size={16} className="mr-2" />
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-sm text-slate-500">Daftar Instruktur</p>
            <h2 className="text-2xl font-bold text-slate-900">Bergabunglah sebagai Instruktur</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User size={16} />
              Nama Lengkap
            </span>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
              placeholder="Nama Anda"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Mail size={16} />
              Email
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
              placeholder="email@example.com"
            />
          </label>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-4">
            <p className="text-sm text-indigo-800 text-center">
              Setelah pendaftaran disetujui oleh Admin, Anda dapat masuk menggunakan <strong>Email Anda</strong> sebagai Username dan Password default Anda.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Daftar sebagai Instruktur'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Pendaftaran Anda akan ditinjau oleh admin dalam waktu 24-48 jam.
        </p>
      </div>
    </div>
  );
};

export default InstructorRegistration;
