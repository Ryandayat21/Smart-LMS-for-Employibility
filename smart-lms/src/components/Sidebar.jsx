import React from 'react';
import { LayoutDashboard, BookOpen, Target, BarChart3, BrainCircuit, LogOut, ClipboardList, Users, Settings, GraduationCap } from 'lucide-react';

const NavItem = ({ icon: Icon, label, id, activeTab, setActiveTab }) => (
  <button 
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
      activeTab === id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const Sidebar = ({ activeTab, setActiveTab, user, onLogout, siteSettings }) => {
  const orgName = siteSettings?.orgName || 'Skillvora';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="flex items-center gap-2 text-indigo-600 mb-8">
        <BrainCircuit size={28} />
        <h1 className="text-xl font-bold tracking-tight">{orgName}</h1>
      </div>

      {/* Navigation Section */}
      <nav className="flex flex-col gap-2 flex-1">
        {/* Menu Dashboard selalu muncul untuk semua orang */}
        <NavItem icon={LayoutDashboard} label="Dashboard" id="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Cek role User: Tambahkan tanda tanya (?) dan pastikan string 'user' kecil semua */}
        {(user?.role === 'user' || !user?.role) && (
          <>
            <NavItem icon={BookOpen} label="Join Class" id="lms" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem icon={Target} label="Direct Assessment" id="assessment" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem icon={BarChart3} label="Skill Radar" id="analytics" activeTab={activeTab} setActiveTab={setActiveTab} />
          </>
        )}

        {/* Cek role Instructor */}
        {(user?.role === 'instructor' || user?.role === 'admin') && (
          <>
            <div className="mt-4 mb-2 px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instruktur / Admin Menu</p>
            </div>
            <NavItem icon={BookOpen} label="Kelola Kelas" id="class-management" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem icon={ClipboardList} label="Kelola Soal" id="question-bank" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem icon={Users} label="Hasil Mahasiswa" id="student-results" activeTab={activeTab} setActiveTab={setActiveTab} />
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <div className="mt-4 mb-2 px-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Menu</p>
            </div>
            <NavItem icon={Settings} label="Pengaturan Website" id="site-settings" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem icon={Users} label="Manajemen Pengguna" id="admin-users" activeTab={activeTab} setActiveTab={setActiveTab} />
            <NavItem icon={GraduationCap} label="Kelola Instruktur" id="admin-instructor-management" activeTab={activeTab} setActiveTab={setActiveTab} />
          </>
        )}
      </nav>

      {/* Logout Section */}
      <div className="pt-6 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;