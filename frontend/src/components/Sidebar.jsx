import {
  LayoutDashboard, Briefcase, FolderOpen, Users,
  BrainCircuit, KanbanSquare, FileText, MessageSquare,
  Share2, BarChart3, Settings, Bell, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRole } from "../services/auth";
import { motion } from "framer-motion";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();
  const [collapsed, setCollapsed] = useState(false);
  const notifications = 5;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: role === "admin" ? "/admin" : role === "supervisor" ? "/supervisor" : "/student" },
    ...(role === "admin" ? [
      { name: "Stages", icon: Briefcase, path: "/internships" },
      { name: "Affectations", icon: Users, path: "/assignments" },
    ] : []),
    { name: "Sujets", icon: FolderOpen, path: "/topics" },
    { name: "Planning IA", icon: BrainCircuit, path: "/planning-ai" },
    { name: "Kanban", icon: KanbanSquare, path: "/tasks" },
    { name: "Livrables", icon: FileText, path: "/deliverables" },
    { name: "Messagerie", icon: MessageSquare, path: "/messages" },
    { name: "Collaboration", icon: Share2, path: "/collaboration" },
    ...(role === "admin" ? [
      { name: "Statistiques", icon: BarChart3, path: "/statistics" },
      { name: "Paramètres", icon: Settings, path: "/settings" },
    ] : []),
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="bg-white dark:bg-[#0d1117] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 relative z-20 transition-colors duration-300"
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

      {/* Header: Logo + collapse */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 mt-1">
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 border border-slate-200 dark:border-slate-700">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcjAL9itCcYdAhLn5lm1jzsMtQMT75EzG3yMOCHB3MDw1vYaQ_yhivDm8&s=10"
              alt="Tunisie Telecom"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden">
              <p className="font-bold text-slate-800 dark:text-white text-sm tracking-tight whitespace-nowrap">StageTT</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">Tunisie Telecom</p>
            </motion.div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition shrink-0 cursor-pointer"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* User card */}
      <div className="p-3">
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 rounded-2xl p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-indigo-500/20">
              {(localStorage.getItem("name") || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate max-w-[130px]">
                  {localStorage.getItem("name") || "Utilisateur"}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate capitalize">{role || "guest"}</p>
              </motion.div>
            )}
          </div>

          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/40">
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Bell size={11} className="text-slate-400" /> Notifications
              </span>
              <span className="bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {notifications}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto space-y-0.5">
        {!collapsed && (
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-600 px-3 mb-2">
            Navigation
          </p>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.name : ""}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group text-left cursor-pointer ${
                active
                  ? "text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              } ${collapsed ? "justify-center" : ""}`}
            >
              {active && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl -z-10 shadow-lg shadow-indigo-600/15"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon size={17} className={`flex-shrink-0 transition-transform group-hover:scale-105 ${active ? "text-white" : ""}`} />
              {!collapsed && (
                <span className="font-medium text-[13px] tracking-wide truncate">{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className={`bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl p-2.5 ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse block" />
          ) : (
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">StageTT v2.0</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Suivi des stages internes</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Système opérationnel</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}