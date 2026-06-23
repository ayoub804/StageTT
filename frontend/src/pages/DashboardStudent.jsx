import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import { getDashboardStats } from "../services/backend";
import { useToast } from "../context/ToastContext";

import {
  BookOpen,
  User,
  Building2,
  Calendar,
  Upload,
  Download,
  CheckCircle2,
  Clock,
  MessageSquare,
  Bell,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

export default function DashboardStudent() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement des statistiques étudiant.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusStyle = (status) => {
    const formatted = (status || "").toLowerCase();
    switch (formatted) {
      case "validé":
      case "valide":
        return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/30";
      case "en attente":
      case "déposé":
      case "soumis":
        return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/30";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  };

  const studentName = localStorage.getItem("name") || "Stagiaire";

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-12"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span>Bonjour, {studentName}</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Bienvenue sur votre espace de stage Tunisie Telecom. Voici votre avancement actuel.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 py-2.5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Bell size={15} className="animate-pulse" />
            </div>
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
              Session Active
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Chargement de votre tableau de bord...</div>
        ) : !stats?.internship ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center text-slate-500">
            <BookOpen size={32} className="mx-auto text-slate-400 mb-4" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">Aucun stage actif</h3>
            <p className="text-xs text-slate-400">Vous n'êtes actuellement associé à aucun stage Tunisie Telecom.</p>
          </div>
        ) : (
          <>
            {/* SUBJECT CARD */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                  <BookOpen size={18} className="stroke-[2.2]" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Sujet de Stage Affecté</h2>
              </div>

              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug mb-6">
                {stats.internship.topic?.title || "Sujet non défini"}
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoBlock icon={User} title="Encadrant" value={stats.internship.supervisor?.user?.name || "Mme Amel Tounsi"} />
                <InfoBlock icon={Building2} title="Technologies" value={stats.internship.topic?.technologies || "Développement Web"} />
                <InfoBlock icon={Calendar} title="Date de début" value={stats.internship.date_debut ? new Date(stats.internship.date_debut).toLocaleDateString() : "—"} />
                <InfoBlock icon={Calendar} title="Date de fin" value={stats.internship.date_fin ? new Date(stats.internship.date_fin).toLocaleDateString() : "—"} />
              </div>
            </motion.div>

            {/* PROGRESS SECTION */}
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                    <TrendingUp size={16} className="stroke-[2.2]" />
                  </div>
                  <span>Progression du Stage</span>
                </h2>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-455 text-base">
                  {stats.progress || 0}%
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress || 0}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full"
                />
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* TASKS SUMMARY KANBAN */}
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] lg:col-span-2"
              >
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">Résumé des Tâches Kanban</h2>
                  <p className="text-xxs text-slate-400 mt-0.5">État actuel des tâches affectées à votre stage.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <KanbanSummaryCard title="À faire" count={stats.tasks_todo || 0} color="bg-indigo-500" />
                  <KanbanSummaryCard title="En cours" count={stats.tasks_doing || 0} color="bg-amber-500" />
                  <KanbanSummaryCard title="Terminé" count={stats.tasks_done || 0} color="bg-emerald-500" />
                </div>

                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Besoin de réorganiser vos tâches ?</span>
                  <a href="/tasks" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Accéder au Kanban →</a>
                </div>
              </motion.div>

              {/* STATS DELIVERABLES */}
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                    <FileSpreadsheet size={16} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">Livrables de stage</h2>
                    <p className="text-[10px] text-slate-400">Total documents soumis</p>
                  </div>
                </div>

                <div className="text-center py-6">
                  <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{stats.deliverables || 0}</span>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Livrables officiels déposés</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                  <a href="/deliverables" className="text-xxs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Consulter les rapports →</a>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </MainLayout>
  );
}

function InfoBlock({ icon: Icon, title, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl flex items-start gap-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors">
      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-450 shrink-0">
        <Icon size={14} className="stroke-[2.2]" />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">{title}</p>
        <p className="font-bold text-slate-800 dark:text-slate-100 text-xs mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  );
}

function KanbanSummaryCard({ title, count, color }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center">
      <span className={`w-2.5 h-2.5 rounded-full ${color} mb-2`} />
      <span className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wider">{title}</span>
      <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">{count}</span>
    </div>
  );
}