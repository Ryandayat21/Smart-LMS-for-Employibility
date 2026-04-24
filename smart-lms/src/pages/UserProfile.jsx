import React, { useState, useRef } from "react";
import Dashboard from "./Dashboard";

const UserProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState("certifications");
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    age: user?.age || "",
    phone: user?.phone || "",
    email: user?.email || "",
    education: user?.education || "",
  });

  // ===== HANDLE INPUT =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ===== HANDLE SAVE =====
  const handleSave = () => {
    Object.assign(user, formData); // sementara (UI only)
    setIsEditing(false);
  };

  // ===== DUMMY DATA =====
  const dummyCertifications = [
    {
      date: "12 Mei 2024",
      title: "Google Data Analytics",
      issuer: "Google",
      skills: ["Data Analysis", "Visualization"],
    },
    {
      date: "20 Feb 2024",
      title: "Frontend Developer",
      issuer: "Dicoding",
      skills: ["HTML", "CSS", "JavaScript"],
    },
  ];

  const dummyProjects = [
    {
      date: "Juni - Ags 2024",
      name: "Sistem Informasi Perpustakaan",
      description: "Manajemen peminjaman buku",
      skills: ["Laravel", "MySQL"],
    },
    {
      date: "Mar - Apr 2024",
      name: "UI E-Commerce",
      description: "Design UI di Figma",
      skills: ["Figma", "UX"],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-3xl shadow-md mt-8">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row gap-8">

        {/* FOTO */}
        <div className="flex flex-col items-center md:w-1/3">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-indigo-500 mb-4">
            {user?.profilePic ? (
              <img src={user.profilePic} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                No Photo
              </div>
            )}
          </div>

          <input type="file" ref={fileInputRef} className="hidden" />

          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
          >
            Unggah Foto
          </button>
        </div>

        {/* INFO */}
        <div className="flex-1 space-y-4">

          {/* HEADER + BUTTON */}
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">Profile</h3>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm"
              >
                Edit Profil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
                >
                  Simpan
                </button>
              </div>
            )}
          </div>

          {/* FIELD */}
          <div className="grid grid-cols-2 gap-4">

            {/* Nama */}
            <div>
              <label className="text-xs text-slate-500">Nama</label>
              {isEditing ? (
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              ) : (
                <div className="font-semibold">{user?.fullName}</div>
              )}
            </div>

            {/* Umur */}
            <div>
              <label className="text-xs text-slate-500">Umur</label>
              {isEditing ? (
                <input
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              ) : (
                <div>{user?.age}</div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs text-slate-500">No HP</label>
              {isEditing ? (
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              ) : (
                <div>{user?.phone}</div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-slate-500">Email</label>
              {isEditing ? (
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              ) : (
                <div>{user?.email}</div>
              )}
            </div>

            {/* Education */}
            <div className="col-span-2">
              <label className="text-xs text-slate-500">Pendidikan</label>
              {isEditing ? (
                <input
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                />
              ) : (
                <div>{user?.education}</div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ===== TAB ===== */}
      <div className="flex gap-6 mt-10 border-b pb-2">
        {["certifications", "projects", "skills"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`capitalize ${
              activeTab === tab
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-slate-500"
            }`}
          >
            {tab === "certifications"
              ? "Sertifikasi"
              : tab === "projects"
              ? "Projek"
              : "Skill"}
          </button>
        ))}
      </div>

      {/* ===== CONTENT ===== */}
      <div className="mt-6">

        {/* ===== SERTIFIKASI ===== */}
        {activeTab === "certifications" && (
          <>
            <div className="flex justify-between mb-4">
              <h4 className="font-bold">Sertifikasi</h4>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm">
                + Tambah
              </button>
            </div>

            <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left">Tanggal</th>
                  <th className="p-3 text-left">Nama</th>
                  <th className="p-3 text-left">Lembaga</th>
                  <th className="p-3 text-left">Skill</th>
                  <th className="p-3 text-left">File</th>
                </tr>
              </thead>
              <tbody>
                {dummyCertifications.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{c.date}</td>
                    <td className="p-3 font-medium">{c.title}</td>
                    <td className="p-3">{c.issuer}</td>
                    <td className="p-3">
                      <div className="flex gap-2 flex-wrap">
                        {c.skills.map((s, idx) => (
                          <span key={idx} className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-indigo-600 cursor-pointer">Lihat</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ===== PROJEK ===== */}
        {activeTab === "projects" && (
          <>
            <div className="flex justify-between mb-4">
              <h4 className="font-bold">Projek</h4>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm">
                + Tambah
              </button>
            </div>

            <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left">Tanggal</th>
                  <th className="p-3 text-left">Nama</th>
                  <th className="p-3 text-left">Deskripsi</th>
                  <th className="p-3 text-left">Skill</th>
                  <th className="p-3 text-left">File</th>
                </tr>
              </thead>
              <tbody>
                {dummyProjects.map((p, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{p.date}</td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{p.description}</td>
                    <td className="p-3">
                      <div className="flex gap-2 flex-wrap">
                        {p.skills.map((s, idx) => (
                          <span key={idx} className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-indigo-600 cursor-pointer">Lihat</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ===== SKILL ===== */}
        {activeTab === "skills" && (
          <Dashboard user={user} runAiAnalysis={() => {}} />
        )}
      </div>
    </div>
  );
};

export default UserProfile;