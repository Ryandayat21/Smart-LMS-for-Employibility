import React, { useState } from 'react';

const defaultSettings = {
  orgName: 'Skillvora',
  orgLogo: '',
  heroTitle: 'Build Your Future Career with AI 🚀',
  heroSubtitle: 'Smart LMS membantu kamu memahami potensi skill, menemukan jalur karier terbaik, dan berkembang dengan analisis berbasis Artificial Intelligence.',
  heroButtonText: 'Mulai Analisis Karier',
};

const AdminSettings = ({ settings: initialSettings = defaultSettings, onSave }) => {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (event) => {
    setSettings({ ...settings, [field]: event.target.value });
    setSaved(false);
  };

  const handleSave = () => {
    onSave?.(settings);
    setSaved(true);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    onSave?.(defaultSettings);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-widest text-slate-500">Admin Settings</p>
          <h2 className="text-3xl font-extrabold text-slate-900">Website Configuration</h2>
          <p className="text-slate-500 mt-2">Atur logo, nama organisasi, dan tampilan awal website.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Logo Organisasi (URL)</span>
            <input
              value={settings.orgLogo}
              onChange={handleChange('orgLogo')}
              placeholder="https://..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Nama Organisasi</span>
            <input
              value={settings.orgName}
              onChange={handleChange('orgName')}
              placeholder="Nama Organisasi"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
            />
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium text-slate-600">Tampilan Awal - Judul</span>
            <input
              value={settings.heroTitle}
              onChange={handleChange('heroTitle')}
              placeholder="Judul utama halaman awal"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
            />
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium text-slate-600">Tampilan Awal - Subjudul</span>
            <textarea
              value={settings.heroSubtitle}
              onChange={handleChange('heroSubtitle')}
              placeholder="Kalimat deskripsi tampilan awal"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
            />
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium text-slate-600">Teks Tombol Awal</span>
            <input
              value={settings.heroButtonText}
              onChange={handleChange('heroButtonText')}
              placeholder="Teks tombol pada halaman awal"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Simpan Pengaturan
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Reset ke Default
          </button>
          {saved && <span className="text-sm text-emerald-600">Pengaturan tersimpan.</span>}
        </div>
      </div>

      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-500 mb-4">Preview Tampilan Awal</p>
        <div className="rounded-3xl bg-white p-8 border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            {settings.orgLogo ? (
              <img src={settings.orgLogo} alt="Organisasi" className="h-14 w-14 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">Logo</div>
            )}
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-400">{settings.orgName}</p>
              <h3 className="text-2xl font-bold text-slate-900">{settings.heroTitle}</h3>
            </div>
          </div>
          <p className="text-slate-600 mb-6">{settings.heroSubtitle}</p>
          <button className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition">
            {settings.heroButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
