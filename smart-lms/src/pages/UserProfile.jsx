import React, { useState, useRef, useEffect } from "react";
import Dashboard from "./Dashboard";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const UserProfile = ({ user, profileAction, setProfileAction }) => {
  const [activeTab, setActiveTab] = useState("certifications");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || "",
    age: user?.age || "",
    phone: user?.phone || "",
    email: user?.email || "",
    education: user?.education || "",
  });

  // Sync state with parent user prop when it updates in Firestore
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || "",
        age: user.age || "",
        phone: user.phone || "",
        email: user.email || "",
        education: user.education || "",
      });
    }
  }, [user]);

  // Handle deep-linked action requests from dashboard milestones
  useEffect(() => {
    if (profileAction === 'add_project') {
      setActiveTab('projects');
      setShowProjModal(true);
      if (setProfileAction) setProfileAction(null);
    } else if (profileAction === 'add_certification') {
      setActiveTab('certifications');
      setShowCertModal(true);
      if (setProfileAction) setProfileAction(null);
    }
  }, [profileAction, setProfileAction]);

  // ===== HANDLE INPUT =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ===== HANDLE SAVE =====
  const handleSave = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        name: formData.fullName,
        fullName: formData.fullName,
        age: formData.age,
        phone: formData.phone,
        email: formData.email,
        education: formData.education,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      alert("Gagal menyimpan perubahan ke database!");
    } finally {
      setIsSaving(false);
    }
  };

  // ===== HANDLE FILE CHANGE (UPLOAD PICTURE) =====
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Ukuran gambar terlalu besar! Maksimal 1MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          await updateDoc(docRef, {
            profilePic: base64String
          });
        } catch (error) {
          console.error("Gagal mengunggah foto profil:", error);
          alert("Gagal memperbarui foto profil di database!");
        } finally {
          setIsUploading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // ===== MODAL STATE =====
  const [showCertModal, setShowCertModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);
  const [editingCertIndex, setEditingCertIndex] = useState(null);
  const [editingProjIndex, setEditingProjIndex] = useState(null);

  // Cert Form States
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certSkills, setCertSkills] = useState("");
  const [certFile, setCertFile] = useState("");
  const [certFileName, setCertFileName] = useState("");
  const [isAddingCert, setIsAddingCert] = useState(false);

  // Proj Form States
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projDate, setProjDate] = useState("");
  const [projSkills, setProjSkills] = useState("");
  const [projLink, setProjLink] = useState("");
  const [isAddingProj, setIsAddingProj] = useState(false);

  // ===== HELPER: OPEN BASE64 SAFELY =====
  const openBase64File = (base64Data) => {
    try {
      const parts = base64Data.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (e) {
      console.error("Gagal membuka berkas:", e);
      // Fallback
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe src="${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      } else {
        alert("Gagal membuka berkas. Harap periksa apakah popup blocker aktif.");
      }
    }
  };

  // ===== CONVERT FILE HANDLERS =====
  const handleCertFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("Berkas bukti terlalu besar! Maksimal 500KB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCertFile(reader.result);
      setCertFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // ===== CLOSE MODAL RESET HELPERS =====
  const closeCertModal = () => {
    setCertTitle("");
    setCertIssuer("");
    setCertDate("");
    setCertSkills("");
    setCertFile("");
    setCertFileName("");
    setEditingCertIndex(null);
    setShowCertModal(false);
  };

  const closeProjModal = () => {
    setProjName("");
    setProjDesc("");
    setProjDate("");
    setProjSkills("");
    setProjLink("");
    setEditingProjIndex(null);
    setShowProjModal(false);
  };

  // ===== START EDIT TRIGGER HELPERS =====
  const startEditCert = (index) => {
    const cert = user.certifications[index];
    setCertTitle(cert.title || "");
    setCertIssuer(cert.issuer || "");
    setCertDate(cert.date || "");
    setCertSkills(cert.skills ? cert.skills.join(", ") : "");
    setCertFile(cert.fileData || "");
    setCertFileName(cert.fileName || "");
    setEditingCertIndex(index);
    setShowCertModal(true);
  };

  const startEditProj = (index) => {
    const proj = user.projects[index];
    setProjName(proj.name || "");
    setProjDesc(proj.description || "");
    setProjDate(proj.date || "");
    setProjSkills(proj.skills ? proj.skills.join(", ") : "");
    setProjLink(proj.link || "");
    setEditingProjIndex(index);
    setShowProjModal(true);
  };

  // ===== SAVE TO DATABASE HANDLERS (OPTION B - ADD & EDIT) =====
  const handleSaveCert = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setIsAddingCert(true);
    try {
      const newCert = {
        title: certTitle,
        issuer: certIssuer,
        date: certDate,
        skills: certSkills.split(",").map(s => s.trim()).filter(Boolean),
        fileData: certFile || null,
        fileName: certFileName || null,
        createdAt: new Date().toISOString()
      };

      const currentCerts = [...(user.certifications || [])];
      if (editingCertIndex !== null) {
        newCert.createdAt = currentCerts[editingCertIndex].createdAt || newCert.createdAt;
        currentCerts[editingCertIndex] = newCert;
      } else {
        currentCerts.push(newCert);
      }

      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        certifications: currentCerts
      });

      closeCertModal();
    } catch (error) {
      console.error("Gagal menyimpan sertifikasi:", error);
      alert("Gagal menyimpan sertifikasi!");
    } finally {
      setIsAddingCert(false);
    }
  };

  const handleSaveProj = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setIsAddingProj(true);
    try {
      const newProj = {
        name: projName,
        description: projDesc,
        date: projDate,
        skills: projSkills.split(",").map(s => s.trim()).filter(Boolean),
        link: projLink || null,
        createdAt: new Date().toISOString()
      };

      const currentProjs = [...(user.projects || [])];
      if (editingProjIndex !== null) {
        newProj.createdAt = currentProjs[editingProjIndex].createdAt || newProj.createdAt;
        currentProjs[editingProjIndex] = newProj;
      } else {
        currentProjs.push(newProj);
      }

      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        projects: currentProjs
      });

      closeProjModal();
    } catch (error) {
      console.error("Gagal menyimpan projek:", error);
      alert("Gagal menyimpan projek!");
    } finally {
      setIsAddingProj(false);
    }
  };

  // ===== DELETE HANDLERS =====
  const handleDeleteCert = async (indexToDelete) => {
    if (!user?.uid || !confirm("Apakah Anda yakin ingin menghapus sertifikasi ini?")) return;
    try {
      const currentCerts = user.certifications || [];
      const updatedCerts = currentCerts.filter((_, idx) => idx !== indexToDelete);
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        certifications: updatedCerts
      });
    } catch (error) {
      console.error("Gagal menghapus sertifikasi:", error);
      alert("Gagal menghapus sertifikasi!");
    }
  };

  const handleDeleteProj = async (indexToDelete) => {
    if (!user?.uid || !confirm("Apakah Anda yakin ingin menghapus projek ini?")) return;
    try {
      const currentProjs = user.projects || [];
      const updatedProjs = currentProjs.filter((_, idx) => idx !== indexToDelete);
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        projects: updatedProjs
      });
    } catch (error) {
      console.error("Gagal menghapus projek:", error);
      alert("Gagal menghapus projek!");
    }
  };

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

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />

          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl disabled:bg-slate-400"
          >
            {isUploading ? "Mengunggah..." : "Unggah Foto"}
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
                  disabled={isSaving}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl disabled:bg-slate-400"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
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
                <div className="font-semibold">{user?.fullName || user?.name || "-"}</div>
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
                <div>{user?.age || "-"}</div>
              )}
            </div>

            {/* No HP */}
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
                <div>{user?.phone || "-"}</div>
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
                <div>{user?.email || "-"}</div>
              )}
            </div>

            {/* Pendidikan */}
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
                <div>{user?.education || "-"}</div>
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
              <button 
                onClick={() => setShowCertModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm"
              >
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
                  <th className="p-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(user?.certifications || []).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      Belum ada sertifikasi. Klik "+ Tambah" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  (user.certifications).map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{c.date}</td>
                      <td className="p-3 font-medium">{c.title}</td>
                      <td className="p-3">{c.issuer}</td>
                      <td className="p-3">
                        <div className="flex gap-2 flex-wrap">
                          {c.skills?.map((s, idx) => (
                            <span key={idx} className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        {c.fileData ? (
                          <button 
                            onClick={() => openBase64File(c.fileData)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                          >
                            Lihat
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => startEditCert(i)}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCert(i)}
                            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ===== PROJEK ===== */}
        {activeTab === "projects" && (
          <>
            <div className="flex justify-between mb-4">
              <h4 className="font-bold">Projek</h4>
              <button 
                onClick={() => setShowProjModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm"
              >
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
                  <th className="p-3 text-left">Link</th>
                  <th className="p-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(user?.projects || []).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      Belum ada projek. Klik "+ Tambah" untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  (user.projects).map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{p.date}</td>
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3">{p.description}</td>
                      <td className="p-3">
                        <div className="flex gap-2 flex-wrap">
                          {p.skills?.map((s, idx) => (
                            <span key={idx} className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        {p.link ? (
                          <a 
                            href={p.link.startsWith('http') ? p.link : `https://${p.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                          >
                            Buka Link
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => startEditProj(i)}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProj(i)}
                            className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}

        {/* ===== SKILL ===== */}
        {activeTab === "skills" && (
          <Dashboard user={user} runAiAnalysis={() => {}} />
        )}
      </div>

      {/* ===== MODAL TAMBAH SERTIFIKASI ===== */}
      {showCertModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {editingCertIndex !== null ? "Edit Sertifikasi" : "Tambah Sertifikasi"}
              </h3>
              <button 
                onClick={closeCertModal} 
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCert} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Sertifikat</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Google Data Analytics"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Lembaga Penerbit</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Coursera / Google"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tanggal Perolehan</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 12 Mei 2024"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Bukti File (Max 500KB)</label>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                    onChange={handleCertFileSelect}
                  />
                  {certFileName && (
                    <p className="text-[10px] text-emerald-600 mt-1 font-semibold truncate" title={certFileName}>
                      File terunggah: {certFileName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tag Skill (Pisahkan dengan koma)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Data Analysis, SQL, Tableau"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                  value={certSkills}
                  onChange={(e) => setCertSkills(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={closeCertModal}
                  className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isAddingCert}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:bg-slate-400"
                >
                  {isAddingCert ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL TAMBAH PROJEK ===== */}
      {showProjModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {editingProjIndex !== null ? "Edit Projek" : "Tambah Projek"}
              </h3>
              <button 
                onClick={closeProjModal} 
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProj} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Projek</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Sistem Informasi Perpustakaan"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Rentang Waktu</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Juni - Ags 2024"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                    value={projDate}
                    onChange={(e) => setProjDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Link Projek (URL)</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: github.com/username"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                    value={projLink}
                    onChange={(e) => setProjLink(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Teknologi / Skill (Pisahkan dengan koma)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Laravel, Tailwind CSS, MySQL"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                  value={projSkills}
                  onChange={(e) => setProjSkills(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Deskripsi Singkat</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Ceritakan tentang apa projek ini..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={closeProjModal}
                  className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isAddingProj}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:bg-slate-400"
                >
                  {isAddingProj ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;