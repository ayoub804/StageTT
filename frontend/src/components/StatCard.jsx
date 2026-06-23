import { motion } from "framer-motion";

const GRADIENT_MAP = {
  blue: "from-blue-500 to-indigo-500",
  green: "from-emerald-500 to-teal-500",
  purple: "from-purple-500 to-violet-500",
  indigo: "from-indigo-500 to-violet-500",
  red: "from-rose-500 to-red-500",
  rose: "from-rose-500 to-red-500",
  orange: "from-amber-500 to-orange-500",
};

function getGradient(colorClass) {
  for (const [key, val] of Object.entries(GRADIENT_MAP)) {
    if (colorClass.includes(key)) return val;
  }
  return "from-slate-400 to-slate-500";
}

export default function StatCard({ title, value, icon: Icon, color = "bg-blue-100 text-blue-600", trend }) {
  const gradient = getGradient(color);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-slate-900/30 transition-all duration-300 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-50/40 to-transparent dark:from-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
        {Icon && <Icon size={18} className="text-white stroke-[2]" />}
      </div>

      <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tabular-nums">{value ?? "—"}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{title}</p>

      {trend && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {trend}
        </p>
      )}
    </motion.div>
  );
}