import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getAIPlan, generateAIPlan } from "../services/backend";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

import {
  Sparkles,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function PlanningAI() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [planning, setPlanning] = useState([]);
  const [planMeta, setPlanMeta] = useState(null);

  const recommendations = [
    {
      icon: AlertTriangle,
      title: "Risques détectés",
      description: "Le développement Frontend risque un léger retard lié aux dépendances graphiques.",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-gradient-to-tr from-rose-500/10 to-red-500/10 border border-rose-200/30 dark:border-rose-900/30",
    },
    {
      icon: Clock,
      title: "Retards potentiels",
      description: "Les tests de bout en bout dépendent de la validation finale de l'API de paiement.",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-amber-200/30 dark:border-amber-900/30",
    },
    {
      icon: Sparkles,
      title: "Conseils IA",
      description: "Prioriser l'intégration API avant la finalisation des composants de l'interface utilisateur.",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 border border-indigo-200/30 dark:border-indigo-900/30",
    },
  ];

  const alerts = [
    {
      title: "Rapport intermédiaire requis",
      date: "Dans 2 jours",
      color: "bg-rose-500",
    },
    {
      title: "Validation UML requise par l'encadrant",
      date: "Dans 5 jours",
      color: "bg-amber-500",
    },
    {
      title: "Soutenance de fin de stage",
      date: "15 Juillet 2026",
      color: "bg-indigo-500",
    },
  ];

  const fetchActivePlan = async () => {
    try {
      setLoading(true);
      const res = await getAIPlan();
      const { plan, tasks } = res.data;
      setPlanMeta(plan);
      
      const mapped = tasks.map((task, idx) => ({
        phase: task,
        week: `Semaine ${idx + 1}`,
        progress: idx === 0 ? 100 : idx === 1 ? 85 : idx === 2 ? 60 : idx === 3 ? 30 : 0
      }));
      setPlanning(mapped);
    } catch (err) {
      // If 404, load default template
      if (err.response?.status === 404) {
        setPlanning([
          { phase: "Analyse des besoins & Spécifications", week: "Semaine 1", progress: 100 },
          { phase: "Conception de l'architecture & Diagrammes UML", week: "Semaine 2", progress: 100 },
          { phase: "Configuration environnement de dev & Maquettage", week: "Semaine 3", progress: 80 },
          { phase: "Développement des APIs Backend", week: "Semaine 4", progress: 50 },
          { phase: "Intégration du Frontend & Vues principales", week: "Semaine 5", progress: 20 },
          { phase: "Tests d'intégration et correction de bugs", week: "Semaine 6", progress: 0 },
          { phase: "Rédaction du rapport de stage final", week: "Semaine 7", progress: 0 },
        ]);
      } else {
        addToast("Erreur lors du chargement du planning.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const generatePlanning = async () => {
    const topic = prompt("Quel est le sujet ou le titre du projet ?", "Plateforme de gestion de stages StageTT");
    if (!topic) return;

    setLoading(true);
    try {
      const res = await generateAIPlan({ topic });
      addToast("Planning généré avec succès par l'IA ✓");
      const { plan, tasks } = res.data;
      setPlanMeta(plan);

      const mapped = tasks.map((task, idx) => ({
        phase: task,
        week: `Semaine ${idx + 1}`,
        progress: 0
      }));
      setPlanning(mapped);
    } catch (error) {
      console.error(error);
      addToast("Erreur lors de la génération du planning.", "error");
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span>Planning IA</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Générez et simulez des plannings de travail optimisés par notre modèle d'intelligence artificielle.
            </p>
          </div>

          <button
            onClick={generatePlanning}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all disabled:opacity-70 cursor-pointer hover:translate-y-[-1px] active:translate-y-0 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} className="animate-spin-slow" />
                <span>Générer un nouveau planning</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Planning IA */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              <Sparkles size={16} className="stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Planification chronologique générée
              </h2>
              {planMeta && (
                <p className="text-[10px] text-slate-400 mt-0.5">Dernière mise à jour le {new Date(planMeta.created_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {planning.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">Aucun planning disponible. Veuillez en générer un.</div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-4 space-y-6">
              {planning.map((item, index) => (
                <div key={index} className="relative group flex gap-5">
                  {/* Connector Dot */}
                  <span className="absolute -left-[35px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 group-hover:bg-indigo-600 transition-all duration-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 group-hover:bg-white" />
                  </span>

                  <div className="flex-1 pb-2">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {item.phase}
                      </h3>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-lg">
                        {item.week}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <div className="mt-2 text-xxs font-semibold text-slate-400 dark:text-slate-500">
                      Progression : <span className="text-indigo-600 dark:text-indigo-400 font-bold">{item.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recommandations IA */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-tight">
            Recommandations & Conseils
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {recommendations.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -3 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col items-start"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                    <Icon size={20} className={`${item.color} stroke-[2.2]`} />
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-1.5">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Graphique Prévisionnel */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={16} className="stroke-[2.2]" />
            </div>
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Comparatif d'Avancement Réel vs Théorique
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xxs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                <span>Progression réelle accumulée</span>
                <span className="text-emerald-600 dark:text-emerald-400">65%</span>
              </div>
              <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: "65%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xxs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                <span>Progression théorique attendue</span>
                <span className="text-indigo-600 dark:text-indigo-400">80%</span>
              </div>
              <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: "80%" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alertes IA */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
              <AlertTriangle size={16} className="stroke-[2.2]" />
            </div>
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Alertes de plan de charge critiques
            </h2>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${alert.color}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {alert.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xxs font-semibold text-slate-400 dark:text-slate-500">
                  <Calendar size={12} />
                  <span>{alert.date}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}