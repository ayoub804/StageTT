import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0d1117] overflow-hidden relative transition-colors duration-300">
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-20 dark:opacity-[0.04] pointer-events-none z-0" />

      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden relative z-10">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}