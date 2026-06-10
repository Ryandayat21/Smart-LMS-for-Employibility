import React, { useState, useRef, useEffect } from "react";
import Dashboard from "./Dashboard";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Camera, Edit2, Check, X, Phone, Mail, GraduationCap, MapPin, Calendar, Award, Briefcase, Plus, ExternalLink, Trash2, ShieldCheck, FolderGit2 } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto mt-8 mb-20">
      {/* ===== HERO / HEADER ===== */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden relative">
        {/* Cover Background */}
        <div className="h-40 md:h-56 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
          
          {/* Edit Button overlay on cover */}
          <div className="absolute top-6 right-6 z-10">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-md text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105"
              >
                <Edit2 size={14} />
                Edit Profil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-all"
                >
                  <X size={14} />
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-70"
                >
                  <Check size={14} />
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content Overlay */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-8 relative -mt-16">
            
            {/* FOTO */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white relative z-10">
                  {user?.profilePic ? (
                    <img src={user.profilePic} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                      <Camera size={40} />
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

                {/* Upload Button overlay on hover */}
                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                  className="absolute bottom-2 right-2 z-20 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all disabled:bg-slate-400 group-hover:opacity-100"
                  title="Unggah Foto Profil"
                >
                  <Camera size={18} />
                </button>
              </div>
            </div>

            {/* INFO */}
            <div className="flex-1 pt-20 md:pt-16 space-y-6 text-center md:text-left">
              
              {/* Name & Target Job */}
              <div>
                {isEditing ? (
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="text-2xl md:text-3xl font-extrabold text-slate-800 border-b-2 border-indigo-200 focus:border-indigo-500 bg-transparent outline-none w-full max-w-sm px-2 py-1 text-center md:text-left"
                    placeholder="Nama Lengkap"
                  />
                ) : (
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                    {user?.fullName || user?.name || "Nama Belum Diisi"}
                  </h2>
                )}
                <p className="text-sm font-bold text-indigo-500 uppercase tracking-wider mt-1">
                  Target Karir: <span className="text-slate-500">{user?.targetJob ? user.targetJob.replace('-', ' ') : 'Belum ditentukan'}</span>
                </p>
              </div>

              {/* Personal Details Form/Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl bg-slate-50/50 p-5 rounded-2xl border border-slate-100 text-left">
                
                {/* Age */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100/50 text-indigo-500 rounded-lg shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Umur</label>
                    {isEditing ? (
                      <input
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-100 outline-none"
                        placeholder="Contoh: 21"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-700">{user?.age ? `${user.age} Tahun` : "-"}</div>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100/50 text-emerald-500 rounded-lg shrink-0">
                    <GraduationCap size={16} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Pendidikan</label>
                    {isEditing ? (
                      <input
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-100 outline-none"
                        placeholder="Contoh: S1 Teknik Informatika"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-700">{user?.education || "-"}</div>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100/50 text-amber-500 rounded-lg shrink-0">
                    <Phone size={16} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">No. Handphone</label>
                    {isEditing ? (
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-100 outline-none"
                        placeholder="Contoh: 0812..."
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-700">{user?.phone || "-"}</div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-100/50 text-rose-500 rounded-lg shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Email</label>
                    {isEditing ? (
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-100 outline-none"
                        placeholder="email@example.com"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-700 truncate">{user?.email || "-"}</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex flex-wrap gap-2 mt-8 mb-6">
        {[
          { id: "certifications", label: "Sertifikasi", icon: <Award size={16} /> },
          { id: "projects", label: "Projek Portofolio", icon: <Briefcase size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-slate-800 text-white shadow-md scale-105"
                : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== CONTENT AREA ===== */}
      <div className="min-h-[400px]">

        {/* ===== SERTIFIKASI ===== */}
        {activeTab === "certifications" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <div>
                <h4 className="font-extrabold text-slate-800 flex items-center gap-2 text-lg">
                  <Award className="text-indigo-500" />
                  Galeri Sertifikasi
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-1">Unggah bukti lisensi atau kursus yang relevan.</p>
              </div>
              <button 
                onClick={() => setShowCertModal(true)}
                className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <Plus size={16} />
                Tambah Baru
              </button>
            </div>

            {(user?.certifications || []).length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-4">
                  <Award size={32} />
                </div>
                <h5 className="font-bold text-slate-700 mb-1">Belum ada sertifikasi</h5>
                <p className="text-sm text-slate-500 mb-4">Tunjukkan keahlianmu dengan menambahkan sertifikat kursus atau lisensi.</p>
                <button onClick={() => setShowCertModal(true)} className="text-indigo-600 text-sm font-bold hover:underline">
                  + Tambah Sertifikasi Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(user.certifications).map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
                          <Calendar size={12} />
                          {c.date}
                        </div>
                        <h5 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight" title={c.title}>
                          {c.title}
                        </h5>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <Award size={16} />
                      </div>
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-xs font-semibold text-slate-600 mb-4 flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400" />
                        Penerbit: <span className="text-slate-800">{c.issuer}</span>
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                        {c.skills?.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap">
                            {s}
                          </span>
                        ))}
                        {c.skills?.length > 4 && (
                          <span className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            +{c.skills.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <button onClick={() => startEditCert(i)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteCert(i)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {c.fileData && (
                          <button 
                            onClick={() => openBase64File(c.fileData)}
                            className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline bg-indigo-50 px-2.5 py-1.5 rounded-lg"
                          >
                            Lihat File <ExternalLink size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== PROJEK ===== */}
        {activeTab === "projects" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <div>
                <h4 className="font-extrabold text-slate-800 flex items-center gap-2 text-lg">
                  <FolderGit2 className="text-emerald-500" />
                  Galeri Projek Portofolio
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-1">Pamerkan hasil karya atau studi kasus terbaikmu.</p>
              </div>
              <button 
                onClick={() => setShowProjModal(true)}
                className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              >
                <Plus size={16} />
                Tambah Baru
              </button>
            </div>

            {(user?.projects || []).length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-4">
                  <FolderGit2 size={32} />
                </div>
                <h5 className="font-bold text-slate-700 mb-1">Belum ada projek</h5>
                <p className="text-sm text-slate-500 mb-4">Tunjukkan kemampuanmu lewat studi kasus atau hasil kerja praktis.</p>
                <button onClick={() => setShowProjModal(true)} className="text-emerald-600 text-sm font-bold hover:underline">
                  + Tambah Projek Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                {(user.projects).map((p, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col overflow-hidden">
                    {/* Card Header */}
                    <div className="p-5 border-b border-slate-50 flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mb-1.5">
                          <Calendar size={12} />
                          {p.date}
                        </div>
                        <h5 className="font-extrabold text-slate-800 text-base line-clamp-1" title={p.name}>
                          {p.name}
                        </h5>
                      </div>
                      {p.link && (
                        <a 
                          href={p.link.startsWith('http') ? p.link : `https://${p.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shrink-0"
                          title="Buka Tautan"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    
                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col bg-slate-50/50">
                      <p className="text-xs font-medium text-slate-600 mb-5 line-clamp-3 leading-relaxed">
                        {p.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                        {p.skills?.map((s, idx) => (
                          <span key={idx} className="bg-white border border-emerald-100 text-emerald-600 px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap shadow-sm">
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aksi</span>
                        <div className="flex gap-2">
                          <button onClick={() => startEditProj(i)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDeleteProj(i)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors shadow-sm" title="Hapus">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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