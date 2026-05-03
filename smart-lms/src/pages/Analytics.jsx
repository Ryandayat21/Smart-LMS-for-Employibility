import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { Target, Info } from 'lucide-react';

const Analytics = ({ user }) => {
  // Format data dari user.skills untuk Recharts
  const data = [
    { subject: 'Technical', A: user.skills?.technical || 0, fullMark: 5 },
    { subject: 'Comm.', A: user.skills?.communication || 0, fullMark: 5 },
    { subject: 'Prob. Solving', A: user.skills?.problemSolving || 0, fullMark: 5 },
    { subject: 'Leadership', A: user.skills?.leadership || 0, fullMark: 5 },
    { subject: 'Teamwork', A: user.skills?.teamwork || 0, fullMark: 5 },
    { subject: 'Emotional', A: user.skills?.emotionalIntel || 0, fullMark: 5 },
    { subject: 'Digital', A: user.skills?.digitalLiteracy || 0, fullMark: 5 },
    { subject: 'Critical', A: user.skills?.criticalThinking || 0, fullMark: 5 },
    { subject: 'Detail', A: user.skills?.attentionDetail || 0, fullMark: 5 },
    { subject: 'Ethics', A: user.skills?.workEthic || 0, fullMark: 5 },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex-1">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="text-indigo-600" /> Career Skill Radar
            </h3>
            <p className="text-sm text-slate-500">Visualisasi 10 Aspek Kompetensi terhadap Target: <span className="font-semibold text-indigo-600">{user.targetJob}</span></p>
          </div>
          <div className="p-2 bg-slate-50 rounded-full cursor-help group relative">
            <Info size={20} className="text-slate-400" />
            <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
              Grafik ini akan otomatis berubah setiap kali Anda menyelesaikan Direct Assessment.
            </div>
          </div>
        </div>

        {/* Radar Chart Container */}
        <div className="w-full h-112.5">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
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
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend/Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {data.map((item) => (
            <div key={item.subject} className="text-center p-3 bg-slate-50 rounded-2xl">
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