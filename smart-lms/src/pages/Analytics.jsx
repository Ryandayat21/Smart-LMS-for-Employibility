import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { Target, Info, Sparkles, RefreshCw } from 'lucide-react';

const Analytics = ({ user }) => {
  const [aiSummary, setAiSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const toPercent = (val) => (val ? val * 20 : 0);

  const data = [
    { subject: 'Technical',     A: toPercent(user.skills?.technical),            fullMark: 100 },
    { subject: 'Comm.',         A: toPercent(user.skills?.communication),         fullMark: 100 },
    { subject: 'Prob. Solving', A: toPercent(user.skills?.problemSolving),        fullMark: 100 },
    { subject: 'Leadership',    A: toPercent(user.skills?.leadership),            fullMark: 100 },
    { subject: 'Teamwork',      A: toPercent(user.skills?.teamwork),              fullMark: 100 },
    { subject: 'Emotional',     A: toPercent(user.skills?.emotionalIntel),        fullMark: 100 },
    { subject: 'Digital',       A: toPercent(user.skills?.digitalLiteracy),       fullMark: 100 },
    { subject: 'Critical',      A: toPercent(user.skills?.criticalThinking),      fullMark: 100 },
    { subject: 'Detail',        A: toPercent(user.skills?.attentionDetail),       fullMark: 100 },
    { subject: 'Ethics',        A: toPercent(user.skills?.workEthic),             fullMark: 100 },
  ];

  // ══════════════════════════════════
  // 1. Load rangkuman dari Firestore kalau sudah ada
  // ══════════════════════════════════
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summaryRef = doc(db, "ai_summaries", user.uid);
        const snap = await getDoc(summaryRef);
        if (snap.exists() && snap.data().summary) {
          setAiSummary(snap.data().summary);
          setIsSaved(true);
        }
      } catch (e) {
        console.error("Gagal load rangkuman:", e);
      }
    };

    if (user?.uid) loadSummary();
  }, [user?.uid]);

  // ══════════════════════════════════
  // 2. Generate + Simpan Rangkuman AI
  // ══════════════════════════════════
  const generateAndSaveSummary = async () => {
    if (!user?.skills || Object.keys(user.skills).length === 0) {
      alert("Kamu belum menyelesaikan assessment. Selesaikan assessment dulu!");
      return;
    }

    setIsGenerating(true);
    setIsSaved(false);

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const models = [
      "meta-llama/llama-3.3-70b-instruct:free",
      "stepfun/step-3.5-flash:free",
      "google/gemma-3-27b-it:free",
    ];

    const prompt = `
Kamu adalah Career Advisor dari Smart LMS. Buat rangkuman singkat dan profesional tentang profil kompetensi mahasiswa berikut.

Data Mahasiswa:
- Nama: ${user.fullName || user.name}
- Target Karir: ${user.targetJob || "Belum ditentukan"}
- Pendidikan: ${user.education || "Tidak diketahui"}
- Skor Skill (skala 1-5):
  • Technical: ${user.skills?.technical || 0}
  • Communication: ${user.skills?.communication || 0}
  • Problem Solving: ${user.skills?.problemSolving || 0}
  • Leadership: ${user.skills?.leadership || 0}
  • Teamwork: ${user.skills?.teamwork || 0}
  • Work Ethic: ${user.skills?.workEthic || 0}
  • Digital Literacy: ${user.skills?.digitalLiteracy || 0}
  • Critical Thinking: ${user.skills?.criticalThinking || 0}
  • Attention to Detail: ${user.skills?.attentionDetail || 0}
  • Emotional Intelligence: ${user.skills?.emotionalIntel || 0}

Buat rangkuman dalam Bahasa Indonesia yang mencakup:
1. Kekuatan utama (2-3 poin skill tertinggi)
2. Area yang perlu ditingkatkan (skill terendah)
3. Kesesuaian dengan target karir ${user.targetJob}
4. Saran pengembangan diri yang konkret

Format: paragraf singkat yang mengalir, maksimal 150 kata. Profesional, motivatif, dan objektif.
    `.trim();

    let generatedText = "";

    for (const model of models) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { 
                role: "system", 
                content: "Kamu adalah Career Advisor profesional. Berikan rangkuman singkat, padat, dan objektif dalam Bahasa Indonesia." 
              },
              { role: "user", content: prompt }
            ]
          })
        });

        if (!response.ok) continue;
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          generatedText = text;
          break;
        }
      } catch (e) {
        console.warn(`Model ${model} gagal:`, e);
        continue;
      }
    }

    if (!generatedText) {
      alert("Gagal generate rangkuman. Coba lagi.");
      setIsGenerating(false);
      return;
    }

    // ✅ Tampilkan di UI
    setAiSummary(generatedText);

    // ✅ Simpan ke Firestore collection "ai_summaries"
    try {
      const summaryRef = doc(db, "ai_summaries", user.uid);
      await setDoc(summaryRef, {
        uid: user.uid,
        name: user.fullName || user.name,
        targetJob: user.targetJob || "",
        education: user.education || "",
        skills: user.skills,
        summary: generatedText,
        generatedAt: new Date(),
      });
      setIsSaved(true);
      console.log("✅ Rangkuman tersimpan ke Firestore!");
    } catch (e) {
      console.error("❌ Gagal simpan rangkuman:", e);
    }

    setIsGenerating(false);
  };

  const hasSkills = user?.skills && Object.keys(user.skills).length > 0;

  return (
    <div className="flex flex-col gap-6">

      {/* Radar Chart */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="text-indigo-600" /> Career Skill Radar
            </h3>
            <p className="text-sm text-slate-500">
              Analisis Kompetensi {user.fullName || user.name}:{" "}
              <span className="font-semibold text-indigo-600">
                {user.targetJob || 'Belum ditentukan'}
              </span>
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-full cursor-help group relative">
            <Info size={20} className="text-slate-400" />
            <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
              Grafik ini dikonversi dari penilaian AI (1-5) menjadi skala 100%.
            </div>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Kompetensi"
                dataKey="A"
                stroke="#4f46e5"
                strokeWidth={3}
                fill="#4f46e5"
                fillOpacity={0.3}
              />
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {data.map((item) => (
            <div key={item.subject} className="text-center p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
              <p className="text-[10px] text-slate-400 uppercase font-bold">{item.subject}</p>
              <p className="text-lg font-bold text-slate-700">{item.A}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;