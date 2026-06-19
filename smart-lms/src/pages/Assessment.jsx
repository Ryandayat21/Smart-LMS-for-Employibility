import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, query, orderBy, where, getDoc } from 'firebase/firestore';
import { CheckCircle2, ChevronRight, ClipboardList, Sparkles, ShieldCheck, BookOpen, Target } from 'lucide-react';
import ConversationTest from "../components/ConversationTest";

const Assessment = ({ user, setActiveTab }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [questionSource, setQuestionSource] = useState(''); // 'package' or 'direct'

  // ✅ Layar instruksi & konfirmasi
  const [isStarted, setIsStarted] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  // ✅ Pisahkan soal PG dan conversation
  const pgQuestions = questions.filter(q => q.type === 'pg');
  const conversationQuestions = questions.filter(q => q.type === 'conversation');

  // ✅ Soal PG yang sedang aktif (index terpisah dari conversation)
  const [pgIndex, setPgIndex] = useState(0);

  // ✅ Mode: 'pg' dulu, baru 'conversation' di akhir
  const [mode, setMode] = useState('pg');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        let querySnapshot;
        
        // Prioritas 1: Soal dari paket kelas yang diikuti user
        if (user?.packageId) {
          const pkgQuestionsRef = collection(db, "question_packages", user.packageId, "questions");
          querySnapshot = await getDocs(query(pkgQuestionsRef, orderBy("order", "asc")));
          
          if (!querySnapshot.empty) {
            setQuestionSource('package');
            try {
              const pkgDoc = await getDoc(doc(db, "question_packages", user.packageId));
              if (pkgDoc.exists() && pkgDoc.data().targetScores) {
                await setDoc(doc(db, "users", user.uid), { targetScores: pkgDoc.data().targetScores }, { merge: true });
              }
            } catch (e) {
              console.error("Gagal menyimpan targetScores dari packageId:", e);
            }
          }
        }
        
        // Prioritas 2: Asesmen Awal berdasarkan Target Job atau Default
        if (!querySnapshot || querySnapshot.empty) {
          const pkgsRef = collection(db, "question_packages");
          const pkgsSnap = await getDocs(pkgsRef);
          
          if (!pkgsSnap.empty) {
            const allPkgs = pkgsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            // Helper to normalize string (lowercase, remove all spaces)
            const normalizeString = (str) => {
              if (!str) return "";
              return str.toLowerCase().replace(/\s+/g, '');
            };

            const normalizedUserJob = normalizeString(user?.targetJob);
            
            // Cari paket yang cocok persis (case & space insensitive)
            let matchedPkg = null;
            if (normalizedUserJob) {
               matchedPkg = allPkgs.find(pkg => normalizeString(pkg.targetJob) === normalizedUserJob);
            }
            
            // Jika tidak ada yang cocok, cari paket dengan targetJob 'default'
            if (!matchedPkg) {
               matchedPkg = allPkgs.find(pkg => normalizeString(pkg.targetJob) === "default");
            }
            
            if (matchedPkg) {
              const targetQuestionsRef = collection(db, "question_packages", matchedPkg.id, "questions");
              querySnapshot = await getDocs(query(targetQuestionsRef, orderBy("order", "asc")));
              
              if (!querySnapshot.empty) {
                // Determine source for display
                if (normalizeString(matchedPkg.targetJob) === "default") {
                  setQuestionSource('defaultPkg');
                } else {
                  setQuestionSource('targetJob');
                }
                
                // Save targetScores to user
                if (matchedPkg.targetScores) {
                  try {
                    await setDoc(doc(db, "users", user.uid), { targetScores: matchedPkg.targetScores }, { merge: true });
                  } catch (e) {
                    console.error("Gagal menyimpan targetScores dari matchedPkg:", e);
                  }
                }
              }
            }
          }
        }

        // Fallback Terakhir: Direct Assessment (Umum / flat collection) jika paket default tidak ada
        if (!querySnapshot || querySnapshot.empty) {
          querySnapshot = await getDocs(collection(db, "questions"));
          setQuestionSource('direct');
        }
        
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setQuestions(data);
      } catch (error) {
        console.error("Gagal memuat soal:", error);
      }
    };
    fetchQuestions();
  }, [user?.packageId, user?.targetJob]);

  const handlePGAnswer = async (score) => {
    const currentPG = pgQuestions[pgIndex];
    const aspect = currentPG.aspect;

    const currentAspectData = user.skills_meta?.[aspect] || { totalScore: 0, count: 0 };
    const newTotalScore = currentAspectData.totalScore + score;
    const newCount = currentAspectData.count + 1;
    const averageScore = Math.round((newTotalScore / newCount) * 10) / 10;

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        skills: { [aspect]: averageScore },
        skills_meta: {
          [aspect]: { totalScore: newTotalScore, count: newCount }
        }
      }, { merge: true });
    } catch (error) {
      console.error("Gagal update skor:", error);
    }

    // ✅ Setelah PG habis → switch ke mode conversation
    if (pgIndex < pgQuestions.length - 1) {
      setPgIndex(prev => prev + 1);
    } else {
      if (conversationQuestions.length > 0) {
        setMode('conversation'); // Lanjut ke conversation batch
      } else {
        setIsFinished(true);    // Tidak ada conversation, langsung selesai
      }
    }
  };

  // ✅ Dipanggil ConversationTest setelah semua soal conversation selesai dinilai AI
  const handleConversationComplete = (result) => {
    setIsFinished(true);
  };

  if (questions.length === 0) return (
    <div className="p-10 text-center text-slate-500">Memuat Soal... ⏳</div>
  );

  // ✅ Layar panduan & konfirmasi persiapan ujian sebelum dimulai
  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <ClipboardList size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Konfirmasi Persiapan Asesmen</h2>
            <p className="text-slate-500 text-sm mt-1">
              Selamat datang di sistem asesmen kompetensi kerja AI. Harap persiapkan diri Anda sebelum memulai pengerjaan.
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilihan Ganda</span>
            <span className="text-base font-bold text-slate-800">{pgQuestions.length} Butir Soal</span>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Conversation</span>
            <span className="text-base font-bold text-slate-800">{conversationQuestions.length} Butir Kasus</span>
          </div>

          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Kompetensi</span>
            <span className="text-base font-bold text-indigo-600 capitalize">{user?.targetJob ? user.targetJob.replace('-', ' ') : 'Umum'}</span>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sumber Soal</span>
            <span className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-500" />
              {questionSource === 'package' ? (user?.packageName || 'Paket Kelas') : 
               questionSource === 'targetJob' ? `Asesmen Awal: ${user?.targetJob}` : 
               'Asesmen Umum (Default)'}
            </span>
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Ketentuan & Panduan Ujian:</h3>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex gap-2.5 items-start">
              <span className="flex p-0.5 rounded-full bg-indigo-50 text-indigo-600 mt-0.5"><Sparkles size={12} /></span>
              <span><strong>Navigasi Sekuensial:</strong> Jawaban pilihan ganda akan langsung disimpan begitu Anda memilih opsi, dan soal berikutnya akan dimuat otomatis.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="flex p-0.5 rounded-full bg-indigo-50 text-indigo-600 mt-0.5"><Sparkles size={12} /></span>
              <span><strong>AI Conversation (Verbal):</strong> Setelah soal PG habis, Anda akan menjawab kasus secara verbal lewat audio. Pastikan izin mikrofon browser aktif.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <span className="flex p-0.5 rounded-full bg-indigo-50 text-indigo-600 mt-0.5"><Sparkles size={12} /></span>
              <span><strong>Analisis Real-Time:</strong> Selesai ujian, data kompetensi dan visualisasi radar kompetensi Anda akan langsung terupdate di dashboard.</span>
            </li>
          </ul>
        </div>

        {/* Academic Integrity Pledge Checkbox */}
        <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
          <input
            id="integrity-pledge"
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="h-4 w-4 mt-0.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
          />
          <label htmlFor="integrity-pledge" className="text-xs text-amber-900 leading-relaxed cursor-pointer select-none">
            <strong>Pakta Integritas:</strong> Saya menyatakan akan mengerjakan asesmen mandiri ini dengan jujur dan sungguh-sungguh tanpa bantuan orang lain demi hasil rekomendasi karir AI yang akurat.
          </label>
        </div>

        <button
          onClick={() => setIsStarted(true)}
          disabled={!isAgreed}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <ShieldCheck size={18} />
          Mulai Ujian Sekarang
        </button>
      </div>
    );
  }

  if (isFinished) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-sm text-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <CheckCircle2 size={64} className="text-green-500" />
      <h2 className="text-2xl font-bold text-slate-800">Assessment Selesai! 🎉</h2>
      <p className="text-slate-500 text-sm max-w-md mx-auto">
        Skor kompetensi Anda telah disimpan secara otomatis. Langkah selanjutnya adalah melengkapi portofolio proyek di halaman Dashboard Anda.
      </p>
      <button
        onClick={() => {
          if (setActiveTab) setActiveTab('dashboard');
        }}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-100 flex items-center gap-2 cursor-pointer"
      >
        Lanjut ke Dashboard (Unggah Proyek)
      </button>
    </div>
  );

  // ✅ Mode Conversation: semua soal conversation di-pass sekaligus
  if (mode === 'conversation') {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
            🎤 AI Conversation
          </span>
          <ConversationTest
            user={user}
            questions={conversationQuestions} // ✅ Pass array, bukan object
            onComplete={handleConversationComplete}
          />
        </div>
      </div>
    );
  }

  // ✅ Mode PG
  const currentPG = pgQuestions[pgIndex];

  if (!currentPG) return null;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-500"
          style={{ width: `${((pgIndex + 1) / pgQuestions.length) * 100}%` }}
        />
      </div>

      <p className="text-center text-sm text-slate-400">
        Soal {pgIndex + 1} dari {pgQuestions.length}
        {conversationQuestions.length > 0 && (
          <span className="ml-2 text-indigo-400">
            (+{conversationQuestions.length} soal conversation setelahnya)
          </span>
        )}
      </p>

      {/* Card Pertanyaan PG */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
          📝 Pilihan Ganda
        </span>
        <h2 className="text-2xl font-bold text-slate-800 mt-4 mb-8">
          {currentPG.questionText}
        </h2>
        <div className="flex flex-col gap-3">
          {currentPG.options?.map((opt, i) => (
            <button
              key={i}
              onClick={() => handlePGAnswer(opt.score)}
              className="w-full p-4 text-left border border-slate-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all flex justify-between group"
            >
              <span className="font-medium text-slate-700">{opt.text}</span>
              <ChevronRight className="text-slate-300 group-hover:text-indigo-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assessment;