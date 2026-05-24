import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { KeyRound, CheckCircle2, ArrowRight, LogIn, BookOpen, Layers } from 'lucide-react';

const JoinClass = ({ user }) => {
  const [classCode, setClassCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [joinedClass, setJoinedClass] = useState(null);

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

  // 2. Fungsi untuk Join Kelas menggunakan Kode
  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) return;

    setIsLoading(true);
    try {
      // Cari kelas di koleksi "classes" berdasarkan classCode (case-insensitive uppercase)
      const targetCode = classCode.trim().toUpperCase();
      const q = query(collection(db, "classes"), where("classCode", "==", targetCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("❌ Kode kelas tidak ditemukan! Periksa kembali kode dari instruktur Anda.");
        setIsLoading(false);
        return;
      }

      // Ambil data kelas yang ditemukan
      const classDoc = querySnapshot.docs[0];
      const classData = classDoc.data();

      // Update data user di Firestore
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
    <div className="max-w-md mx-auto my-10 space-y-6">
      {/* KONDISI 1: JIKA USER BELUM JOIN KELAS MANAPUN */}
      {!joinedClass ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-150">
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
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
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