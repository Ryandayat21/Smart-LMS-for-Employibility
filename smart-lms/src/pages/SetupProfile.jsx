import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const SetupProfile = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    fullName: user.name || "",
    targetJob: "",
    bio: "",
    age: "",
    education: "",
    phone: "",
    email: user.email || ""
  });
  const [issubmitting, setIsSubmitting] = useState(false);

  const jobs = [
    { id: "frontend", label: "Front Office / Customer Service", cat: "FO" },
    { id: "marketing", label: "Marketing & Sales", cat: "FO" },
    { id: "uiux", label: "UI/UX Designer", cat: "FO" },
    { id: "software-eng", label: "Software Engineer", cat: "BO" },
    { id: "data-analyst", label: "Data Analyst", cat: "BO" },
    { id: "admin", label: "Administrative Assistant", cat: "BO" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.targetJob) return alert("Pilih pekerjaan impianmu dulu!");

    setIsSubmitting(true);
    try {
      if (onComplete) {
        onComplete();
      }
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        name: formData.fullName,
        fullName: formData.fullName,
        targetJob: formData.targetJob,
        bio: formData.bio,
        age: formData.age,
        education: formData.education,
        phone: formData.phone,
        email: formData.email,
        isNew: false // Tandai bahwa user sudah selesai setup
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-8">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 my-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Lengkapi Profilmu</h2>
          <p className="text-slate-500 text-sm">Data ini diperlukan untuk personalisasi assessment AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Nomor HP */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nomor HP</label>
            <input 
              type="tel" 
              required
              placeholder="Contoh: 08123456789"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Umur */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Umur</label>
              <input 
                type="number" 
                required
                placeholder="Contoh: 21"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>

            {/* Target Job */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pekerjaan Impian</label>
              <select 
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                value={formData.targetJob}
                onChange={(e) => setFormData({...formData, targetJob: e.target.value})}
              >
                <option value="">-- Pilih --</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pendidikan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pendidikan</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: S1 Teknik Informatika"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              value={formData.education}
              onChange={(e) => setFormData({...formData, education: e.target.value})}
            />
            <p className="text-[10px] text-slate-400 mt-1">*Tulis jenjang dan jurusan pendidikan terakhir</p>
          </div>

          {/* Bio Singkat */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tentang Kamu (Bio)</label>
            <textarea 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              rows="3"
              placeholder="Ceritakan sedikit tentang latar belakangmu..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={issubmitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:bg-slate-400"
          >
            {issubmitting ? "Menyimpan..." : "Simpan & Lanjut ke Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfile;