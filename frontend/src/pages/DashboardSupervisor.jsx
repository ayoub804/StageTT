import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";
import ProgressCard from "../components/ProgressCard";
import { getDashboardStats } from "../services/backend";
import { useToast } from "../context/ToastContext";

import {
  Users,
  FileCheck,
  AlertTriangle,
  MessageSquare,
  Eye,
  CheckCircle2,
  XCircle,
  FolderKanban,
  Check,
  X
} from "lucide-react";

export default function DashboardSupervisor() {
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
      addToast("Erreur lors du chargement des statistiques de l'encadrant.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const students = [
    {
      name: "Islem Trabelsi",
      subject: "StageTT - Gestion des stages",
      progress: 75,
      deliverable: "Diagramme UML",
    },
    {
      name: "Ahmed Ben Ali",
      subject: "Application Réseau",
      progress: 55,
      deliverable: "Cahier des charges",
    },
  ];

  const deliverables = [
    {
      student: "Islem Trabelsi",
      type: "Diagramme UML",
      date: "15/06/2026",
    },
    {
      student: "Ahmed Ben Ali",
      type: "Cahier des charges",
      date: "14/06/2026",
    },
  ];

  const messages = [
    {
      sender: "Islem Trabelsi",
      message: "J'ai terminé le diagramme de classes.",
      time: "09:30",
    },
    {
      sender: "Ahmed Ben Ali",
      message: "Pouvez-vous vérifier mon cahier des charges ?",
      time: "08:45",
    },
  ];

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

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-12"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span>Dashboard Encadrant</span>
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Suivez l'avancement des stagiaires, validez les rapports et supervisez les tâches Kanban.
            </p>
          </div>
        </motion.div>

        {/* KPI CARDS */}
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs">Chargement du tableau de bord...</div>
        ) : (
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Stagiaires" value={stats?.students_assigned || 0} icon={Users} color="bg-blue-100 text-blue-600" trend="Stagiaires affectés" />
            <StatCard title="Stages Suivis" value={stats?.internships || 0} icon={FileCheck} color="bg-green-100 text-green-600" trend="Stages supervisés" />
            <StatCard title="Sujets Proposés" value={stats?.topics || 0} icon={FolderKanban} color="bg-purple-100 text-purple-600" trend="Total de vos sujets" />
            <StatCard title="Tâches Kanban" value={stats?.tasks || 0} icon={AlertTriangle} color="bg-indigo-100 text-indigo-600" trend="Tâches globales" />
          </motion.div>
        )}

        {/* PROGRESS CARD ROW */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-5">
          <ProgressCard name="StageTT - Islem Trabelsi" percentage={75} status="en_cours" />
          <ProgressCard name="Application Réseau - Ahmed" percentage={55} status="en_cours" />
          <ProgressCard name="Plateforme RH - Sarra" percentage={90} status="termine" />
        </motion.div>

        {/* MES STAGIAIRES */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-5">
            Suivi Individuel des Stagiaires
          </h3>

          <div className="space-y-4">
            {stats?.active_internships?.map((student, index) => (
              <div
                key={index}
                className="border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://ui-avatars.com/api/?name=${student.student_name}&background=f3f4f6&color=4f46e5&bold=true`}
                      className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800"
                      alt={student.student_name}
                    />

                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{student.student_name}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {student.topic_title}
                      </p>
                      <span className="inline-block text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 px-2 py-0.5 rounded-full mt-1.5">
                        Dernier livrable : {student.last_deliverable}
                      </span>
                    </div>
                  </div>

                  <div className="w-full lg:w-64">
                    <div className="flex justify-between text-xxs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                      <span>Progression</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{student.progress}%</span>
                    </div>

                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                  </div>

                  <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 text-xxs font-bold rounded-xl transition duration-150 cursor-pointer">
                    <Eye size={12} />
                    <span>Détails</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* LIVRABLES + MESSAGES */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
          {/* LIVRABLES */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Livrables récents à valider
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-semibold uppercase tracking-wider">
                    <th className="p-4">Stagiaire</th>
                    <th className="p-4">Document</th>
                    <th className="p-4">Date de dépôt</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats?.recent_deliverables?.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors duration-150">
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">{item.student_name}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-semibold">{item.type}</td>
                      <td className="p-4 text-slate-400 dark:text-slate-500 font-medium">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-5">
              Messages récents de l'équipe
            </h3>

            <div className="space-y-3">
              {/* Note: Messages are currently still mocked as they are not fetched in this endpoint yet */}
              {[
                { sender: "Islem Trabelsi", message: "J'ai terminé le diagramme de classes.", time: "09:30" },
                { sender: "Ahmed Ben Ali", message: "Pouvez-vous vérifier mon cahier des charges ?", time: "08:45" }
              ].map((msg, index) => (
                <div key={index} className="border border-slate-200/60 dark:border-slate-850 rounded-2xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {msg.time}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xxs font-medium mt-2 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}