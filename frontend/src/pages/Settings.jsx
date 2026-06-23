import MainLayout from "../layouts/MainLayout";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Shield, Moon, Globe, Check, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const { dark, toggleDark } = useTheme();

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
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Paramètres</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Configurez vos préférences de compte, alertes et sécurité.
            </p>
          </div>
        </motion.div>

        {/* Tab system */}
        <div className="grid lg:grid-cols-4 gap-6 items-start">
          {/* Tab buttons */}
          <motion.div variants={itemVariants} className="flex flex-row lg:flex-col overflow-x-auto gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-2 rounded-2xl shrink-0">
            <TabBtn id="general" label="Général" icon={SettingsIcon} active={activeTab} onClick={setActiveTab} />
            <TabBtn id="notifs" label="Notifications" icon={Bell} active={activeTab} onClick={setActiveTab} />
            <TabBtn id="security" label="Sécurité" icon={Shield} active={activeTab} onClick={setActiveTab} />
          </motion.div>

          {/* Content area */}
          <motion.div variants={itemVariants} className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">Configuration générale</h3>
                  <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium">Préférences linguistiques et apparence de la plateforme StageTT.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                        <Globe size={14} />
                      </div>
                      <span>Langue d'affichage</span>
                    </div>
                    <select className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-850 text-xs font-semibold text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer">
                      <option>Français (FR)</option>
                      <option>English (US)</option>
                      <option>العربية (AR)</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                        {dark ? <Sun size={14} /> : <Moon size={14} />}
                      </div>
                      <span>Mode sombre</span>
                    </div>
                    <button 
                      onClick={toggleDark}
                      className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      {dark ? "Activé" : "Désactivé"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifs" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">Alertes de notifications</h3>
                  <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium">Choisissez quand et comment vous souhaitez être notifié.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <span>Alertes par Email</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Recevoir un email pour les nouveaux livrables ou retards.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={emailAlerts}
                      onChange={() => setEmailAlerts(!emailAlerts)}
                      className="w-4 h-4 rounded text-indigo-600 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-0 cursor-pointer" 
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span>Notifications Push</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Recevoir des notifications système instantanées.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={pushAlerts}
                      onChange={() => setPushAlerts(!pushAlerts)}
                      className="w-4 h-4 rounded text-indigo-600 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-0 cursor-pointer" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">Sécurité & Connexion</h3>
                  <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium">Modifiez votre mot de passe et configurez l'authentification.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Mot de passe actuel</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:bg-white dark:focus:bg-slate-750 text-xs font-medium text-slate-800 dark:text-slate-250" />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Nouveau mot de passe</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:bg-white dark:focus:bg-slate-750 text-xs font-medium text-slate-800 dark:text-slate-250" />
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xxs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-indigo-600/10">
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}

function TabBtn({ id, label, icon: Icon, active, onClick }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2.5 px-4 py-3 text-xs font-bold rounded-xl transition duration-150 cursor-pointer w-full text-left whitespace-nowrap ${
        isActive 
          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200/50 dark:border-slate-700/50 shadow-sm" 
          : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/40 hover:text-slate-700 dark:hover:text-slate-200"
      }`}
    >
      <Icon size={14} className="stroke-[2.2]" />
      <span>{label}</span>
    </button>
  );
}
