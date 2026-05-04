import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import ConversationTest from "../components/ConversationTest";

const Assessment = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [pgScores, setPgScores] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, "questions"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Urutkan berdasarkan field 'order' yang kita buat di Firebase
      data.sort((a, b) => a.order - b.order);
      setQuestions(data);
    };
    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];

  const handlePGAnswer = async (score) => {
    const aspect = currentQuestion.aspect;
    
    // Ambil data lama atau inisialisasi jika belum ada
    const currentAspectData = user.skills_meta?.[aspect] || { totalScore: 0, count: 0 };
    
    const newTotalScore = currentAspectData.totalScore + score;
    const newCount = currentAspectData.count + 1;
    const averageScore = Math.round((newTotalScore / newCount) * 10) / 10; // Pembulatan 1 desimal

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        skills: {
          [aspect]: averageScore // Skor 1-5 yang tampil di radar/chart
        },
        skills_meta: { // Metadata tersembunyi buat keperluan hitung rata-rata
          [aspect]: {
            totalScore: newTotalScore,
            count: newCount
          }
        }
      }, { merge: true });
    } catch (error) {
      console.error("Gagal update skor:", error);
    }

    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
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

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* 1. Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 2. Info Progress */}
      <p className="text-center text-sm text-slate-400">
        Soal {currentIndex + 1} dari {questions.length}
      </p>

      {/* 3. Card Pertanyaan */}
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
          {currentQuestion.type === 'pg' ? '📝 Pilihan Ganda' : '🎤 AI Conversation'}
        </span>

        <h2 className="text-2xl font-bold text-slate-800 mt-4 mb-8">
          {currentQuestion.type === 'pg'
            ? currentQuestion.questionText
            : currentQuestion.scenario}
        </h2>

        {/* MODE PILIHAN GANDA */}
        {currentQuestion.type === 'pg' && (
          <div className="flex flex-col gap-3">
            {currentQuestion.options?.map((opt, i) => (
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
        )}

        {/* MODE CONVERSATION / VOICE */}
        {currentQuestion.type === 'conversation' && (
          <ConversationTest 
            user={user} 
            currentQuestion={currentQuestion} 
            onComplete={nextQuestion} 
          />
        )}
      </div>
    </div>
  );
};

export default Assessment;