import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { HfInference } from "@huggingface/inference";

const ConversationTest = ({ user, currentQuestion, onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("idle"); // idle, recording, transcribing, analysing
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const speakFeedback = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        await handleTranscription(blob); // Langsung transkripsi pas stop
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setStatus("recording");
    } catch (err) {
      alert("Akses mik ditolak atau tidak ditemukan.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // 1. STT: Hugging Face Whisper v3
  const hf = new HfInference(import.meta.env.VITE_HF_TOKEN);

  const handleTranscription = async () => {
    if (!audioBlob) return;
    setIsAnalysing(true);
    try {
      const result = await hf.automaticSpeechRecognition({
        model: 'openai/whisper-large-v3',
        data: audioBlob,
      });
      setTranscript(result.text || "Gagal menangkap suara.");
    } catch (error) {
      console.error("Whisper Error:", error);
      setTranscript("Error transkripsi, coba lagi.");
    } finally {
      setIsAnalysing(false);
    }
  };

  // 2. LLM: OpenRouter (Llama 3 / Gemini)
  const submitToAI = async (retryCount = 0) => {
    setStatus("analysing");
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Gunakan Gemini Flash agar lebih stabil dibanding Llama gratisan
          model: "google/gemma-4-31b-it:free", 
          messages: [
            {
              role: "system",
              content: `Anda penilai Skillvora. Skenario: ${currentQuestion.scenario}. 
              Berikan skor 1-5 untuk aspek: ${currentQuestion.targetedAspects.join(", ")}.
              WAJIB FORMAT JSON: {"skills": {"aspek": skor}, "feedback": "kalimat"}`
            },
            { role: "user", content: transcript }
          ]
        })
      });

      // 1. Handling Rate Limit (Error 429) dengan Auto-Retry
      if (response.status === 429 && retryCount < 2) {
        console.log(`Antrean penuh, mencoba lagi (percobaan ke-${retryCount + 1})...`);
        await new Promise(res => setTimeout(res, 3000)); // Tunggu 3 detik
        return submitToAI(retryCount + 1);
      }

      const result = await response.json();

      // 2. Safety Check: Pastikan data 'choices' benar-benar ada sebelum dibaca
      if (!result || !result.choices || result.choices.length === 0) {
        throw new Error("AI sedang sibuk atau tidak memberikan respon valid.");
      }

      const rawContent = result.choices[0].message.content;
      const cleanedJson = rawContent.replace(/```json|```/g, '').trim();
      const content = JSON.parse(cleanedJson);

      // 3. Simpan ke Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { skills: content.skills }, { merge: true });

      speakFeedback(content.feedback);
      onComplete();

    } catch (error) {
      console.error("Detail Error:", error);
      alert("AI gagal menilai karena antrean penuh. Tunggu 5 detik lalu klik 'Kirim' lagi ya!");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={status === "transcribing" || status === "analysing"}
          className={`p-8 rounded-full transition-all ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-600 hover:scale-105'
          } text-white disabled:bg-slate-400`}
        >
          {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
        </button>
        <p className="font-medium text-slate-600">
          {status === "recording" && "🔴 Sedang merekam..."}
          {status === "transcribing" && "⏳ Menyalin suara ke teks..."}
          {status === "idle" && !transcript && "Klik mic untuk mulai bicara"}
          {status === "idle" && transcript && "Selesai! Periksa jawaban lo di bawah."}
        </p>
      </div>

      {transcript && (
        <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm">
          <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Transkripsi Jawaban:</p>
          <p className="text-slate-700 leading-relaxed">"{transcript}"</p>
        </div>
      )}

      <button
        onClick={submitToAI}
        disabled={!transcript || status !== "idle"}
        className="w-full py-4 bg-[#111827] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
      >
        {status === "analysing" ? (
          <><Loader2 className="animate-spin" /> Sedang Menilai...</>
        ) : (
          <><Send size={18} /> Kirim & Lanjut</>
        )}
      </button>
    </div>
  );
};

export default ConversationTest;