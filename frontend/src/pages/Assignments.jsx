import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { getStudents, getSupervisors, getTopics, assignInternship } from "../services/backend";
import { Plus, Sparkles, UserCheck, Search, RefreshCw, AlertCircle, X, Check } from "lucide-react";

function AssignModal({ students, supervisors, topics, onClose, onSave, saving }) {
  const [form, setForm] = useState({ student_id: "", supervisor_id: "", topic_id: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedSupervisor = supervisors.find((s) => String(s.id) === String(form.supervisor_id));
  const supervisorTopics = form.supervisor_id
    ? topics.filter((t) => String(t.supervisor_id) === String(form.supervisor_id))
    : topics;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/60 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Nouvelle Affectation</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Associez un stagiaire à un encadrant et un sujet</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (form.student_id && form.supervisor_id && form.topic_id) onSave(form); }}
          className="p-5 space-y-4">

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Stagiaire *</label>
            <select required value={form.student_id} onChange={(e) => set("student_id", e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs dark:bg-slate-800/60 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition">
              <option value="">Choisir un stagiaire...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.name || "Sans nom"}
                  {s.specialite ? ` — ${s.specialite}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Encadrant *</label>
            <select required value={form.supervisor_id} onChange={(e) => { set("supervisor_id", e.target.value); set("topic_id", ""); }}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs dark:bg-slate-800/60 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition">
              <option value="">Choisir un encadrant...</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.name || "Sans nom"}
                  {s.department?.nom ? ` — ${s.department.nom}` : ""}
                </option>
              ))}
            </select>
            {selectedSupervisor && (
              <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-1 font-medium">
                Département : {selectedSupervisor.department?.nom || "Non défini"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Sujet * {form.supervisor_id && <span className="normal-case font-normal text-slate-400">(filtrés par encadrant)</span>}
            </label>
            <select required value={form.topic_id} onChange={(e) => set("topic_id", e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs dark:bg-slate-800/60 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition">
              <option value="">Choisir un sujet...</option>
              {supervisorTopics.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            {supervisorTopics.length === 0 && form.supervisor_id && (
              <p className="text-[10px] text-amber-500 mt-1">Aucun sujet disponible pour cet encadrant.</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-300">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 hover:from-indigo-500 hover:to-violet-500">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={13} />}
              {saving ? "En cours..." : "Affecter"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Assignments() {
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
      const stds = sRes.data || [];
      const sups = supRes.data || [];
      const tops = tRes.data || [];

      setStudents(stds);
      setSupervisors(sups);
      setTopics(tops);

      // Build assignments from students with internships
      const assigned = stds
        .filter((s) => s.internship)
        .map((s) => ({
          id: s.internship.id,
          student: s.user?.name || "—",
          studentEmail: s.user?.email || "",
          supervisor: s.internship?.supervisor?.user?.name || "—",
          topic: s.internship?.topic?.title || "—",
          department: s.internship?.supervisor?.department?.nom || "—",
          status: s.internship?.status || "Assigné",
          progress: s.internship?.progress_percentage ?? 0,
        }));
      setAssignments(assigned);
    } catch (err) {
      setError("Erreur de chargement. Vérifiez que le serveur Laravel est actif.");
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

  const unassigned = students.filter((s) => !s.internship);
  const filtered = assignments.filter((a) =>
    a.student.toLowerCase().includes(search.toLowerCase()) ||
    a.supervisor.toLowerCase().includes(search.toLowerCase()) ||
    a.topic.toLowerCase().includes(search.toLowerCase())
  );

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } };

  const statusColor = (s) => {
    if (s === "En cours") return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-500/20";
    if (s === "Terminé") return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20";
    return "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20";
  };

  return (
    <MainLayout>
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-7 pb-12">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Affectations</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Gestion des affectations stagiaires ↔ encadrants ↔ sujets</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={load} title="Actualiser"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161b22] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer hover:-translate-y-0.5">
              <Plus size={14} />
              <span>Nouvelle Affectation</span>
            </button>
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Stagiaires", value: students.length, emoji: "👨‍🎓", bg: "from-blue-500 to-indigo-500" },
            { label: "Non Affectés", value: unassigned.length, emoji: "⏳", bg: "from-amber-500 to-orange-500" },
            { label: "Affectés", value: assignments.length, emoji: "✅", bg: "from-emerald-500 to-teal-500" },
            { label: "Encadrants", value: supervisors.length, emoji: "👨‍💼", bg: "from-violet-500 to-purple-500" },
          ].map((k) => (
            <div key={k.label} className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm">
              <div className={`inline-flex w-9 h-9 rounded-xl bg-gradient-to-br ${k.bg} items-center justify-center text-base mb-3`}>{k.emoji}</div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "—" : k.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{k.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Action cards */}
        <motion.div variants={item} className="grid md:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 dark:bg-indigo-500/5 rounded-full blur-2xl" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4">
              <Sparkles size={18} className="text-white stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-2">Affectation Intelligente</h3>
            <p className="text-slate-400 text-[10px] leading-relaxed mb-5">
              Associez automatiquement les stagiaires aux encadrants disponibles selon leurs compétences et disponibilités.
            </p>
            {unassigned.length > 0 ? (
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {unassigned.length} stagiaire{unassigned.length > 1 ? "s" : ""} en attente d'affectation
              </p>
            ) : (
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Tous les stagiaires sont affectés ✓</p>
            )}
          </div>

          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/40 dark:bg-emerald-500/5 rounded-full blur-2xl" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
              <UserCheck size={18} className="text-white stroke-[2.2]" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-2">Affectation Manuelle</h3>
            <p className="text-slate-400 text-[10px] leading-relaxed mb-5">
              Choisissez manuellement le binôme étudiant/encadrant et le sujet de stage correspondant.
            </p>
            <button onClick={() => setShowModal(true)}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-4 py-2 rounded-xl transition cursor-pointer">
              + Affecter manuellement
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div variants={item}
            className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-2xl p-4 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span className="text-xs">{error}</span>
          </motion.div>
        )}

        {/* Search + Table */}
        <motion.div variants={item} className="space-y-4">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une affectation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 bg-white dark:bg-[#161b22] dark:text-slate-200 transition placeholder-slate-400"
            />
          </div>

          <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">Historique des affectations</h2>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {filtered.length} affectation{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div className="p-12 flex flex-col items-center gap-3 text-slate-400">
                <div className="w-8 h-8 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-xs font-medium">Chargement...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-2xl">🔗</div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Aucune affectation trouvée</h3>
                <p className="text-slate-400 text-xs mt-1.5">
                  {search ? "Modifiez votre recherche." : "Créez la première affectation."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-4">Stagiaire</th>
                      <th className="p-4">Encadrant</th>
                      <th className="p-4">Sujet</th>
                      <th className="p-4">Département</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4">Progression</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{a.student}</p>
                          <p className="text-[10px] text-slate-400">{a.studentEmail}</p>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{a.supervisor}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 max-w-[150px] truncate font-medium">{a.topic}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                            {a.department}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColor(a.status)}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-4 w-32">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
                                style={{ width: `${a.progress}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-7 text-right">{a.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
