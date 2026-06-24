import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, where } from 'firebase/firestore';
import { Plus, Trash2, ShieldAlert, Key, Users, BookOpen, Layers, Copy, Check } from 'lucide-react';

const ClassManagement = ({ user }) => {
  const [classes, setClasses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    className: "",
    packageId: "",
    packageName: ""
  });

  const isAdminOrInstructor = user?.role === 'admin' || user?.role === 'instructor';

  // 1. Ambil Data Kelas secara Real-time (HANYA MILIK INSTRUKTUR YANG LOGIN)
  useEffect(() => {
    if (!user?.uid) return;
    // 💡 REVISI: Tambahkan filter 'where' agar instruktur hanya melihat kelas bikinannya sendiri
    const qClass = query(
      collection(db, "classes"),
      where("createdBy", "==", user.uid)
    );

    const unsubscribe = onSnapshot(qClass, (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user?.uid]); // Tambahkan user?.uid ke dependency array agar memicu re-fetch saat user login

  // 2. Ambil List Paket Soal untuk Dropdown Pilihan
  useEffect(() => {
    if (!user) return;
    const qPack = query(collection(db, "question_packages"));
    const unsubscribe = onSnapshot(qPack, (snapshot) => {
      let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter: Instruktur tidak bisa menautkan paket soal buatan admin, begitu sebaliknya
      if (user.role === 'admin') {
        docs = docs.filter(d => d.creatorRole === 'admin' || d.createdBy === 'admin' || d.createdBy === user.uid || (!d.creatorRole && !d.createdBy));
      } else if (user.role === 'instructor') {
        docs = docs.filter(d => d.createdBy === user.uid);
      }
      
      setPackages(docs);
    });
    return () => unsubscribe();
  }, [user]);

  // 3. Fungsi Generate Kode Kelas Acak 6 Digit
  const generateClassCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Tanpa 'I', 'O', '1', '0' agar tidak membingungkan
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // 4. Handle Simpan Kelas Baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.packageId) {
      alert("Silakan pilih Paket Soal terlebih dahulu!");
      return;
    }

    // Cari nama paket berdasarkan ID yang dipilih
    const selectedPkg = packages.find(p => p.id === formData.packageId);
    const classCode = generateClassCode();

    try {
      await addDoc(collection(db, "classes"), {
        className: formData.className,
        packageId: formData.packageId,
        packageName: selectedPkg?.packageName || "",
        classCode: classCode,
        createdAt: new Date(),
        createdBy: user?.uid || "instructor"
      });

      setFormData({ className: "", packageId: "", packageName: "" });
      setIsAdding(false);
      alert(`✅ Kelas berhasil dibuat dengan Kode: ${classCode}`);
    } catch (error) {
      console.error("Gagal membuat kelas:", error);
      alert("❌ Gagal membuat kelas baru.");
    }
  };

  // 5. Handle Hapus Kelas
  const handleDeleteClass = async (id) => {
    if (window.confirm("Hapus kelas ini? Mahasiswa di dalam kelas ini tidak akan bisa mengakses ujian lagi.")) {
      try {
        await deleteDoc(doc(db, "classes", id));
        alert("✅ Kelas berhasil dihapus!");
      } catch (error) {
        console.error("Gagal hapus kelas:", error);
      }
    }
  };

  // 6. Fungsi Salin Kode Kelas
  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Kelas</h1>
          <p className="text-slate-500 text-sm">
            {isAdminOrInstructor ? 'Buat kelas belajar dan tautkan dengan paket ujian kompetensi.' : 'Hanya Admin atau Instruktur yang dapat membuat dan mengelola kelas.'}
          </p>
        </div>
        {isAdminOrInstructor && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md"
          >
            <Plus size={20} /> {isAdding ? "Batal" : "Buat Kelas Baru"}
          </button>
        )}
      </div>

      {/* Form Buat Kelas */}
      {isAdding && isAdminOrInstructor && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-150">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nama Kelas</label>
              <input
                type="text" required
                placeholder="Contoh: Teknik Informatika - Angkatan A"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tautkan Paket Soal</label>
              <select
                required
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                value={formData.packageId}
                onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              >
                <option value="">-- Pilih Paket Soal --</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.packageName}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="md:col-span-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg">
              Simpan Kelas & Generate Token
            </button>
          </form>
        </div>
      )}

      {/* Grid Tampilan Daftar Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 font-medium">Belum ada kelas aktif. Buat kelas baru sekarang!</div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-52 hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Top Row Info */}
              <div>
                <div className="flex justify-between items-start">
                  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                    <BookOpen size={20} />
                  </div>
                  {isAdminOrInstructor && (
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-slate-800 text-lg mt-4 line-clamp-1">{cls.className}</h3>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
                  <Layers size={13} className="text-slate-300" />
                  <span className="truncate">Modul: {cls.packageName}</span>
                </div>
              </div>

              {/* Token Area */}
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kode Akses Kelas</span>
                  <span className="font-mono text-xl font-black text-indigo-600 tracking-wider">{cls.classCode}</span>
                </div>
                
                <button
                  onClick={() => handleCopyCode(cls.classCode, cls.id)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold
                    ${copiedId === cls.id 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100'
                    }`}
                >
                  {copiedId === cls.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === cls.id ? "Tersalin" : "Salin"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassManagement;