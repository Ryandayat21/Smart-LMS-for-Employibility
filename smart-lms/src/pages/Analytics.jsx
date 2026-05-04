import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { Target, Info } from 'lucide-react';

const Analytics = ({ user }) => {
  // Fungsi helper buat konversi skor 1-5 ke 0-100%
  const toPercent = (val) => (val ? val * 20 : 0);

  // Sesuaikan key dengan apa yang dikirim oleh AI di ConversationTest (camelCase)
  const data = [
    { subject: 'Technical', A: toPercent(user.skills?.technical), fullMark: 100 },
    { subject: 'Comm.', A: toPercent(user.skills?.communication), fullMark: 100 },
    { subject: 'Prob. Solving', A: toPercent(user.skills?.problemSolving), fullMark: 100 },
    { subject: 'Leadership', A: toPercent(user.skills?.leadership), fullMark: 100 },
    { subject: 'Teamwork', A: toPercent(user.skills?.teamwork), fullMark: 100 },
    { subject: 'Emotional', A: toPercent(user.skills?.emotionalIntel), fullMark: 100 },
    { subject: 'Digital', A: toPercent(user.skills?.digitalLiteracy), fullMark: 100 },
    { subject: 'Critical', A: toPercent(user.skills?.criticalThinking), fullMark: 100 },
    { subject: 'Detail', A: toPercent(user.skills?.attentionDetail), fullMark: 100 },
    { subject: 'Ethics', A: toPercent(user.skills?.workEthic), fullMark: 100 },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex-1">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="text-indigo-600" /> Career Skill Radar
            </h3>
            <p className="text-sm text-slate-500">
              Analisis Kompetensi Ryan Hidayat: <span className="font-semibold text-indigo-600">{user.targetJob || 'Data Analyst'}</span>
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-full cursor-help group relative">
            <Info size={20} className="text-slate-400" />
            <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
              Grafik ini dikonversi dari penilaian AI (1-5) menjadi skala 100%.
            </div>
          </div>
        </div>

        <div className="w-full h-80 md:h-112.5">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} 
              />
              {/* Domain diset ke 0-100 agar radar tidak terlihat kecil */}
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