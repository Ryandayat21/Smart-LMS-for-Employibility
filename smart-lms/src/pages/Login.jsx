import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

const defaultSettings = {
  orgName: 'Skillvora',
  orgLogo: '',
  heroTitle: 'Build Your Future Career with AI 🚀',
  heroSubtitle: 'Smart LMS membantu kamu memahami potensi skill, menemukan jalur karier terbaik, dan berkembang dengan analisis berbasis Artificial Intelligence.',
  heroButtonText: 'Mulai Analisis Karier',
};

const Login = ({ siteSettings }) => {
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const settings = siteSettings || defaultSettings;

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Cek apakah user sudah ada di Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Jika benar-benar baru, buatkan dokumen kosong dengan role 'user'
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          role: "user", // Default role
          targetJob: "", // Akan diisi di SetupProfile
          skills: {
            technical: 0, digitalLiteracy: 0, communication: 0,
            leadership: 0, teamwork: 0, emotionalIntel: 0,
            problemSolving: 0, criticalThinking: 0,
            attentionDetail: 0, workEthic: 0
          }
        });
      }
      // Reload to trigger auth state change
      window.location.reload();
    } catch (error) {
      console.error("Login Gagal:", error);
    }
  };

  const loginAdmin = async () => {
    // Hardcoded admin credentials
    const adminCreds = { username: 'admin', password: 'admin123' };
    if (adminUsername === adminCreds.username && adminPassword === adminCreds.password) {
      // Simulate admin login, set in localStorage
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', 'Admin');
      // Reload to apply changes
      window.location.reload();
    } else {
      alert('Username atau password admin salah');
    }
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-800">

    {/* LEFT SIDE */}
    <div className="hidden md:flex w-1/2 flex-col justify-center px-16 text-white">
        <div className="flex items-center gap-3 mb-8">
          {settings.orgLogo ? (
            <img src={settings.orgLogo} alt="Logo Organisasi" className="h-12 w-12 rounded-2xl object-cover border border-white/20" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">Logo</div>
          )}
          <p className="text-lg font-semibold uppercase tracking-[0.2em] text-white/80">{settings.orgName}</p>
        </div>

        <h1 className="text-5xl font-bold leading-tight">
          {settings.heroTitle}
        </h1>

        <p className="mt-6 text-lg text-white/80">
          {settings.heroSubtitle}
        </p>
      <div className="mt-10 bg-white/10 p-6 rounded-xl backdrop-blur-md">
        <p className="text-sm">🤖 AI Insight:</p>
        <p className="mt-2 font-semibold">
          "Skill communication tinggi → cocok ke Product Manager"
        </p>
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="flex w-full md:w-1/2 items-center justify-center">
      <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl text-center border border-white/20 w-87.5">

        <h2 className="text-2xl font-bold text-white">
          Masuk ke Smart LMS
        </h2>

        <p className="text-white/70 mt-2 mb-6">
          Mulai analisis karier kamu sekarang
        </p>

        <button
          onClick={loginGoogle}
          className="bg-white text-slate-800 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-3 hover:scale-105 transition-all w-full"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="google"
            className="w-5"
          />
          Masuk dengan Google
        </button>

        <div className="mt-4">
          <button
            onClick={() => setIsAdminLogin(!isAdminLogin)}
            className="text-white/70 hover:text-white text-sm underline"
          >
            {isAdminLogin ? 'Batal Login Admin' : 'Login sebagai Admin'}
          </button>
        </div>

        {isAdminLogin && (
          <div className="mt-6">
            <input
              type="text"
              placeholder="Username Admin"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              className="w-full px-4 py-2 mb-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30"
            />
            <input
              type="password"
              placeholder="Password Admin"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-2 mb-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30"
            />
            <button
              onClick={loginAdmin}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all w-full"
            >
              Masuk sebagai Admin
            </button>
          </div>
        )}

        <p className="text-xs text-white/50 mt-6">
          Dengan masuk, kamu menyetujui Terms & Privacy Policy
        </p>
      </div>
    </div>
  </div>
  );
};

export default Login;