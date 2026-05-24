import React from 'react';

const AdminDashboard = ({ user }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-widest text-slate-500">Admin Dashboard</p>
          <h1 className="text-3xl font-extrabold text-slate-900">Selamat datang, {user?.name || 'Admin'}</h1>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6 border border-slate-200">
          <p className="text-slate-600">Anda sekarang berada di halaman admin. Gunakan menu di sebelah kiri untuk mengatur website.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
