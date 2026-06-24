import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, User, Lock, ArrowRight, Shield, BookOpen } from 'lucide-react';
import InstructorRegistration from './InstructorRegistration';

const defaultSettings = {
  orgName: 'Skillvora',
  orgLogo: '',
  heroTitle: 'Build Your Future Career with AI 🚀',
  heroSubtitle: 'Smart LMS membantu kamu memahami potensi skill, menemukan jalur karier terbaik, dan berkembang dengan analisis berbasis Artificial Intelligence.',
  heroButtonText: 'Mulai Analisis Karier',
};

const Login = ({ siteSettings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  const [staffRole, setStaffRole] = useState('instructor'); // 'instructor' or 'admin'
  const [showInstructorRegistration, setShowInstructorRegistration] = useState(false);
  const settings = siteSettings || defaultSettings;

  // Migrasi otomatis instruktur yang login menggunakan Google sebelumnya
  useEffect(() => {
    const runMigration = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "instructor"));
        const snapshot = await getDocs(q);
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          if (data.email && (!data.username || !data.password)) {
            await updateDoc(doc(db, "users", docSnap.id), {
              username: data.email,
              password: data.email
            });
          }
        }
      } catch (err) {
        console.error("Migration error:", err);
      }
    };
    runMigration();
  }, []);

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Cek apakah email ini merupakan instruktur di Firestore
      const instQuery = query(collection(db, "users"), where("email", "==", user.email), where("role", "==", "instructor"));
      const instSnap = await getDocs(instQuery);
      if (!instSnap.empty) {
        alert('❌ Akun Instruktur tidak dapat masuk menggunakan Google. Silakan gunakan Username & Password.');
        await signOut(auth);
        window.location.reload();
        return;
      }

      // Cek apakah user sudah ada di Firestore berdasarkan UID
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role === 'instructor') {
          alert('❌ Akun Instruktur tidak dapat masuk menggunakan Google. Silakan gunakan Username & Password.');
          await signOut(auth);
          window.location.reload();
          return;
        }
      } else {
        // Buatkan dokumen kosong dengan role "user" untuk student
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          role: "user",
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

  const loginStaff = async () => {
    if (staffRole === 'admin') {
      const adminCreds = { username: 'admin', password: 'admin123' };
      if (username === adminCreds.username && password === adminCreds.password) {
        // Simulate admin login, set in localStorage
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', 'Admin');
        window.location.reload();
      } else {
        alert('Username atau password admin salah');
      }
    } else if (staffRole === 'instructor') {
      try {
        // Cek login menggunakan Username ATAU Email
        const qUsername = query(
          collection(db, "users"),
          where("username", "==", username),
          where("password", "==", password),
          where("role", "==", "instructor")
        );
        
        const qEmail = query(
          collection(db, "users"),
          where("email", "==", username), // Input username dipakai untuk mencari kecocokan email
          where("password", "==", password),
          where("role", "==", "instructor")
        );

        const [snapUser, snapEmail] = await Promise.all([getDocs(qUsername), getDocs(qEmail)]);
        
        let instDoc = null;
        if (!snapUser.empty) {
          instDoc = snapUser.docs[0];
        } else if (!snapEmail.empty) {
          instDoc = snapEmail.docs[0];
        }

        if (instDoc) {
          const instData = instDoc.data();
          localStorage.setItem('instructorLoggedIn', 'true');
          localStorage.setItem('instructorUserId', instDoc.id);
          localStorage.setItem('userRole', 'instructor');
          localStorage.setItem('userName', instData.name || instData.displayName || 'Instruktur');
          window.location.reload();
        } else {
          alert('Username/Email atau password instruktur salah');
        }
      } catch (err) {
        console.error("Login Instruktur gagal:", err);
        alert('Terjadi kesalahan saat masuk: ' + err.message);
      }
    }
  };

  // Return instructor registration form if showInstructorRegistration is true
  if (showInstructorRegistration) {
    return <InstructorRegistration onBack={() => setShowInstructorRegistration(false)} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* LEFT SIDE: Branding and Mockup Info */}
      <div className="hidden md:flex w-1/2 flex-col justify-between p-16 z-10 relative border-r border-slate-100">
        {/* Branding */}
        <div className="flex items-center gap-3">
          {settings.orgLogo ? (
            <img 
              src={settings.orgLogo} 
              alt="Logo Organisasi" 
              className="h-10 w-10 rounded-xl object-cover border border-slate-200/80 shadow-sm" 
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <BrainCircuit size={22} />
            </div>
          )}
          <span className="text-sm font-bold uppercase tracking-wider text-slate-800">{settings.orgName}</span>
        </div>

        {/* Hero Text and AI Mockup Card */}
        <div className="my-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900 tracking-tight">
              {settings.heroTitle.replace("AI 🚀", "")}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI 🚀</span>
            </h1>
            <p className="text-slate-600 text-base lg:text-lg leading-relaxed">
              {settings.heroSubtitle}
            </p>
          </div>

          {/* Mini Mockup Card */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-slate-100/80 space-y-4 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles size={16} />
                </span>
                <span className="text-xs font-bold text-slate-700">AI Career Recommendation</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                94% Match
              </span>
            </div>
            
            {/* Quote Insight */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-semibold text-indigo-600">🤖 AI Recommendation Insight:</p>
              <p className="mt-1 font-semibold text-slate-700 text-sm leading-relaxed">
                "Berdasarkan tingkat komunikasi & problem solving Anda yang tinggi, Anda sangat cocok untuk posisi Product Manager."
              </p>
            </div>

            {/* Small Visuals */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Core Competencies</span>
                <span>Ready for Industry</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Left */}
        <div className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} {settings.orgName}. Hak Cipta Dilindungi.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login Panel */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6 z-10">
        <div className="bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md space-y-6">
          
          {/* Header Info */}
          <div className="text-center space-y-2">
            {/* Mobile Branding (only show on mobile screens) */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-6">
              {settings.orgLogo ? (
                <img 
                  src={settings.orgLogo} 
                  alt="Logo" 
                  className="h-8 w-8 rounded-lg object-cover border border-slate-200" 
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <BrainCircuit size={18} />
                </div>
              )}
              <span className="text-sm font-bold uppercase tracking-wider text-slate-800">{settings.orgName}</span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Masuk ke Smart LMS
            </h2>
            <p className="text-slate-500 text-sm">
              Mulai analisis karier dan tingkatkan kompetensi Anda sekarang
            </p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={loginGoogle}
            className="w-full bg-white text-slate-700 border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 px-6 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.01]"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="google"
              className="w-5 h-5"
            />
            <span>Masuk dengan Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 my-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">atau</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Admin & Instructor Registration Buttons */}
          <div className="space-y-2 text-center">
            <button
              onClick={() => setIsStaffLogin(!isStaffLogin)}
              className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <Shield size={14} />
              {isStaffLogin ? 'Kembali ke Login User' : 'Masuk sebagai Instruktur / Admin'}
            </button>
            <button
              onClick={() => setShowInstructorRegistration(true)}
              className="text-purple-600 hover:text-purple-700 text-xs font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <BookOpen size={14} />
              Daftar sebagai Instruktur
            </button>
          </div>

          {/* Staff Login Form */}
          {isStaffLogin && (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
              
              {/* Role Select Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setStaffRole('instructor')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                    staffRole === 'instructor'
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Instruktur
                </button>
                <button
                  type="button"
                  onClick={() => setStaffRole('admin')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                    staffRole === 'admin'
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Admin
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Username / Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder={staffRole === 'admin' ? "Masukkan username admin" : "Masukkan username/email instruktur"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={loginStaff}
                className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200/50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Masuk sebagai {staffRole === 'admin' ? 'Admin' : 'Instruktur'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Terms & Privacy */}
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Dengan masuk ke aplikasi, Anda menyetujui<br />
            <span className="font-semibold text-slate-500 hover:underline cursor-pointer">Ketentuan Layanan</span> dan <span className="font-semibold text-slate-500 hover:underline cursor-pointer">Kebijakan Privasi</span> kami.
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default Login;