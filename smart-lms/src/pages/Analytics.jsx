import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { Target, Info, Sparkles, RefreshCw } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

const jobStandards = {
  "software-eng": {
    technical: 5,
    communication: 3.5,
    problemSolving: 5,
    leadership: 3,
    teamwork: 4,
    emotionalIntel: 3.5,
    digitalLiteracy: 4.5,
    criticalThinking: 4.5,
    attentionDetail: 4.5,
    workEthic: 4.5,
  },
  "data-analyst": {
    technical: 4,
    communication: 4,
    problemSolving: 5,
    leadership: 3,
    teamwork: 4,
    emotionalIntel: 3.5,
    digitalLiteracy: 5,
    criticalThinking: 5,
    attentionDetail: 5,
    workEthic: 4.5,
  },
  "uiux": {
    technical: 4,
    communication: 4,
    problemSolving: 4,
    leadership: 3,
    teamwork: 4.5,
    emotionalIntel: 4,
    digitalLiteracy: 4.5,
    criticalThinking: 4.5,
    attentionDetail: 5,
    workEthic: 4.5,
  },
  "marketing": {
    technical: 3,
    communication: 5,
    problemSolving: 4,
    leadership: 4,
    teamwork: 4.5,
    emotionalIntel: 4.8,
    digitalLiteracy: 4,
    criticalThinking: 4,
    attentionDetail: 3.5,
    workEthic: 4.5,
  },
  "frontend": { // Front Office / Customer Service
    technical: 2.5,
    communication: 5,
    problemSolving: 3.5,
    leadership: 3.5,
    teamwork: 4.5,
    emotionalIntel: 4.8,
    digitalLiteracy: 3.5,
    criticalThinking: 3.5,
    attentionDetail: 4,
    workEthic: 4.8,
  },
  "admin": { // Administrative Assistant
    technical: 3.5,
    communication: 4,
    problemSolving: 3.5,
    leadership: 3,
    teamwork: 4,
    emotionalIntel: 4,
    digitalLiteracy: 4.5,
    criticalThinking: 3.5,
    attentionDetail: 5,
    workEthic: 4.8,
  },
  "default": {
    technical: 3.5,
    communication: 3.5,
    problemSolving: 3.5,
    leadership: 3.5,
    teamwork: 3.5,
    emotionalIntel: 3.5,
    digitalLiteracy: 3.5,
    criticalThinking: 3.5,
    attentionDetail: 3.5,
    workEthic: 3.5,
  }
};

const Analytics = ({ user }) => {

  const toPercent = (val) => (val ? val * 20 : 0);

  const targetJob = user.targetJob || 'default';
  const standards = jobStandards[targetJob] || jobStandards['default'];

  const data = [
    { subject: 'Technical',     A: toPercent(user.skills?.technical),            B: toPercent(standards.technical),            fullMark: 100 },
    { subject: 'Comm.',         A: toPercent(user.skills?.communication),         B: toPercent(standards.communication),         fullMark: 100 },
    { subject: 'Prob. Solving', A: toPercent(user.skills?.problemSolving),        B: toPercent(standards.problemSolving),        fullMark: 100 },
    { subject: 'Leadership',    A: toPercent(user.skills?.leadership),            B: toPercent(standards.leadership),            fullMark: 100 },
    { subject: 'Teamwork',      A: toPercent(user.skills?.teamwork),              B: toPercent(standards.teamwork),              fullMark: 100 },
    { subject: 'Emotional',     A: toPercent(user.skills?.emotionalIntel),        B: toPercent(standards.emotionalIntel),        fullMark: 100 },
    { subject: 'Digital',       A: toPercent(user.skills?.digitalLiteracy),       B: toPercent(standards.digitalLiteracy),       fullMark: 100 },
    { subject: 'Critical',      A: toPercent(user.skills?.criticalThinking),      B: toPercent(standards.criticalThinking),      fullMark: 100 },
    { subject: 'Detail',        A: toPercent(user.skills?.attentionDetail),       B: toPercent(standards.attentionDetail),       fullMark: 100 },
    { subject: 'Ethics',        A: toPercent(user.skills?.workEthic),             B: toPercent(standards.workEthic),             fullMark: 100 },
  ];



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
              <span className="font-semibold text-indigo-600 capitalize">
                {user.targetJob ? user.targetJob.replace('-', ' ') : 'Belum ditentukan'}
              </span>
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-full cursor-help group relative">
            <Info size={20} className="text-slate-400" />
            <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-slate-800 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 leading-relaxed shadow-lg">
              Grafik radar membandingkan skor aktual Anda (Kompetensi Anda) dengan kualifikasi standar industri (Standar Industri) yang dikonversi ke persentase.
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
              
              {/* Layer 1: User Skills */}
              <Radar
                name="Kompetensi Anda"
                dataKey="A"
                stroke="#4f46e5"
                strokeWidth={3}
                fill="#4f46e5"
                fillOpacity={0.25}
              />
              
              {/* Layer 2: Job Ideal Standard */}
              <Radar
                name="Standar Industri"
                dataKey="B"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="#cbd5e1"
                fillOpacity={0.08}
              />
              
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              
              <Tooltip
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Competency Gap Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
          {data.map((item) => {
            const gap = item.A - item.B;
            return (
              <div key={item.subject} className="text-left p-4 bg-slate-50/70 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.subject}</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-1">{item.A}%</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] border-t border-slate-200/50 pt-2 text-slate-500 font-medium">
                  <span>Target: {item.B}%</span>
                  {gap < 0 ? (
                    <span className="text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full text-[9px]">
                      {gap}% Gap
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[9px]">
                      ✓ Ready
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>



    </div>
  );
};

export default Analytics;