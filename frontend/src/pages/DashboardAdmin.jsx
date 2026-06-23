import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";
import ProgressCard from "../components/ProgressCard";
import KanbanBoard from "../components/KanbanBoard";
import Charts from "../components/Charts";
import { getDashboardStats } from "../services/backend";
import { useToast } from "../context/ToastContext";

import {
  Users,
  UserCheck,
  FolderKanban,
  Briefcase,
  FileClock,
  AlertTriangle,
  Plus,
  UserPlus,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";

export default function DashboardAdmin() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const monthlyData = [
    { month: "Jan", stages: 2 },
    { month: "Fév", stages: 5 },
    { month: "Mar", stages: 8 },
    { month: "Avr", stages: 12 },
    { month: "Mai", stages: 14 },
    { month: "Jun", stages: 18 },
  ];

  const departments = [
    { name: "Développement", value: 40 },
    { name: "Réseaux", value: 25 },
    { name: "Télécom", value: 20 },
    { name: "Cloud", value: 15 },
  ];

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement des statistiques du tableau de bord.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const kanbanData = {
    todo: {
      title: "À faire",
      items: [
        { id: 1, title: "Valider nouveaux stagiaires", priority: "haute", dueDate: "2026-06-25" },
        { id: 2, title: "Contrôler livrables en attente", priority: "moyenne", dueDate: "2026-06-26" },
      ],
    },
    inProgress: {
      title: "En cours",
      items: [
        { id: 3, title: "Suivi mensuel des encadrants", priority: "moyenne", dueDate: "2026-06-28" },
      ],
    },
    done: {
      title: "Terminé",
      items: [
        { id: 4, title: "Initialisation base de données", priority: "faible", dueDate: "2026-06-15" },
      ],
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  };

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-12"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <span>Dashboard Administrateur</span>
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Supervision globale et statistiques des stages au sein de Tunisie Telecom.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              Session Live
            </span>
          </div>
        </motion.div>

        {/* KPI CARDS */}
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs">Chargement des données...</div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Stagiaires" value={stats?.students || 0} icon={Users} color="bg-blue-100 text-blue-600" trend="Total stagiaires" />
            <StatCard title="Encadrants" value={stats?.supervisors || 0} icon={UserCheck} color="bg-green-100 text-green-600" trend="Total encadrants" />
            <StatCard title="Sujets" value={stats?.topics || 0} icon={FolderKanban} color="bg-purple-100 text-purple-600" trend="Total sujets" />
            <StatCard title="Stages Actifs" value={stats?.internships || 0} icon={Briefcase} color="bg-indigo-100 text-indigo-600" trend="En cours" />
            <StatCard title="Tâches Kanban" value={(stats?.kanban?.todo || 0) + (stats?.kanban?.doing || 0) + (stats?.kanban?.done || 0)} icon={FileClock} color="bg-red-100 text-red-600" trend="Suivi global" />
          </motion.div>
        )}

        {/* CHARTS */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">Évolution des stages</h3>
              <span className="text-xxs font-bold bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg">Mensuel</span>
            </div>
            <Charts type="bar" data={monthlyData} xKey="month" dataKey="stages" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">Répartition par département</h3>
              <span className="text-xxs font-bold bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg">Pourcentage %</span>
            </div>
            <Charts type="pie" data={departments} xKey="name" dataKey="value" />
          </div>
        </motion.div>

        {/* PROGRESSION PROGRESS CARDS */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-5">
          <ProgressCard name="Plateforme StageTT" percentage={78} status="en_cours" />
          <ProgressCard name="API Laravel Integration" percentage={55} status="en_cours" />
          <ProgressCard name="Messagerie instantanée" percentage={92} status="termine" />
        </motion.div>

        {/* ALERTES / ACTIONS RAPIDES */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
          {/* STATS KANBAN */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight mb-5">Statut Global Tâches</h3>
            <div className="space-y-4">
              {[
                { label: "À faire", count: stats?.kanban?.todo || 0, color: "bg-indigo-500" },
                { label: "En cours", count: stats?.kanban?.doing || 0, color: "bg-amber-500" },
                { label: "Terminé", count: stats?.kanban?.done || 0, color: "bg-emerald-500" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ALERTES */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight mb-5">Alertes Système</h3>
            <div className="space-y-3">
              <AlertItem 
                icon={AlertTriangle}
                text="2 livrables en retard"
                type="danger"
              />
              <AlertItem 
                icon={AlertTriangle}
                text="3 tâches bloquées"
                type="warning"
              />
              <AlertItem 
                icon={AlertTriangle}
                text="5 nouveaux messages"
                type="info"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight mb-5">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionBtn label="Utilisateur" icon={UserPlus} bg="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" />
              <QuickActionBtn label="Encadrant" icon={Plus} bg="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" />
              <QuickActionBtn label="Sujet" icon={FolderKanban} bg="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400" />
              <QuickActionBtn label="Stats" icon={BarChart3} bg="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </motion.div>

        {/* KANBAN SECTION */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">
                Suivi global des opérations
              </h3>
              <p className="text-xxs text-slate-400 mt-0.5 font-medium">Glisser-déposer des tâches pour restructurer la gestion administrative.</p>
            </div>
            <span className="text-xxs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 px-2.5 py-1 rounded-full">
              Kanban Administratif
            </span>
          </div>

          <KanbanBoard initialData={kanbanData} />
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}

function AlertItem({ icon: Icon, text, type }) {
  const getStyle = () => {
    switch (type) {
      case "danger":
        return "bg-rose-50 dark:bg-rose-950/20 border-rose-100/60 dark:border-rose-900/30 text-rose-700 dark:text-rose-450";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/30 text-amber-700 dark:text-amber-450";
      default:
        return "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100/60 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-455";
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-semibold ${getStyle()}`}>
      <div className="shrink-0">
        <Icon size={16} className="stroke-[2.2]" />
      </div>
      <span>{text}</span>
    </div>
  );
}

function QuickActionBtn({ label, icon: Icon, bg }) {
  return (
    <button className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-transparent font-bold text-xxs gap-2 transition duration-200 cursor-pointer ${bg}`}>
      <Icon size={18} className="stroke-[2.2]" />
      <span>{label}</span>
    </button>
  );
}