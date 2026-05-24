import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase'; // Pastikan auth sudah diekspor di firebase.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { signOut } from "firebase/auth";

// Import Pages
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Assessment from './pages/Assessment';
import Analytics from './pages/Analytics';
import SetupProfile from './pages/SetupProfile';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import QuestionBank from './pages/QuestionBank';
import StudentResults from './pages/StudentResults';

const App = () => {
  // --- STATE UTAMA ---
  const [user, setUser] = useState(null); // Data user dari Firebase (termasuk role & targetJob)
  const [loading, setLoading] = useState(true); // Status loading saat cek login
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiResult, setAiResult] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);

  // --- 1. MONITOR STATUS LOGIN (AUTH) ---
  useEffect(() => {
    // 1. Pantau status login (Auth)
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // 2. Jika ada user login, pantau datanya di Firestore secara real-time
        const userRef = doc(db, "users", authUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            // Update state user setiap kali ada perubahan di Firestore (misal: habis submit test)
            setUser({ uid: authUser.uid, ...docSnap.data() });
          } else {
            // Penanganan untuk user baru
            setUser({ 
              uid: authUser.uid, 
              name: authUser.displayName || "User Baru", 
              isNew: true 
            });
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

  // --- 2. FUNGSI AI (UPDATE TERBARU) ---
  const runAiAnalysis = async () => {
    if (!user || !user.skills) return;
    
    setIsAnalysing(true);
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    const systemInstructions = `Anda adalah AI Career Expert dari Smart LMS UNNES. 
    Analisis 10 aspek kompetensi mahasiswa. 
    PENTING: Skor yang diberikan adalah skala 1 sampai 5. 
    JANGAN gunakan simbol persen (%) dalam tabel atau penjelasan. 
    Gunakan format tabel Markdown untuk analisis kecocokan.`;

    const userQuery = `
      Nama: ${user.name}
      Target Pekerjaan: ${user.targetJob || "Belum ditentukan"}
      
      Skor Aspek (Skala 1-5):
      - Technical: ${user.skills.technical || 0}
      - Communication: ${user.skills.communication || 0}
      - Problem Solving: ${user.skills.problemSolving || 0}
      - Leadership: ${user.skills.leadership || 0}
      - Teamwork: ${user.skills.teamwork || 0}
      - Emotional Intel: ${user.skills.emotionalIntel || 0}
      - Digital Literacy: ${user.skills.digitalLiteracy || 0}
      - Critical Thinking: ${user.skills.criticalThinking || 0}
      - Attention to Detail: ${user.skills.attentionDetail || 0}
      - Work Ethic: ${user.skills.workEthic || 0}

      Berikan tabel analisis kecocokan untuk posisi ${user.targetJob} berdasarkan skor 1-5 tersebut dan berikan 1 saran perbaikan yang konkret.
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
  if (!user) return <Login />;

  // C. Jika user baru (Belum isi data diri/target job), kecuali admin
  if ((user.isNew === true || !user.targetJob) && user.role !== 'admin') {
    return <SetupProfile user={user} />;
  }

  // D. Tampilan Utama (Sudah Login & Punya Data)
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wider">Halaman</p>
            <h2 className="text-3xl font-extrabold capitalize text-slate-800">{activeTab}</h2>
          </div>
          <div className="text-right bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-pointer" onClick={() => setActiveTab('profile')}>
            <p className="font-bold text-slate-700">{user.name}</p>
            <p className="text-xs text-indigo-600 font-medium">
              {user.role?.toUpperCase()}{user.role !== 'admin' ? ` | ${user.targetJob}` : ''}
            </p>
          </div>
        </div>
        {/* Konten Berdasarkan Tab */}
        {activeTab === 'assessment' && <Assessment user={user} />}
        {activeTab === 'analytics' && <Analytics user={user} />}
        {activeTab === 'dashboard' && (
          user.role === 'admin' ? (
            <AdminDashboard user={user} />
          ) : (
            <Dashboard 
              user={user}
              aiResult={aiResult}
              isAnalysing={isAnalysing}
              runAiAnalysis={runAiAnalysis}
            />
          )
        )}
        {activeTab === 'profile' && <UserProfile user={user} />}

        {/* Tambahan untuk Instruktur */}
        {activeTab === 'question-bank' && <QuestionBank user={user} />}
        {activeTab === 'student-results' && <StudentResults user={user} />}
      </main>
    </div>
  );
};

export default App;