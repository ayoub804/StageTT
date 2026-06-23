import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function ProgressCard({
  name = "Projet",
  percentage = 0,
  status = "en_cours",
}) {
  const getStatusConfig = () => {
    switch (status) {
      case "termine":
        return {
          label: "Terminé",
          color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400",
          icon: <CheckCircle size={14} className="stroke-[2.5]" />,
          barClass: "bg-gradient-to-r from-emerald-400 to-teal-500",
        };
      case "retard":
        return {
          label: "En retard",
          color: "text-rose-700 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400",
          icon: <AlertCircle size={14} className="stroke-[2.5]" />,
          barClass: "bg-gradient-to-r from-rose-400 to-red-500",
        };
      default:
        return {
          label: "En cours",
          color: "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400",
          icon: <Clock size={14} className="stroke-[2.5]" />,
          barClass: "bg-gradient-to-r from-indigo-50 via-purple-500 to-pink-500",
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 dark:border-slate-800 p-5 w-full relative overflow-hidden group"
    >
      {/* Subtle hover background effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/0 to-indigo-50/10 pointer-events-none group-hover:from-slate-50/40 group-hover:to-indigo-50/20 transition-all duration-300" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate flex-1" title={name}>
            {name}
          </h3>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${statusConfig.color}`}
          >
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* Percentage */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Progression
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {percentage}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full relative ${statusConfig.barClass}`}
          >
            {/* Shimmer Effect */}
            {status === "en_cours" && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}