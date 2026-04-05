import React from 'react';
import { BrainCircuit, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Map Placeholder */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <TrendingUp size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400 font-medium italic text-center">
            [ Visualisasi Grafik Radar Skill Karir Akan Muncul Di Sini ]
          </p>
          <p className="text-[10px] text-slate-300 mt-2 italic text-center">
            (Berdasarkan integrasi data Layer 1 & 2)
          </p>
        </div>

        {/* AI Interpretation */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                <BrainCircuit className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold">Smart Analysis Insight</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <Sparkles className="text-amber-400 shrink-0" size={20} />
                <p className="text-sm text-slate-300 leading-relaxed">
                  Berdasarkan performa kuis React (90%) dan Problem Solving (85%), kamu sangat direkomendasikan menjadi <span className="text-indigo-400 font-bold underline">Software Engineer.</span>
                </p>
              </div>

              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <AlertCircle className="text-indigo-400 shrink-0" size={20} />
                <p className="text-sm text-slate-300 leading-relaxed">
                  <span className="font-bold text-white italic underline">Saran Perbaikan:</span> Skill komunikasimu (65%) perlu ditingkatkan untuk kolaborasi tim yang lebih baik.
                </p>
              </div>
            </div>
          </div>

          <button className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-900/20">
            Download Career Roadmap (.pdf)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;