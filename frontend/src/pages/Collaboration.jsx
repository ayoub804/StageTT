import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import { Share2, Video, FileText, Calendar, ShieldAlert } from "lucide-react";

export default function Collaboration() {
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
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Collaboration</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Partagez des fichiers, planifiez des réunions et échangez avec vos encadrants Tunisie Telecom.
            </p>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <FileText size={18} className="stroke-[2.2]" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Documents Partagés</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xxs leading-relaxed font-medium mb-6">
                Espace cloud partagé pour déposer vos documents de travail, codes sources et présentations.
              </p>
            </div>
            <button className="w-full text-xxs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 py-2.5 rounded-xl transition duration-150 cursor-pointer">
              Ouvrir le drive
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Video size={18} className="stroke-[2.2]" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Visioconférence</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xxs leading-relaxed font-medium mb-6">
                Lancez un appel vidéo ou audio en direct avec vos encadrants pour vos réunions de suivi hebdomadaires.
              </p>
            </div>
            <button className="w-full text-xxs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 py-2.5 rounded-xl transition duration-150 cursor-pointer">
              Démarrer un meeting
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Calendar size={18} className="stroke-[2.2]" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-1.5">Calendrier partagé</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xxs leading-relaxed font-medium mb-6">
                Planifiez des événements, des revues de sprint ou fixez la date de votre pré-soutenance.
              </p>
            </div>
            <button className="w-full text-xxs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-emerald-950/60 py-2.5 rounded-xl transition duration-150 cursor-pointer">
              Voir l'agenda
            </button>
          </div>
        </motion.div>

        {/* Info card */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert size={18} className="stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">Règle de confidentialité Tunisie Telecom</h4>
            <p className="text-slate-400 dark:text-slate-500 text-xxs font-medium mt-1 leading-relaxed">
              Tous les documents déposés sur l'espace de collaboration doivent respecter la charte de sécurité de Tunisie Telecom. Aucun code propriétaire ou donnée sensible ne doit être publié sans l'accord préalable de votre encadrant.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
