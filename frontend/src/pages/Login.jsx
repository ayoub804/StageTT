import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../services/auth";
import api from "../services/api";
import { motion } from "framer-motion";

import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  ShieldCheck,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      const { token, user } = response.data;

      saveAuth(token, user.role, user.name);

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "supervisor") {
        navigate("/supervisor");
      } else if (user.role === "student") {
        navigate("/student");
      } else {
        setError("Rôle utilisateur invalide.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("password123");
  };

  // Variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 overflow-hidden relative">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Partie Gauche: Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Logo Header */}
          <motion.div variants={itemVariants} className="mb-8 flex items-center gap-3">
            <div className="p-1 rounded-2xl bg-white shadow-md border border-slate-100 flex-shrink-0">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcjAL9itCcYdAhLn5lm1jzsMtQMT75EzG3yMOCHB3MDw1vYaQ_yhivDm8&s=10"
                alt="Tunisie Telecom"
                className="w-12 h-12 object-contain rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-wider">
                StageTT
              </h1>
              <p className="text-slate-400 text-xxs font-semibold uppercase tracking-widest">
                Tunisie Telecom Portal
              </p>
            </div>
          </motion.div>

          {/* Card */}
          <motion.div 
            variants={itemVariants} 
            className="bg-slate-950/40 backdrop-blur-xl rounded-3xl border border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500" />
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Connexion
              </h2>
              <p className="text-slate-400 text-xs mt-1.5">
                Accédez en toute sécurité à votre espace d'administration et de suivi.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 text-xs text-white rounded-xl border border-slate-800 bg-slate-900/30 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 text-xs text-white rounded-xl border border-slate-800 bg-slate-900/30 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between text-xxs pt-1">
                <div className="flex items-center gap-1.5">
                  <input type="checkbox" id="remember" className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0" />
                  <label htmlFor="remember" className="text-slate-400 font-medium cursor-pointer">Se souvenir de moi</label>
                </div>
                <button type="button" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-75 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(79,70,229,0.35)] transition-all cursor-pointer hover:translate-y-[-1px] active:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Comptes démo interactifs */}
            <div className="mt-6 pt-5 border-t border-slate-800/60">
              <h4 className="text-xxs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Comptes de Démonstration (remplissage automatique)
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount("admin@test.com")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                    email === "admin@test.com"
                      ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-400"
                      : "bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="mb-0.5">Admin</span>
                  <span className="text-[8px] text-slate-500 font-medium">Click</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount("sup@test.com")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                    email === "sup@test.com"
                      ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-400"
                      : "bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="mb-0.5">Encadrant</span>
                  <span className="text-[8px] text-slate-500 font-medium">Click</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount("student@test.com")}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer ${
                    email === "student@test.com"
                      ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-400"
                      : "bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="mb-0.5">Stagiaire</span>
                  <span className="text-[8px] text-slate-500 font-medium">Click</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Partie Droite: Visuel */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-950 overflow-hidden items-center justify-center border-l border-slate-800/40">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-slate-950 to-slate-950 z-0" />
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-[0.06] z-0" />

        <div className="relative z-10 max-w-lg px-12 text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xxs font-bold uppercase tracking-widest rounded-full mb-6">
              Nouveauté v2.0
            </span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Gérez vos stages avec une
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                intelligence intégrée.
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Suivi en temps réel des livrables de stage, affectation dynamique des sujets et planification avancée.
            </p>
          </motion.div>

          {/* Features list */}
          <div className="space-y-4">
            <FeatureRow 
              icon={GraduationCap}
              title="Suivi structuré des stages"
              desc="De l'affectation à la validation du rapport de fin de stage."
            />
            <FeatureRow 
              icon={Users}
              title="Canal collaboratif sécurisé"
              desc="Échanges simplifiés entre étudiants et maîtres de stage."
            />
            <FeatureRow 
              icon={ShieldCheck}
              title="Rapports et analyses automatiques"
              desc="Génération de planning de progression intelligente."
            />
          </div>
        </div>

        {/* Backdrop Decorative circles */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-60 h-60 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, desc }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
      className="flex items-start gap-4 p-3 rounded-2xl bg-slate-900/30 border border-slate-800/30 hover:border-slate-800/60 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/15 text-indigo-400 border border-indigo-500/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="stroke-[2.2]" />
      </div>
      <div>
        <h4 className="font-bold text-white text-xs tracking-tight">{title}</h4>
        <p className="text-slate-400 text-xxs leading-normal mt-0.5">{desc}</p>
      </div>
    </motion.div>
  );
}