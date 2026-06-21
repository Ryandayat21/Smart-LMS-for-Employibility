import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; // Pastikan auth sudah diekspor di firebase.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { signOut } from "firebase/auth";

// Import Pages
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import AdminUsers from './pages/AdminUsers';
import AdminInstructorManagement from './pages/AdminInstructorManagement';
import AdminQuestionBank from './pages/AdminQuestionBank';
import Assessment from './pages/Assessment';
import Analytics from './pages/Analytics';
import SetupProfile from './pages/SetupProfile';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import QuestionBank from './pages/QuestionBank';
import StudentResults from './pages/StudentResults';
import ClassManagement from './pages/ClassManagement';
import LMS from './pages/LMS';
import PrintRoadmap from './components/PrintRoadmap';
import InstructorDashboard from './pages/InstructorDashboard';

const defaultSiteSettings = {
  orgName: 'Skillvora',
  orgLogo: '',
  heroTitle: 'Build Your Future Career with AI 🚀',
  heroSubtitle: 'Smart LMS membantu kamu memahami potensi skill, menemukan jalur karier terbaik, dan berkembang dengan analisis berbasis Artificial Intelligence.',
  heroButtonText: 'Mulai Analisis Karier',
};

const App = () => {
  // --- STATE UTAMA ---
  const [user, setUser] = useState(null); // Data user dari Firebase (termasuk role & targetJob)
  const [loading, setLoading] = useState(true); // Status loading saat cek login
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardUser, setDashboardUser] = useState(null);
  const [aiResult, setAiResult] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [profileAction, setProfileAction] = useState(null);
  const [siteSettings, setSiteSettings] = useState(() => {
    const stored = localStorage.getItem('siteSettings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Invalid siteSettings in localStorage', e);
      }
    }
    return defaultSiteSettings;
  });

  // --- 1. MONITOR STATUS LOGIN (AUTH) ---
  useEffect(() => {
    // 1. Pantau status login (Auth)
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // 2. Jika ada user login, pantau datanya di Firestore secara real-time
        const userRef = doc(db, "users", authUser.uid);
      const createMissingUserDoc = async () => {
        const defaultUser = {
          name: authUser.displayName || "User Baru",
          email: authUser.email || "",
          role: "user",
          targetJob: "",
          isNew: true,
          skills: {
            technical: 0,
            digitalLiteracy: 0,
            communication: 0,
            leadership: 0,
            teamwork: 0,
            emotionalIntel: 0,
            problemSolving: 0,
            criticalThinking: 0,
            attentionDetail: 0,
            workEthic: 0,
          },
        };

        try {
          await setDoc(userRef, defaultUser);
          setUser({ uid: authUser.uid, ...defaultUser });
        } catch (error) {
          console.error('Gagal membuat dokumen user default:', error);
        }
      };
      
      const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const rawData = docSnap.data();
          const userData = { 
            uid: authUser.uid, 
            ...rawData,
            // 💡 REVISI AMAN: Pastikan array selalu ada meskipun kosong (tidak undefined)
            projects: rawData.projects || [],
            certifications: rawData.certifications || [],
            role: rawData.role || 'user'
          };
          setUser(userData);
        } else {
          createMissingUserDoc();
        }
        setLoading(false);
      });

        // Cleanup snapshot listener saat logout
        return () => unsubscribeSnapshot();
      } else {
        const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
        if (isAdmin) {
          setUser({
            role: 'admin',
            name: localStorage.getItem('userName') || 'Admin',
            isNew: false,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // --- 2. LOAD AI RESULT DARI FIRESTORE ---
  useEffect(() => {
    const loadAiResult = async () => {
      if (user?.uid) {
        try {
          const summaryRef = doc(db, "ai_summaries", user.uid);
          const snap = await getDoc(summaryRef);
          if (snap.exists() && snap.data().summary) {
            const savedData = snap.data();
            
            // Validasi: apakah status portofolio saat ini cocok dengan saat analisis dibuat?
            const currentHasProjects = !!(user.projects && user.projects.length > 0);
            const currentHasCerts = !!(user.certifications && user.certifications.length > 0);
            const savedHasProjects = savedData.hasProjects ?? null;
            const savedHasCerts = savedData.hasCerts ?? null;
            
            // Jika metadata tersimpan, validasi kecocokan portofolio
            // Jika metadata tidak ada (data lama), anggap stale dan jangan load
            if (savedHasProjects === null || savedHasCerts === null) {
              console.log("⚠️ Hasil analisis lama tanpa metadata portofolio. Perlu analisis ulang.");
              return; // Jangan load hasil lama tanpa metadata
            }
            if (savedHasProjects !== currentHasProjects || savedHasCerts !== currentHasCerts) {
              console.log("⚠️ Profil portofolio berubah sejak analisis terakhir. Hasil lama diabaikan.");
              return; // Jangan load hasil lama
            }
            
            setAiResult(savedData.summary);
          }
        } catch (e) {
          console.error("Gagal memuat rangkuman AI:", e);
        }
      }
    };
    loadAiResult();
  }, [user?.uid, user?.projects, user?.certifications]);

  // --- 3. FUNGSI AI (UPDATE TERBARU) ---
  const runAiAnalysis = async () => {
    if (!user || !user.skills) return;

    // Only require assessment — portfolio is optional
    const isPgDone = !!(user.skills && Object.values(user.skills).some(val => val > 0));

    const incomplete = [];
    if (!isPgDone) incomplete.push("Asesmen Awal & Interview");

    if (incomplete.length > 0) {
      alert(`Kamu belum dapat menjalankan Smart Analysis AI. Silakan selesaikan asesmen berikut terlebih dahulu:\n\n${incomplete.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}`);
      return;
    }
    
    setIsAnalysing(true);
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    const hasProjects = user.projects && user.projects.length > 0;
    const hasCerts = user.certifications && user.certifications.length > 0;

    const systemInstructions = `Anda adalah AI Career Expert dari Smart LMS UNNES. 
    Analisis 10 aspek kompetensi mahasiswa secara sangat ringkas, padat, dan langsung pada poinnya.
    PENTING: Skor yang diberikan adalah skala 1 sampai 5. 
    JANGAN gunakan simbol persen (%) dalam tabel atau penjelasan. 
    Gunakan format tabel Markdown untuk analisis kecocokan.
    
    ATURAN KETAT ANTI-HALUSINASI:
    - DILARANG KERAS mengarang, mengasumsikan, atau membuat data proyek/sertifikasi yang TIDAK ada dalam data user.
    - Jika user BELUM memiliki proyek atau sertifikasi, JANGAN sebutkan seolah-olah mereka memilikinya.
    - Hanya analisis data yang BENAR-BENAR diberikan dalam profil user.

    [NEW] RUBRIK ANALISIS (Gunakan panduan ini untuk memberi rekomendasi):
    1. Competency Alignment: Bandingkan skor asesmen dengan kebutuhan karir. Jika selisihnya besar, berikan peringatan objektif namun suportif.
    2. Portfolio Relevance: Jika profil memiliki portofolio yang relevan, jadikan itu sebagai poin plus yang menutupi kelemahan teoritis.
    3. Actionability Matrix:
       - Jika Skor Tinggi + Tanpa Portofolio: Sarankan ide proyek nyata yang spesifik untuk target karirnya agar segera dibuat.
       - Jika Skor Rendah + Tanpa Portofolio: Sarankan bootcamp/kursus dasar dan proyek yang sangat sederhana.
       - Jika Skor Rendah + Portofolio Relevan: Fokuskan saran pada pemahaman teori fundamental dan perbaikan.
       - Jika Skor Tinggi + Portofolio Relevan: Dorong untuk membangun personal branding dan melamar kerja.
    ${!hasProjects && !hasCerts ? `
    ⚠️ PERHATIAN: Mahasiswa ini SAMA SEKALI BELUM memiliki portofolio proyek DAN sertifikasi.
    - JANGAN menyebutkan proyek atau sertifikasi apapun seolah-olah sudah ada.
    - Pada bagian keselarasan, nyatakan dengan jelas bahwa mahasiswa BELUM memiliki portofolio.
    - Berikan saran konkret tentang:
      1. Jenis proyek apa yang sebaiknya dikerjakan sesuai target karir mereka
      2. Sertifikasi apa yang direkomendasikan untuk memperkuat profil
      3. Langkah prioritas pertama yang bisa dilakukan segera
    ` : !hasProjects ? `
    ⚠️ PERHATIAN: Mahasiswa ini BELUM memiliki proyek portofolio (hanya memiliki sertifikasi).
    - JANGAN menyebutkan proyek apapun seolah-olah sudah ada.
    - Sarankan jenis proyek yang relevan untuk dikerjakan.
    ` : !hasCerts ? `
    ⚠️ PERHATIAN: Mahasiswa ini BELUM memiliki sertifikasi (hanya memiliki proyek portofolio).
    - JANGAN menyebutkan sertifikasi apapun seolah-olah sudah ada.
    - Sarankan sertifikasi yang relevan untuk diambil.
    ` : ''}
    Wajib membungkus setiap bagian keluaran Anda tepat di dalam tag XML berikut (tanpa salam pembuka/penutup lainnya di luar tag ini):
    <kecocokan>
    (Wajib berupa Tabel Markdown dengan 4 kolom persis: "Kompetensi", "Skor Aktual", "Skor Target Industri", dan "Gap". Isi skor dalam skala 1-5 tanpa simbol persen)
    </kecocokan>
    <rekomendasi>
    (Daftar poin rekomendasi skill/kompetensi kritis yang perlu ditingkatkan berdasarkan gap)
    </rekomendasi>
    <keselarasan>
    (${!hasProjects && !hasCerts 
      ? 'Nyatakan bahwa mahasiswa BELUM memiliki portofolio proyek maupun sertifikasi. Lalu berikan rekomendasi proyek dan sertifikasi konkret yang harus dibangun untuk menunjang karir target.' 
      : 'Analisis singkat keselarasan target karir dengan proyek & sertifikasi yang dimiliki, serta saran alternatif karir jika diperlukan'})
    </keselarasan>`;

    const certsText = (user.certifications || []).map((c) => `- ${c.title} (Penerbit: ${c.issuer}, Skill: ${c.skills?.join(', ') || '-'})`).join('\n');
    const projsText = (user.projects || []).map((p) => `- ${p.name}: ${p.description} (Skill: ${p.skills?.join(', ') || '-'}, Link: ${p.link || '-'})`).join('\n');

    const getTarget = (aspect) => {
      if (user.targetScores && typeof user.targetScores[aspect] === 'number') {
        return user.targetScores[aspect];
      }
      const fallbacks = {
        technical: user.targetJob === 'software-eng' ? 5 : user.targetJob === 'data-analyst' ? 4 : user.targetJob === 'uiux' ? 4 : user.targetJob === 'marketing' ? 3 : 3.5,
        communication: user.targetJob === 'software-eng' ? 3.5 : user.targetJob === 'data-analyst' ? 4 : user.targetJob === 'uiux' ? 4 : user.targetJob === 'marketing' ? 5 : 3.5,
        problemSolving: user.targetJob === 'software-eng' ? 5 : user.targetJob === 'data-analyst' ? 5 : user.targetJob === 'uiux' ? 4 : user.targetJob === 'marketing' ? 4 : 3.5,
        leadership: user.targetJob === 'software-eng' ? 3 : user.targetJob === 'data-analyst' ? 3 : user.targetJob === 'uiux' ? 3 : user.targetJob === 'marketing' ? 4 : 3.5,
        teamwork: user.targetJob === 'software-eng' ? 4 : user.targetJob === 'data-analyst' ? 4 : user.targetJob === 'uiux' ? 4.5 : user.targetJob === 'marketing' ? 4.5 : 3.5,
        emotionalIntel: user.targetJob === 'software-eng' ? 3.5 : user.targetJob === 'data-analyst' ? 3.5 : user.targetJob === 'uiux' ? 4 : user.targetJob === 'marketing' ? 4.8 : 3.5,
        digitalLiteracy: user.targetJob === 'software-eng' ? 4.5 : user.targetJob === 'data-analyst' ? 5 : user.targetJob === 'uiux' ? 4.5 : user.targetJob === 'marketing' ? 4 : 3.5,
        criticalThinking: user.targetJob === 'software-eng' ? 4.5 : user.targetJob === 'data-analyst' ? 5 : user.targetJob === 'uiux' ? 4.5 : user.targetJob === 'marketing' ? 4 : 3.5,
        attentionDetail: user.targetJob === 'software-eng' ? 4.5 : user.targetJob === 'data-analyst' ? 5 : user.targetJob === 'uiux' ? 5 : user.targetJob === 'marketing' ? 3.5 : 3.5,
        workEthic: user.targetJob === 'software-eng' ? 4.5 : user.targetJob === 'data-analyst' ? 4.5 : user.targetJob === 'uiux' ? 4.5 : user.targetJob === 'marketing' ? 4.5 : 3.5
      };
      return fallbacks[aspect];
    };

    const userQuery = `
      Nama: ${user.name}
      Target Pekerjaan: ${user.targetJob || "Belum ditentukan"}
      
      Skor Aspek Kompetensi (Aktual vs Target Industri Skala 1-5):
      - Technical: ${user.skills.technical || 0} vs Target: ${getTarget('technical')}
      - Communication: ${user.skills.communication || 0} vs Target: ${getTarget('communication')}
      - Problem Solving: ${user.skills.problemSolving || 0} vs Target: ${getTarget('problemSolving')}
      - Leadership: ${user.skills.leadership || 0} vs Target: ${getTarget('leadership')}
      - Teamwork: ${user.skills.teamwork || 0} vs Target: ${getTarget('teamwork')}
      - Emotional Intel: ${user.skills.emotionalIntel || 0} vs Target: ${getTarget('emotionalIntel')}
      - Digital Literacy: ${user.skills.digitalLiteracy || 0} vs Target: ${getTarget('digitalLiteracy')}
      - Critical Thinking: ${user.skills.criticalThinking || 0} vs Target: ${getTarget('criticalThinking')}
      - Attention to Detail: ${user.skills.attentionDetail || 0} vs Target: ${getTarget('attentionDetail')}
      - Work Ethic: ${user.skills.workEthic || 0} vs Target: ${getTarget('workEthic')}

      Sertifikasi yang Dimiliki:
      ${hasCerts ? certsText : "⚠️ KOSONG — Mahasiswa ini BELUM mengunggah sertifikasi apapun. JANGAN mengarang sertifikasi."}

      Projek Portofolio yang Dimiliki:
      ${hasProjects ? projsText : "⚠️ KOSONG — Mahasiswa ini BELUM mengunggah projek portofolio apapun. JANGAN mengarang proyek."}

      Berdasarkan data profil di atas, berikan analisis ringkas dalam Bahasa Indonesia yang dibungkus dengan tag XML <kecocokan>, <rekomendasi>, dan <keselarasan> sesuai instruksi system.
      Di dalam <kecocokan>, BUATLAH TABEL MARKDOWN (4 kolom: Kompetensi, Skor Aktual, Skor Target Industri, Gap) yang membandingkan semua 10 aspek di atas.
      ${!hasProjects && !hasCerts ? 'INGAT: Mahasiswa ini TIDAK memiliki proyek dan sertifikasi. Jangan sebutkan proyek/sertifikasi apapun seolah ada.' : ''}
    `;

    const models = [
      "meta-llama/llama-3.3-70b-instruct:free",
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
      "deepseek/deepseek-v4-flash:free",
    ];

    const attemptFetch = async (modelName) => {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemInstructions },
            { role: "user", content: userQuery }
          ]
        })
      });
      if (!response.ok) throw new Error(`Model ${modelName} gagal`);
      return await response.json();
    };

    let success = false;
    for (const model of models) {
      if (success) break;
      try {
        const data = await attemptFetch(model);
        const aiText = data.choices?.[0]?.message?.content;
        if (aiText) {
          // ✅ Tampilkan di Dashboard
          setAiResult(aiText);
          success = true;

          // ✅ Simpan ke Firestore collection "ai_summaries"
          try {
            const summaryRef = doc(db, "ai_summaries", user.uid);
            await setDoc(summaryRef, {
              uid: user.uid,
              name: user.fullName || user.name,
              targetJob: user.targetJob || "",
              education: user.education || "",
              skills: user.skills,
              summary: aiText,
              hasProjects: hasProjects,
              hasCerts: hasCerts,
              projectCount: (user.projects || []).length,
              certCount: (user.certifications || []).length,
              generatedAt: new Date(),
            }, { merge: true });
            console.log("✅ Rangkuman AI tersimpan ke Firestore!");
          } catch (saveError) {
            console.error("❌ Gagal simpan rangkuman:", saveError);
          }
        }
      } catch (e) {
        console.warn(e.message);
      }
    }

    setIsAnalysing(false);
  };
  const openDashboardForUser = (selectedUser) => {
    setDashboardUser(selectedUser);
    setActiveTab('admin-user-dashboard');
  };

  // --- FUNGSI LOGOUT ---
  const handleLogout = async () => {
    try {
      if (localStorage.getItem('adminLoggedIn') === 'true') {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        setUser(null);
      }
      if (auth.currentUser) await signOut(auth);
      // Setelah logout, state 'user' di onAuthStateChanged 
      // akan otomatis jadi null, dan layar login bakal muncul sendiri.
      console.log("User berhasil keluar");
    } catch (error) {
      console.error("Gagal logout:", error.message);
    }
  };

  // --- 3. LOGIKA TAMPILAN (RENDERING) ---
  
  // A. Jika masih loading cek login
  if (loading) return <div className="flex h-screen items-center justify-center">Memuat Smart LMS...</div>;

  // B. Jika belum login (Nanti kita buat pages/Login.jsx)
  if (!user) return <Login siteSettings={siteSettings} />;

  // C. Jika user baru (Belum isi data diri/target job), kecuali admin
  if ((user.isNew === true || !user.targetJob) && user.role !== 'admin') {
    return <SetupProfile user={user} onComplete={() => setActiveTab('assessment')} onLogout={handleLogout} />;
  }

  // D. Tampilan Utama (Sudah Login & Punya Data)
  return (
    <>
      {/* Main Application Layout (Hidden during print) */}
      <div className="flex h-screen bg-slate-50 print:hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} siteSettings={siteSettings} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wider">Halaman</p>
              <h2 className="text-3xl font-extrabold capitalize text-slate-800">{activeTab}</h2>
            </div>
            <div className="text-right bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-pointer" onClick={() => setActiveTab('profile')}>
              <p className="font-bold text-slate-700">{user.name}</p>
              <p className="text-xs text-indigo-600 font-medium">
                {user.role?.toUpperCase()}{user.role !== 'admin' && user.targetJob ? ` | ${user.targetJob}` : ''}
              </p>
            </div>
          </div>
          
          {/* Konten Berdasarkan Tab */}
          {activeTab === 'lms' && <LMS user={user} />}
          {activeTab === 'assessment' && <Assessment user={user} setActiveTab={setActiveTab} />}
          {activeTab === 'analytics' && <Analytics user={user} />}
          
          {/* ✅ REVISI DASHBOARD: Menyesuaikan tampilan beranda berdasarkan 3 Role secara presisi */}
          {activeTab === 'dashboard' && (
            user.role === 'admin' ? (
              <AdminDashboard user={user} setActiveTab={setActiveTab} />
            ) : user.role === 'instructor' ? (
              <InstructorDashboard user={user} />
            ) : (
              <Dashboard 
                user={user}
                aiResult={aiResult}
                isAnalysing={isAnalysing}
                runAiAnalysis={runAiAnalysis}
                setActiveTab={setActiveTab}
                setProfileAction={setProfileAction}
              />
            )
          )}
          
          {activeTab === 'site-settings' && user.role === 'admin' && (
            <AdminSettings
              settings={siteSettings}
              onSave={(nextSettings) => {
                localStorage.setItem('siteSettings', JSON.stringify(nextSettings));
                setSiteSettings(nextSettings);
              }}
            />
          )}
          {activeTab === 'admin-users' && user.role === 'admin' && <AdminUsers onViewDashboard={openDashboardForUser} />}
          {activeTab === 'admin-user-dashboard' && user.role === 'admin' && (
            dashboardUser ? (
              <Dashboard
                user={dashboardUser}
                aiResult={aiResult}
                isAnalysing={isAnalysing}
                runAiAnalysis={runAiAnalysis}
                setActiveTab={setActiveTab}
                setProfileAction={setProfileAction}
                adminReturnPath="admin-users"
              />
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Tidak ada user yang dipilih. Kembali ke halaman Manajemen Pengguna untuk memilih user.
              </div>
            )
          )}
          {activeTab === 'admin-instructor-management' && user.role === 'admin' && <AdminInstructorManagement />}
          {activeTab === 'profile' && (
            <UserProfile 
              user={user} 
              profileAction={profileAction} 
              setProfileAction={setProfileAction} 
              />
          )}

          {/* ✅ REVISI KELOLA SOAL: Memasang key dinamis agar state paket auto-reset total saat berpindah menu */}
          {activeTab === 'question-bank' && (
            user.role === 'admin' ? (
              <AdminQuestionBank key={activeTab} user={user} />
            ) : (
              <AdminQuestionBank key={activeTab} user={user} /> // Pastikan memanggil komponen terupdate yang mendukung role instruktur
            )
          )}
          
          {activeTab === 'student-results' && <StudentResults user={user} />}
          {activeTab === 'class-management' && <ClassManagement user={user} />}
          
          {/* ✅ REVISI SHORTCUT DASHBOARD INSTRUKTUR */}
          {activeTab === 'instructor-dashboard' && <InstructorDashboard user={user} />}
        </main>
      </div>

      {/* Print PDF Template (Visible only during print) */}
      <div className="hidden print:block bg-white min-h-screen">
        <PrintRoadmap user={user} aiResult={aiResult} siteSettings={siteSettings} />
      </div>
    </>
  );
};

export default App;