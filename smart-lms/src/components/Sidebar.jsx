import React from 'react';
import { LayoutDashboard, BookOpen, Target, BarChart3, BrainCircuit, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const NavItem = ({ icon: Icon, label, id }) => (
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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="flex items-center gap-2 text-indigo-600 mb-8">
        <BrainCircuit size={28} />
        <h1 className="text-xl font-bold tracking-tight">Skillvora</h1> {/* Sudah ganti nama jadi Skillvora nih! */}
      </div>

      {/* Navigation Section */}
      <nav className="flex flex-col gap-2 flex-1">
        <NavItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
        <NavItem icon={BookOpen} label="Join Class" id="lms" />
        <NavItem icon={Target} label="Direct Assessment" id="assessment" />
        <NavItem icon={BarChart3} label="Skill Radar" id="analytics" />
      </nav>

      {/* Logout Section - Nempel di bawah berkat flex-1 di nav */}
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