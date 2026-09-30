import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";

/**
 * ASR Bank - Dashboard Layout Shell
 * Structure: Sidebar + Topbar + Main Content Area
 */
const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar Navigation (Desktop persistent + Mobile off-canvas) */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <Topbar onToggleSidebar={() => setMobileSidebarOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
