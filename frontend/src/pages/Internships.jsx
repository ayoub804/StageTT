import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { getStudents, getSupervisors, getTopics, assignInternship } from "../services/backend";
import { Search, Plus, Users, Briefcase, X, Check, RefreshCw, AlertCircle } from "lucide-react";

const STATUS_BADGE = {
  Assigné: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20",
  "En cours": "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-500/20",
  Terminé: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20",
};

function AssignModal({ students, supervisors, topics, onClose, onSave, saving }) {
  const [form, setForm] = useState({ student_id: "", supervisor_id: "", topic_id: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.student_id || !form.supervisor_id || !form.topic_id) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/60 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Nouvelle Affectation</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Stagiaire *</label>
            <select
              required
              value={form.student_id}
              onChange={(e) => set("student_id", e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs dark:bg-slate-800/60 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">Choisir un stagiaire...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.name || "Sans nom"} — {s.specialite || s.user?.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Encadrant *</label>
            <select
              required
              value={form.supervisor_id}
              onChange={(e) => set("supervisor_id", e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs dark:bg-slate-800/60 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">Choisir un encadrant...</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.name || "Sans nom"} — {s.department?.nom || "Sans département"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sujet de stage *</label>
            <select
              required
              value={form.topic_id}
              onChange={(e) => set("topic_id", e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs dark:bg-slate-800/60 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">Choisir un sujet...</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-300">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60">
              {saving ? <span className="spinner" /> : <Check size={13} />}
              {saving ? "En cours..." : "Affecter"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Internships() {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [topics, setTopics] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, supRes, tRes] = await Promise.all([
        getStudents(),
        getSupervisors(),
        getTopics(),
      ]);
      setStudents(sRes.data || []);
      setSupervisors(supRes.data || []);
      setTopics(tRes.data || []);

      // Build assignment list from students that have internships
      const assigned = (sRes.data || [])
        .filter((s) => s.internship)
        .map((s) => ({
          id: s.internship.id,
          student: s.user?.name || "—",
          supervisor: s.internship?.supervisor?.user?.name || "—",
          topic: s.internship?.topic?.title || "—",
          department: s.internship?.supervisor?.department?.nom || "—",
          status: s.internship?.status || "Assigné",
          startDate: s.internship?.date_debut || null,
        }));
      setAssignments(assigned);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async (form) => {
    setSaving(true);
    try {
      await assignInternship(form);
      addToast("Stage affecté avec succès ✓");
      setShowModal(false);
      await load();
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de l'affectation";
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = assignments.filter((a) =>
    a.student.toLowerCase().includes(search.toLowerCase()) ||
    a.supervisor.toLowerCase().includes(search.toLowerCase()) ||
    a.topic.toLowerCase().includes(search.toLowerCase())
  );

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } };

  return (
    <MainLayout>
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-7 pb-12">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Gestion des Stages</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Affectez les stagiaires aux encadrants et sujets. Données en temps réel.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={load} title="Actualiser"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161b22] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer hover:-translate-y-0.5">
              <Plus size={14} />
              <span>Affecter un stage</span>
            </button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Stagiaires", value: students.length, color: "from-blue-500 to-indigo-500", icon: "👨‍🎓" },
            { label: "Encadrants", value: supervisors.length, color: "from-violet-500 to-purple-500", icon: "👨‍💼" },
            { label: "Sujets", value: topics.length, color: "from-emerald-500 to-teal-500", icon: "📋" },
            { label: "Affectations", value: assignments.length, color: "from-amber-500 to-orange-500", icon: "🔗" },
          ].map((k) => (
            <div key={k.label}
              className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${k.color} text-white text-base mb-3`}>
                {k.icon}
              </div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "—" : k.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{k.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div variants={item} className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-2xl p-4 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Search */}
        <motion.div variants={item} className="relative max-w-sm">
          <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un stage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 bg-white dark:bg-[#161b22] dark:text-slate-200 transition placeholder-slate-400"
          />
        </motion.div>

        {/* Table */}
        <motion.div variants={item}
          className="bg-white dark:bg-[#161b22] rounded-3xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">Affectations actives</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Données synchronisées avec la base de données</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
              {filtered.length} enregistrement{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center gap-4 text-slate-400">
              <div className="spinner w-8 h-8 border-[3px]" style={{ borderTopColor: "#6366f1", borderColor: "rgba(99,102,241,0.15)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              <p className="text-sm font-medium">Chargement des données...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-3xl">🔗</div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Aucune affectation</h3>
              <p className="text-slate-400 text-xs mt-1.5 max-w-xs mx-auto">
                {search ? "Aucun résultat pour cette recherche." : "Commencez par affecter un stagiaire à un encadrant."}
              </p>
              {!search && (
                <button onClick={() => setShowModal(true)}
                  className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition cursor-pointer">
                  + Nouvelle affectation
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[10px] font-bold">
                    <th className="p-4">Stagiaire</th>
                    <th className="p-4">Encadrant</th>
                    <th className="p-4">Sujet</th>
                    <th className="p-4">Département</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4">Début</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">{a.student}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{a.supervisor}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium max-w-[160px] truncate">{a.topic}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                          {a.department}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_BADGE[a.status] || STATUS_BADGE["Assigné"]}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {a.startDate ? new Date(a.startDate).toLocaleDateString("fr-FR") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <AssignModal
            students={students}
            supervisors={supervisors}
            topics={topics}
            onClose={() => setShowModal(false)}
            onSave={handleAssign}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </MainLayout>
  );
}