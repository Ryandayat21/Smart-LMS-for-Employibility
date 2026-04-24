import React, { useRef, useState } from 'react';
import Dashboard from './Dashboard';

const UserProfile = ({ user }) => {
  const [profilePic, setProfilePic] = useState(user.profilePic || null);
  const fileInputRef = useRef();

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfilePic(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-3xl shadow-md mt-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Foto Profil */}
        <div className="flex flex-col items-center md:w-1/3">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-indigo-500 mb-4">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">No Photo</div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleProfilePicChange}
          />
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold mt-2"
            onClick={() => fileInputRef.current.click()}
          >
            Unggah Foto
          </button>
        </div>
        {/* Data Pengguna */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-xs text-slate-500">Nama Lengkap</label>
            <div className="font-bold text-lg">{user.fullName}</div>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs text-slate-500">Umur</label>
              <div>{user.age}</div>
            </div>
            <div>
              <label className="block text-xs text-slate-500">Nomor HP</label>
              <div>{user.phone}</div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500">Email</label>
            <div>{user.email}</div>
          </div>
          <div>
            <label className="block text-xs text-slate-500">Lulusan Pendidikan</label>
            <div>{user.education}</div>
          </div>
        </div>
      </div>
      {/* Sertifikat */}
      <div className="mt-8">
        <h4 className="font-bold mb-4">Sertifikat</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.certificates && user.certificates.length > 0 ? (
            user.certificates.map((cert, idx) => (
              <div key={idx} className="border rounded-xl p-4 bg-slate-50 flex flex-col gap-2">
                <div className="font-semibold">{cert.type}</div>
                <div className="text-xs text-slate-500">{cert.date}</div>
              </div>
            ))
          ) : (
            <div className="text-slate-400">Belum ada sertifikat</div>
          )}
        </div>
      </div>
      {/* Skill Proficiency */}
      <div className="mt-8">
        <Dashboard user={user} runAiAnalysis={() => {}} />
      </div>
    </div>
  );
};

export default UserProfile;
