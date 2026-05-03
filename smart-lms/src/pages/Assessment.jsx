import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { Mic, MicOff, Send, CheckCircle2, ChevronRight } from 'lucide-react';

const Assessment = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [pgScores, setPgScores] = useState({}); // ✅ Simpan skor PG sementara

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, "questions"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // ✅ Urutkan soal: PG dulu, baru conversation
      data.sort((a, b) => a.order - b.order);
      setQuestions(data);
    };
    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];

  // ✅ Perbaikan: Simpan skor PG sementara, baru simpan ke Firebase di akhir
  const handlePGAnswer = async (score) => {
      const aspect = currentQuestion.aspect;

      // Update state lokal (tetap pertahankan ini untuk tracking)
      const newScores = { ...pgScores, [aspect]: score };
      setPgScores(newScores);

      // ✅ SIMPAN LANGSUNG KE DOKUMEN USER (Bukan assessment_results)
      try {
        const userRef = doc(db, "users", user.uid); // Path harus ke koleksi users
        await setDoc(userRef, {
          skills: {
            [aspect]: score // Masukkan ke dalam map skills
          }
        }, { merge: true });
        
        console.log(`✅ Tersimpan di Dashboard: ${aspect} = ${score}`);
      } catch (error) {
        console.error("❌ Gagal simpan:", error);
      }

      nextQuestion(newScores);
    };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser tidak mendukung Speech Recognition. Gunakan Chrome!");

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (e) => {
      console.error("Speech error:", e);
      setIsRecording(false);
    };
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
    };

    recognition.start();
  };

  // ✅ Perbaikan lengkap AI Grader
  const submitVoiceAnswer = async () => {
    if (!transcript) return;
    setIsAnalysing(true);

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          messages: [
            {
              role: "system",
              content: `Anda adalah penilai kompetensi untuk Smart LMS Employability Assessment.
Skenario pertanyaan: "${currentQuestion.scenario}"
Aspek yang dinilai: ${currentQuestion.targetedAspects.join(", ")}

INSTRUKSI PENILAIAN:
- Berikan skor 1-5 untuk setiap aspek yang disebutkan
- Skor 1 = Sangat Kurang, 5 = Sangat Baik
- Jika jawaban tidak relevan atau tidak nyambung, beri skor 1
- Jika jawaban kosong atau terlalu pendek, beri skor 1

FORMAT OUTPUT HARUS JSON PERSIS SEPERTI INI (tanpa teks lain):
{
  "skills": {
    "namaAspek": skorAngka
  }
}

Contoh output yang benar:
{
  "skills": {
    "communication": 4,
    "leadership": 3
  }
}`
            },
            { role: "user", content: transcript }
          ]
        })
      });

      const data = await response.json();

      // ✅ Perbaikan: Handle kalau AI tidak balas JSON
      let result;
      try {
        const raw = data.choices[0].message.content;
        const cleaned = raw.replace(/```json|```/g, '').trim();
        result = JSON.parse(cleaned);
      } catch (e) {
        console.error("AI tidak balas JSON:", e);
        alert("AI gagal memproses jawaban. Coba jawab lagi.");
        setIsAnalysing(false);
        return;
      }

      // ✅ Gabungkan skor conversation dengan skor PG
      const allScores = {
        ...pgScores,
        ...result.skills
      };

      // ✅ Simpan ke Firebase sekali di akhir
      const resultRef = doc(db, "assessment_results", user.uid);
      await setDoc(resultRef, {
        skills: allScores,
        completedAt: new Date(),
        userId: user.uid
      }, { merge: true });

      setTranscript("");
      nextQuestion();

    } catch (error) {
      console.error("AI Error:", error);
      alert("Koneksi AI bermasalah. Coba lagi.");
    } finally {
      setIsAnalysing(false);
    }
  };

  // ✅ Simpan semua skor ke Firebase saat assessment selesai
  const nextQuestion = async (latestScores = pgScores) => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Assessment selesai
      setIsFinished(true);
    }
  };

  if (questions.length === 0) return (
    <div className="p-10 text-center text-slate-500">
      Memuat Soal... ⏳
    </div>
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
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Info Progress */}
      <p className="text-center text-sm text-slate-400">
        Soal {currentIndex + 1} dari {questions.length}
      </p>

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
            {currentQuestion.options.map((opt, i) => (
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

        {/* MODE CONVERSATION VOICE */}
        {currentQuestion.type === 'conversation' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
              <button
                onClick={startRecording}
                disabled={isRecording}
                className={`p-6 rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-500 animate-pulse text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
              <p className="text-sm font-medium text-slate-500">
                {isRecording ? "🔴 Mendengarkan... (bicara sekarang)" : "Klik mic dan mulai bicara"}
              </p>
            </div>

            {/* Tampilkan hasil transkripsi */}
            {transcript && (
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-400 mb-1 font-semibold">Jawaban kamu:</p>
                <p className="italic text-slate-700">"{transcript}"</p>
                <button
                  onClick={() => setTranscript("")}
                  className="text-xs text-red-400 mt-2 hover:underline"
                >
                  Hapus & rekam ulang
                </button>
              </div>
            )}

            <button
              onClick={submitVoiceAnswer}
              disabled={!transcript || isAnalysing}
              className="w-full py-4 bg-[#111827] text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalysing
                ? "⏳ AI sedang menilai jawaban..."
                : <><Send size={18} /> Kirim & Nilai Jawaban</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;