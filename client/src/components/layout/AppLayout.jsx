import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '../common/ToastContainer';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Subtle Ambient Gradients */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-cyan-600/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed inset-0 bg-cyber-grid pointer-events-none opacity-40" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
