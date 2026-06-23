import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import { getDashboardStats, getStudents, getSupervisors, getTopics } from "../services/backend";
import { useToast } from "../context/ToastContext";
import Charts from "../components/Charts";
import {
  Users, UserCheck, FolderOpen, FileText, Download, RefreshCw, AlertCircle, TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

function KPICard({ title, value, icon: Icon, gradient, trend, loading }) {
  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} items-center justify-center mb-3 shadow-sm`}>
        <Icon size={18} className="text-white stroke-[2]" />
      </div>
      <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
        {loading ? <span className="animate-pulse text-slate-300 dark:text-slate-700">—</span> : value}
      </p>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">{title}</p>
      {trend && <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{trend}</p>}
    </div>
  );
}

export default function Statistics() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [extraData, setExtraData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, studentsRes, supervisorsRes, topicsRes] = await Promise.all([
        getDashboardStats(),
        getStudents().catch(() => ({ data: [] })),
        getSupervisors().catch(() => ({ data: [] })),
        getTopics().catch(() => ({ data: [] })),
      ]);

      setStats(dashRes.data);

      const students = studentsRes.data || [];
      const supervisors = supervisorsRes.data || [];
      const topics = topicsRes.data || [];

      // Compute derived stats
      const assignedStudents = students.filter((s) => s.internship).length;
      const available = topics.filter((t) => t.status === "Disponible").length;

      // Group students by internship status for Kanban-like chart
      const todo = dashRes.data?.kanban?.todo ?? 0;
      const doing = dashRes.data?.kanban?.doing ?? 0;
      const done = dashRes.data?.kanban?.done ?? 0;

      // Group supervisors by department
      const deptMap = {};
      supervisors.forEach((s) => {
        const dept = s.department?.nom || "Autre";
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      });
      const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

      // Topic tech breakdown
      const techMap = {};
      topics.forEach((t) => {
        if (t.technologies) {
          t.technologies.split(/,|\//).forEach((tech) => {
            const k = tech.trim();
            if (k) techMap[k] = (techMap[k] || 0) + 1;
          });
        }
      });
      const techData = Object.entries(techMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([tech, value]) => ({ tech, value }));

      setExtraData({
        students: students.length,
        supervisors: supervisors.length,
        topics: topics.length,
        assigned: assignedStudents,
        available,
        todo, doing, done,
        deptData: deptData.length ? deptData : [{ name: "Non défini", value: 1 }],
        techData: techData.length ? techData : [{ tech: "Aucune", value: 0 }],
        kanbanChart: [
          { name: "À faire", tasks: todo, fill: "#6366f1" },
          { name: "En cours", tasks: doing, fill: "#f59e0b" },
          { name: "Terminé", tasks: done, fill: "#10b981" },
        ],
      });
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les statistiques. Vérifiez le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleExport = () => {
    if (!extraData) return;
    const rows = [
      ["Indicateur", "Valeur"],
      ["Total Stagiaires", extraData.students],
      ["Total Encadrants", extraData.supervisors],
      ["Total Sujets", extraData.topics],
      ["Stagiaires Affectés", extraData.assigned],
      ["Tâches À faire", extraData.todo],
      ["Tâches En cours", extraData.doing],
      ["Tâches Terminées", extraData.done],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statistiques_stageTT_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Export CSV téléchargé ✓");
  };

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } };

  const totalTasks = (extraData?.todo ?? 0) + (extraData?.doing ?? 0) + (extraData?.done ?? 0);
  const completionRate = totalTasks > 0 ? Math.round((extraData.done / totalTasks) * 100) : 0;
  const assignmentRate = extraData?.students > 0 ? Math.round((extraData.assigned / extraData.students) * 100) : 0;

  return (
    <MainLayout>
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-7 pb-12">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Statistiques & Analytiques
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Données en temps réel depuis la base de données StageTT
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={load} title="Actualiser"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161b22] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={handleExport} disabled={!extraData}
              className="flex items-center gap-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50">
              <Download size={14} />
              Exporter CSV
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div variants={item}
            className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-2xl p-4">
            <AlertCircle size={16} className="shrink-0" />
            <span className="text-xs font-medium">{error}</span>
          </motion.div>
        )}

        {/* KPI Cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Stagiaires" value={extraData?.students} icon={Users}
            gradient="from-blue-500 to-indigo-500" trend={`${extraData?.assigned ?? 0} affectés`} loading={loading} />
          <KPICard title="Encadrants Actifs" value={extraData?.supervisors} icon={UserCheck}
            gradient="from-violet-500 to-purple-500" trend="Dans tous les départements" loading={loading} />
          <KPICard title="Sujets Disponibles" value={extraData?.available ?? extraData?.topics} icon={FolderOpen}
            gradient="from-emerald-500 to-teal-500" trend={`${extraData?.topics ?? 0} total`} loading={loading} />
          <KPICard title="Tâches Totales" value={totalTasks || (loading ? null : 0)} icon={FileText}
            gradient="from-amber-500 to-orange-500" trend={`${extraData?.done ?? 0} terminées`} loading={loading} />
        </motion.div>

        {/* Charts Row 1 */}
        {extraData && (
          <>
            <motion.div variants={item} className="grid lg:grid-cols-2 gap-6">
              {/* Kanban Tasks Chart */}
              <div className="bg-white dark:bg-[#161b22] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/60">
                <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">Répartition des tâches Kanban</h2>
                <p className="text-[10px] text-slate-400 mb-5">État des tâches en cours dans le système</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={extraData.kanbanChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="bg-slate-900 text-white border border-slate-800 p-2.5 rounded-xl shadow-xl text-xs font-semibold">
                            <p>{payload[0].name} : {payload[0].value} tâche{payload[0].value !== 1 ? "s" : ""}</p>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="tasks" name="Tâches" radius={[8, 8, 0, 0]} maxBarSize={48}
                      fill="url(#barGrad)" />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dept Distribution */}
              <div className="bg-white dark:bg-[#161b22] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/60">
                <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">Encadrants par département</h2>
                <p className="text-[10px] text-slate-400 mb-5">Répartition des encadrants selon leur département</p>
                <Charts type="pie" data={extraData.deptData} xKey="name" dataKey="value" />
              </div>
            </motion.div>

            {/* Charts Row 2 */}
            <motion.div variants={item} className="grid lg:grid-cols-2 gap-6">
              {/* Technology breakdown */}
              <div className="bg-white dark:bg-[#161b22] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/60">
                <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">Technologies des sujets</h2>
                <p className="text-[10px] text-slate-400 mb-5">Technologies les plus demandées dans les sujets de stage</p>
                <Charts type="bar" data={extraData.techData} xKey="tech" dataKey="value" />
              </div>

              {/* Big KPI rates */}
              <div className="grid grid-rows-2 gap-4">
                <div className="bg-white dark:bg-[#161b22] rounded-3xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50/40 dark:bg-indigo-500/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      <TrendingUp size={14} className="text-white" />
                    </div>
                    <h3 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Taux d'affectation</h3>
                  </div>
                  <p className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">{assignmentRate}%</p>
                  <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                      style={{ width: `${assignmentRate}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">{extraData.assigned} / {extraData.students} stagiaires affectés</p>
                </div>

                <div className="bg-white dark:bg-[#161b22] rounded-3xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50/40 dark:bg-emerald-500/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <FileText size={14} className="text-white" />
                    </div>
                    <h3 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Taux de complétion</h3>
                  </div>
                  <p className="text-4xl font-black bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">{completionRate}%</p>
                  <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                      style={{ width: `${completionRate}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">{extraData.done} / {totalTasks} tâches terminées</p>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Loading state */}
        {loading && !error && (
          <motion.div variants={item} className="bg-white dark:bg-[#161b22] rounded-3xl p-16 flex flex-col items-center gap-4 text-slate-400 border border-slate-200 dark:border-slate-700/60 shadow-sm">
            <div className="w-10 h-10 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm font-medium">Chargement des statistiques...</p>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}