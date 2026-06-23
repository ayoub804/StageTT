import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { getRole } from "../services/auth";
import {
  getTopics, createTopic, updateTopic, deleteTopic
} from "../services/backend";
import {
  Search, Plus, Pencil, Trash2, Clock3, User, Code2, X, Check, FileText
} from "lucide-react";

const EMPTY_FORM = { title: "", technologies: "", duree: "", description: "", status: "Disponible" };

function TopicModal({ topic, onClose, onSave }) {
  const [form, setForm] = useState(topic ? {
    title: topic.title || "",
    technologies: topic.technologies || "",
    duree: topic.duree || "",
    description: topic.description || "",
    status: topic.status || "Disponible"
  } : EMPTY_FORM);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {topic ? "Modifier le sujet" : "Nouveau sujet"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Titre du sujet *</label>
            <input
              required
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Plateforme de gestion de stages"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Technologies</label>
            <input
              value={form.technologies}
              onChange={(e) => handleChange("technologies", e.target.value)}
              placeholder="Ex: React, Laravel, PostgreSQL"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Durée</label>
              <input
                value={form.duree}
                onChange={(e) => handleChange("duree", e.target.value)}
                placeholder="Ex: 4 mois"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Statut</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="Disponible">Disponible</option>
                <option value="Affecté">Affecté</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Description détaillée du sujet de stage..."
              rows={3}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-300">
              Annuler
            </button>
            <button type="submit" className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5">
              <Check size={13} />
              {topic ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function DeleteConfirmModal({ topic, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="text-rose-500" size={24} />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">Supprimer le sujet?</h3>
          <p className="text-slate-400 text-xs leading-relaxed">«{topic.title}» sera définitivement supprimé.</p>
        </div>
        <div className="flex gap-3 p-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-300">
            Annuler
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer">
            Supprimer
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Topics() {
  const { addToast } = useToast();
  const role = getRole();
  const isSupervisor = role === "supervisor";

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { type: 'add' | 'edit', topic? } | { type: 'delete', topic }

  const fetchAllTopics = async () => {
    try {
      setLoading(true);
      const res = await getTopics();
      setTopics(res.data);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement des sujets.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTopics();
  }, []);

  const filtered = topics.filter((t) => {
    const matchSearch =
      (t.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.technologies || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.supervisor?.user?.name || "").toLowerCase().includes(search.toLowerCase());
    
    const formattedStatus = (t.status || "").toLowerCase() === "disponible" ? "Disponible" : "Affecté";
    const matchStatus = filterStatus === "Tous" || formattedStatus === filterStatus;
    
    return matchSearch && matchStatus;
  });

  const handleSave = async (form) => {
    try {
      if (modal?.topic) {
        // Update Topic
        const res = await updateTopic(modal.topic.id, form);
        addToast("Sujet modifié avec succès ✓");
      } else {
        // Create Topic
        const res = await createTopic(form);
        addToast("Nouveau sujet créé ✓");
      }
      setModal(null);
      fetchAllTopics();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de l'enregistrement du sujet.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTopic(modal.topic.id);
      addToast("Sujet supprimé avec succès", "error");
      setModal(null);
      fetchAllTopics();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la suppression.", "error");
    }
  };

  const getStatusBadge = (status) => {
    const formatted = (status || "").toLowerCase();
    return formatted === "disponible" ? (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 text-[10px] font-bold">Disponible</span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 text-[10px] font-bold">Affecté</span>
    );
  };

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } };

  return (
    <MainLayout>
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Gestion des Sujets</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Consultez, modifiez et proposez de nouveaux sujets de stages.</p>
          </div>
          {isSupervisor && (
            <button
              id="add-topic-btn"
              onClick={() => setModal({ type: "add" })}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all cursor-pointer hover:-translate-y-0.5 shrink-0"
            >
              <Plus size={15} />
              <span>Nouveau Sujet</span>
            </button>
          )}
        </motion.div>

        {/* Toolbar */}
        <motion.div variants={item} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 flex flex-col md:flex-row gap-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Rechercher un sujet, technologie, encadrant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-800/50 dark:text-slate-200 transition-all placeholder-slate-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 cursor-pointer focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="Disponible">Disponible</option>
            <option value="Affecté">Affecté</option>
          </select>
        </motion.div>

        {/* Cards */}
        <motion.div variants={item} className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-16 text-slate-400 text-sm">Chargement des sujets...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-slate-400 text-sm">Aucun sujet trouvé.</div>
          ) : (
            filtered.map((topic) => (
              <motion.div
                key={topic.id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">{topic.title}</h3>
                    {getStatusBadge(topic.status)}
                  </div>

                  {topic.description && (
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] leading-relaxed mb-4 line-clamp-3">
                      {topic.description}
                    </p>
                  )}

                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {[
                      { icon: Code2, color: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400", text: topic.technologies || "Non spécifié" },
                      { icon: Clock3, color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", text: `Durée : ${topic.duree || "Non spécifiée"}` },
                      { icon: User, color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400", text: `Encadrant : ${topic.supervisor?.user?.name || "Tunisie Telecom"}` },
                    ].map(({ icon: Icon, color, text }) => (
                      <div key={text} className="flex gap-3 items-center">
                        <div className={`p-1.5 rounded-lg ${color} shrink-0`}><Icon size={13} className="stroke-[2.2]" /></div>
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold truncate">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isSupervisor && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setModal({ type: "edit", topic })}
                      className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 py-2.5 rounded-xl flex justify-center items-center gap-1.5 font-bold text-[10px] hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition cursor-pointer"
                    >
                      <Pencil size={12} className="stroke-[2.2]" />
                      Modifier
                    </button>
                    <button
                      onClick={() => setModal({ type: "delete", topic })}
                      className="flex-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 py-2.5 rounded-xl flex justify-center items-center gap-1.5 font-bold text-[10px] hover:bg-rose-100 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 size={12} className="stroke-[2.2]" />
                      Supprimer
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {(modal?.type === "add" || modal?.type === "edit") && (
          <TopicModal topic={modal.topic} onClose={() => setModal(null)} onSave={handleSave} />
        )}
        {modal?.type === "delete" && (
          <DeleteConfirmModal topic={modal.topic} onClose={() => setModal(null)} onConfirm={handleDelete} />
        )}
      </AnimatePresence>
    </MainLayout>
  );
}