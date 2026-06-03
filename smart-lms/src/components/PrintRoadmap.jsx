import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Legend 
} from 'recharts';
import MarkdownRenderer from './MarkdownRenderer';

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

const cleanAiResult = (text) => {
  if (!text) return "";
  return text.replace(/<\/?(kecocokan|rekomendasi|keselarasan)>/gi, "").trim();
};

const PrintRoadmap = ({ user, aiResult, siteSettings }) => {
  if (!user) return null;

  const toPercent = (val) => (val ? val * 20 : 0);
  const targetJob = user.targetJob || 'default';
  const standards = jobStandards[targetJob] || jobStandards['default'];

  const skillsData = [
    { subject: 'Technical',     A: toPercent(user.skills?.technical),            B: toPercent(standards.technical),            rawA: user.skills?.technical || 0, rawB: standards.technical },
    { subject: 'Comm.',         A: toPercent(user.skills?.communication),         B: toPercent(standards.communication),         rawA: user.skills?.communication || 0, rawB: standards.communication },
    { subject: 'Prob. Solving', A: toPercent(user.skills?.problemSolving),        B: toPercent(standards.problemSolving),        rawA: user.skills?.problemSolving || 0, rawB: standards.problemSolving },
    { subject: 'Leadership',    A: toPercent(user.skills?.leadership),            B: toPercent(standards.leadership),            rawA: user.skills?.leadership || 0, rawB: standards.leadership },
    { subject: 'Teamwork',      A: toPercent(user.skills?.teamwork),              B: toPercent(standards.teamwork),              rawA: user.skills?.teamwork || 0, rawB: standards.teamwork },
    { subject: 'Emotional',     A: toPercent(user.skills?.emotionalIntel),        B: toPercent(standards.emotionalIntel),        rawA: user.skills?.emotionalIntel || 0, rawB: standards.emotionalIntel },
    { subject: 'Digital',       A: toPercent(user.skills?.digitalLiteracy),       B: toPercent(standards.digitalLiteracy),       rawA: user.skills?.digitalLiteracy || 0, rawB: standards.digitalLiteracy },
    { subject: 'Critical',      A: toPercent(user.skills?.criticalThinking),      B: toPercent(standards.criticalThinking),      rawA: user.skills?.criticalThinking || 0, rawB: standards.criticalThinking },
    { subject: 'Detail',        A: toPercent(user.skills?.attentionDetail),       B: toPercent(standards.attentionDetail),       rawA: user.skills?.attentionDetail || 0, rawB: standards.attentionDetail },
    { subject: 'Ethics',        A: toPercent(user.skills?.workEthic),             B: toPercent(standards.workEthic),             rawA: user.skills?.workEthic || 0, rawB: standards.workEthic },
  ];

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-8 max-w-[800px] mx-auto text-slate-800 bg-white">
      {/* HEADER DOKUMEN */}
      <div className="flex justify-between items-center border-b-2 border-slate-300 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-indigo-700 tracking-wide uppercase">
            {siteSettings?.orgName || 'Skillvora'} Smart LMS
          </h2>
          <p className="text-xs text-slate-500 font-medium">Platform Penilaian Kesiapan Kerja & Kompetensi AI</p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p className="font-semibold text-slate-700">LAPORAN RESMI</p>
          <p>{currentDate}</p>
        </div>
      </div>

      {/* JUDUL UTAMA */}
      <div className="text-center my-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          CAREER DEVELOPMENT ROADMAP & SKILL GAP REPORT
        </h1>
        <div className="h-1 w-24 bg-indigo-600 mx-auto mt-2 rounded-full"></div>
      </div>

      {/* PROFIL MAHASISWA */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6 break-inside-avoid">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Mahasiswa</h3>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
          <div>
            <span className="text-slate-500 block text-xs">Nama Lengkap</span>
            <span className="font-bold text-slate-800">{user.name || user.fullName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Target Karir</span>
            <span className="font-bold text-indigo-600 capitalize">
              {targetJob.replace('-', ' ')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Email</span>
            <span className="font-medium text-slate-700">{user.email}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Pendidikan</span>
            <span className="font-medium text-slate-700">{user.education || '-'}</span>
          </div>
        </div>
      </div>

      {/* CHART DAN RINGKASAN GAP */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 break-inside-avoid">
        
        {/* Radar Chart (Kiri) */}
        <div className="md:col-span-6 flex flex-col items-center justify-center border border-slate-200 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide text-center">Grafik Radar Kompetensi</h4>
          <div className="w-[300px] h-[260px] flex items-center justify-center">
            <RadarChart width={300} height={260} cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#475569', fontSize: 9, fontWeight: 600 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              
              {/* User actual */}
              <Radar
                name="Skor Aktual Anda"
                dataKey="A"
                stroke="#4f46e5"
                strokeWidth={2}
                fill="#4f46e5"
                fillOpacity={0.2}
              />
              
              {/* Industry standards */}
              <Radar
                name="Standar Industri"
                dataKey="B"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fill="#94a3b8"
                fillOpacity={0.05}
              />
              <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 500 }} />
            </RadarChart>
          </div>
        </div>

        {/* Tabel Gap (Kanan) */}
        <div className="md:col-span-6 flex flex-col justify-between">
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-bold text-slate-500 uppercase tracking-wider">Skill</th>
                  <th scope="col" className="px-2 py-2 text-center font-bold text-slate-500 uppercase tracking-wider">Aktual</th>
                  <th scope="col" className="px-2 py-2 text-center font-bold text-slate-500 uppercase tracking-wider">Target</th>
                  <th scope="col" className="px-3 py-2 text-right font-bold text-slate-500 uppercase tracking-wider">Gap</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {skillsData.slice(0, 5).map((item) => {
                  const rawGap = item.rawA - item.rawB;
                  const pctGap = item.A - item.B;
                  return (
                    <tr key={item.subject}>
                      <td className="px-3 py-1.5 font-semibold text-slate-700">{item.subject}</td>
                      <td className="px-2 py-1.5 text-center font-bold text-slate-800">{item.rawA} ({item.A}%)</td>
                      <td className="px-2 py-1.5 text-center text-slate-500">{item.rawB} ({item.B}%)</td>
                      <td className="px-3 py-1.5 text-right font-bold">
                        {pctGap < 0 ? (
                          <span className="text-rose-600">{pctGap}%</span>
                        ) : (
                          <span className="text-emerald-600">✓ Ready</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl mt-3">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <tbody className="bg-white divide-y divide-slate-100">
                {skillsData.slice(5).map((item) => {
                  const rawGap = item.rawA - item.rawB;
                  const pctGap = item.A - item.B;
                  return (
                    <tr key={item.subject}>
                      <td className="px-3 py-1.5 font-semibold text-slate-700">{item.subject}</td>
                      <td className="px-2 py-1.5 text-center font-bold text-slate-800">{item.rawA} ({item.A}%)</td>
                      <td className="px-2 py-1.5 text-center text-slate-500">{item.rawB} ({item.B}%)</td>
                      <td className="px-3 py-1.5 text-right font-bold">
                        {pctGap < 0 ? (
                          <span className="text-rose-600">{pctGap}%</span>
                        ) : (
                          <span className="text-emerald-600">✓ Ready</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SMART ANALYSIS & CAREER ADVISOR RECOMMENDATION */}
      <div className="border border-slate-200 rounded-2xl p-6 break-inside-avoid">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
          ✨ Smart Career Advisor Recommendations
        </h3>
        
        {aiResult ? (
          <MarkdownRenderer content={cleanAiResult(aiResult)} isDark={false} />
        ) : (
          <div className="text-center py-6 text-slate-400">
            <p className="text-sm">Analisis Karir AI belum dijalankan atau tidak ditemukan.</p>
            <p className="text-xs mt-1">Harap jalankan analisis AI di Dashboard terlebih dahulu sebelum mencetak roadmap.</p>
          </div>
        )}
      </div>

      {/* FOOTER PADA PDF */}
      <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-4 mt-8 break-inside-avoid">
        <p>Laporan ini dicetak secara otomatis dari sistem Smart LMS UNNES untuk keperluan analisis kesiapan karir.</p>
        <p className="mt-1 font-semibold text-slate-500">© {new Date().getFullYear()} {siteSettings?.orgName || 'Skillvora'} - Hak Cipta Dilindungi Undang-Undang</p>
      </div>
    </div>
  );
};

export default PrintRoadmap;
