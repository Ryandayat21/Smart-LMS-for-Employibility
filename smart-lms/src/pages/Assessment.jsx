import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import ConversationTest from "../components/ConversationTest";

const Assessment = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // ✅ Pisahkan soal PG dan conversation
  const pgQuestions = questions.filter(q => q.type === 'pg');
  const conversationQuestions = questions.filter(q => q.type === 'conversation');

  // ✅ Soal PG yang sedang aktif (index terpisah dari conversation)
  const [pgIndex, setPgIndex] = useState(0);

  // ✅ Mode: 'pg' dulu, baru 'conversation' di akhir
  const [mode, setMode] = useState('pg');

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, "questions"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => a.order - b.order);
      setQuestions(data);
    };
    fetchQuestions();
  }, []);

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

  if (isFinished) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-sm text-center">
      <CheckCircle2 size={64} className="text-green-500 mb-4" />
      <h2 className="text-2xl font-bold">Assessment Selesai! 🎉</h2>
      <p className="text-slate-500 mb-6">
        Skor kompetensi kamu telah disimpan. Cek hasilnya di halaman Analytics!
      </p>
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