import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { KeyRound, CheckCircle2, ArrowRight, BookOpen, Layers } from 'lucide-react';

const JoinClass = ({ user }) => {
  const [classCode, setClassCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [joinedClass, setJoinedClass] = useState(null);

  // States untuk direktori kelas rekomendasi
  const [availableClasses, setAvailableClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  // 1. Ambil data kelas yang sudah diikuti user secara Real-time
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().classCode) {
        setJoinedClass({
          classCode: docSnap.data().classCode,
          className: docSnap.data().className || "Kelas Aktif",
          packageName: docSnap.data().packageName || "Paket Asesmen"
        });
      } else {
        setJoinedClass(null);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 2. Ambil daftar seluruh kelas aktif di platform
  useEffect(() => {
    const fetchAvailableClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const querySnapshot = await getDocs(collection(db, "classes"));
        const classesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAvailableClasses(classesData);
      } catch (e) {
        console.error("Gagal mengambil data kelas:", e);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchAvailableClasses();
  }, []);

  // 3. Fungsi pencocokan karir pintar berdasarkan kata kunci nama kelas jika field targetJob/targetCareer kosong
  const checkCareerMatch = (classData, userTargetJob) => {
    if (!userTargetJob) return false;

    // Jika kelas memiliki data karir target eksplisit
    const classTarget = classData.targetJob || classData.targetCareer;
    if (classTarget) {
      return classTarget.toLowerCase() === userTargetJob.toLowerCase();
    }

    // Fallback: Cocokkan nama kelas dengan keyword karir impian
    const name = (classData.className || "").toLowerCase();
    const target = userTargetJob.toLowerCase();

    if (target === 'software-eng' || target === 'frontend') {
      return name.includes("web") || name.includes("software") || name.includes("react") || 
             name.includes("coding") || name.includes("pemrograman") || name.includes("javascript") ||
             name.includes("frontend") || name.includes("html") || name.includes("css") || name.includes("developer");
    }
    if (target === 'data-analyst') {
      return name.includes("data") || name.includes("analyst") || name.includes("database") || 
             name.includes("sql") || name.includes("python") || name.includes("statistik") || name.includes("machine learning");
    }
    if (target === 'uiux') {
      return name.includes("ui") || name.includes("ux") || name.includes("design") || 
             name.includes("figma") || name.includes("interface") || name.includes("desain") || name.includes("prototyping");
    }
    if (target === 'marketing') {
      return name.includes("marketing") || name.includes("bisnis") || name.includes("sales") || 
             name.includes("digital marketing") || name.includes("pemasaran");
    }
    if (target === 'frontend' && !name.includes("web")) { // Front Office / Customer Service
      return name.includes("office") || name.includes("front") || name.includes("pelayanan") || name.includes("customer");
    }
    if (target === 'admin') {
      return name.includes("admin") || name.includes("arsip") || name.includes("perkantoran") || name.includes("administrasi");
    }

    return false;
  };

  // 4. Fungsi untuk Join Kelas menggunakan Kode
  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) return;

    setIsLoading(true);
    try {
      const targetCode = classCode.trim().toUpperCase();
      const q = query(collection(db, "classes"), where("classCode", "==", targetCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("❌ Kode kelas tidak ditemukan! Periksa kembali kode dari instruktur Anda.");
        setIsLoading(false);
        return;
      }

      const classDoc = querySnapshot.docs[0];
      const classData = classDoc.data();

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        classId: classDoc.id,
        classCode: targetCode,
        className: classData.className,
        packageId: classData.packageId,
        packageName: classData.packageName
      });

      alert(`🎉 Berhasil bergabung dengan kelas: ${classData.className}`);
      setClassCode("");
    } catch (error) {
      console.error("Gagal join kelas:", error);
      alert("❌ Terjadi kesalahan saat mencoba bergabung dengan kelas.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={joinedClass ? "max-w-md mx-auto my-10" : "max-w-6xl mx-auto my-10"}>
      {/* KONDISI 1: JIKA USER BELUM JOIN KELAS MANAPUN */}
      {!joinedClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Kolom Kiri: Input Kode Kelas */}
          <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-6 self-start animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
              <KeyRound size={32} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-800">Gabung Kelas Baru</h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Masukkan 6 digit kode akses unik yang diberikan oleh instruktur Anda untuk masuk ke ruang kelas dan mengakses paket soal.
              </p>
            </div>

            <form onSubmit={handleJoinClass} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                required
                placeholder="Contoh: UNN3A9"
                className="w-full text-center p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xl font-black uppercase tracking-widest placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || classCode.length < 6}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer
                  ${isLoading || classCode.length < 6
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                  }`}
              >
                {isLoading ? "Memproses..." : "Gabung ke Kelas"}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Direktori Kelas Rekomendasi */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <BookOpen className="text-indigo-600" /> Eksplorasi Kelas Rekomendasi
              </h2>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Berikut adalah daftar kelas aktif di platform. Cari kelas yang sesuai dengan minat karir Anda, lalu tanyakan kode aksesnya ke Instruktur/Dosen pengampu Anda.
              </p>
            </div>

            {isLoadingClasses ? (
              <div className="p-10 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-100">
                Memuat kelas... ⏳
              </div>
            ) : availableClasses.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-100">
                Belum ada kelas yang terdaftar aktif di sistem saat ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-125 overflow-y-auto pr-2">
                {availableClasses.map((cls) => {
                  const isMatched = checkCareerMatch(cls, user.targetJob);
                  
                  return (
                    <div 
                      key={cls.id}
                      className={`p-6 rounded-2xl border transition-all bg-white shadow-xs hover:shadow-md flex flex-col justify-between gap-4 ${
                        isMatched 
                          ? 'border-indigo-200 bg-indigo-50/5 ring-1 ring-indigo-50' 
                          : 'border-slate-150'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-base">{cls.className}</h4>
                          <p className="text-xs text-slate-400 font-medium">Instruktur: {cls.instructorName || "Dosen Pengampu"}</p>
                        </div>
                        {isMatched && (
                          <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-200/50">
                            ✨ Cocok dengan Karir Impian
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Layers size={14} className="text-slate-400" />
                          <span>Materi Asesmen: <strong>{cls.packageName || "Umum"}</strong></span>
                        </div>
                        <div className="text-[10px] text-indigo-500 font-extrabold bg-indigo-50/85 px-2.5 py-1 rounded-lg uppercase font-mono tracking-wider">
                          Kode Akses: ****** (Hubungi Dosen)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* KONDISI 2: JIKA USER SUDAH BERHASIL JOIN KELAS */
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center text-emerald-600 mx-auto border-2 border-emerald-200">
            <CheckCircle2 size={32} />
          </div>

          <div>
            <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-[10px] tracking-wide uppercase">
              Terdaftar Aktif
            </span>
            <h2 className="text-xl font-black text-slate-800 mt-3">{joinedClass.className}</h2>
            <p className="text-xs text-slate-400 font-medium mt-1 font-mono tracking-wider">
              Kode Akses: {joinedClass.classCode}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
              <Layers size={14} className="text-slate-400" />
              Paket Ujian Terpilih
            </div>
            <p className="text-sm font-semibold text-slate-700">{joinedClass.packageName}</p>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed italic">
            *Jika Anda salah memasukkan kelas, hubungi Instruktur Anda untuk mereset data keanggotaan kelas Anda.
          </p>
        </div>
      )}
    </div>
  );
};

export default JoinClass;