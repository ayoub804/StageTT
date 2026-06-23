import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { getRole } from "../services/auth";
import {
  getTasks, createTask, updateTask, updateTaskStatus, deleteTask, getInternships
} from "../services/backend";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Calendar, Flag, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";

const EMPTY_TASK = { title: "", priority: "Moyenne", deadline: "", internship_id: "" };

const mapToBackendStatus = (status) => {
  if (status === "todo") return "À faire";
  if (status === "doing") return "En cours";
  if (status === "done") return "Terminé";
  return status;
};

const mapToFrontendStatus = (status) => {
  if (status === "À faire") return "todo";
  if (status === "En cours") return "doing";
  if (status === "Terminé") return "done";
  return status;
};

function TaskModal({ task, columnId, onClose, onSave, isStudent, internships }) {
  const [form, setForm] = useState(task ? {
    title: task.title || "",
    priority: task.priority || "Moyenne",
    deadline: task.deadline || "",
    internship_id: task.internship_id || ""
  } : { ...EMPTY_TASK, internship_id: "" });
  const [targetCol, setTargetCol] = useState(columnId || "todo");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!isStudent && !task && !form.internship_id) return;
    onSave({ form, targetCol });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {task ? "Modifier la tâche" : "Nouvelle tâche"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isStudent && !task && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Stage / Stagiaire *
              </label>
              <select
                value={form.internship_id}
                onChange={(e) => setForm((f) => ({ ...f, internship_id: e.target.value }))}
                required
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">-- Choisir un stage --</option>
                {internships.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.student?.user?.name || "Stagiaire"} - {i.topic?.title || "Sujet"}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Titre de la tâche *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Décrivez la tâche..."
              required
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Priorité</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="Haute">Haute</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Basse">Basse</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Colonne</label>
              <select
                value={targetCol}
                onChange={(e) => setTargetCol(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="todo">À faire</option>
                <option value="doing">En cours</option>
                <option value="done">Terminé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Date limite</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-300">
              Annuler
            </button>
            <button type="submit" className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5">
              <Check size={13} />
              {task ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Tasks() {
  const { addToast } = useToast();
  const role = getRole();
  const isStudent = role === "student";

  const [columns, setColumns] = useState({
    todo: { name: "À faire", items: [] },
    doing: { name: "En cours", items: [] },
    done: { name: "Terminé", items: [] }
  });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { type: 'add' } | { type: 'edit', task, columnId } | { type: 'delete', task, columnId }
  const [internships, setInternships] = useState([]);

  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks();
      const rawTasks = res.data;

      const todoItems = rawTasks.filter(t => mapToFrontendStatus(t.status) === "todo");
      const doingItems = rawTasks.filter(t => mapToFrontendStatus(t.status) === "doing");
      const doneItems = rawTasks.filter(t => mapToFrontendStatus(t.status) === "done");

      setColumns({
        todo: { name: "À faire", items: todoItems },
        doing: { name: "En cours", items: doingItems },
        done: { name: "Terminé", items: doneItems }
      });
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement des tâches.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchInternshipsList = async () => {
    try {
      const res = await getInternships();
      setInternships(res.data);
    } catch (err) {
      console.error("Erreur chargement stages:", err);
    }
  };

  useEffect(() => {
    fetchAllTasks();
    if (!isStudent) {
      fetchInternshipsList();
    }
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    // Fast local update
    const srcCol = columns[source.droppableId];
    const dstCol = columns[destination.droppableId];
    const srcItems = [...srcCol.items];
    const dstItems = source.droppableId === destination.droppableId ? srcItems : [...dstCol.items];
    const [moved] = srcItems.splice(source.index, 1);
    dstItems.splice(destination.index, 0, moved);

    setColumns((prev) => ({
      ...prev,
      [source.droppableId]: { ...srcCol, items: srcItems },
      [destination.droppableId]: { ...dstCol, items: dstItems },
    }));

    // Call API to sync status
    if (source.droppableId !== destination.droppableId) {
      try {
        const backendStatus = mapToBackendStatus(destination.droppableId);
        await updateTaskStatus(moved.id, backendStatus);
        addToast(`Tâche déplacée dans "${dstCol.name}" ✓`);
      } catch (err) {
        console.error(err);
        addToast("Erreur lors de la mise à jour de la tâche.", "error");
        // Revert by fetching again
        fetchAllTasks();
      }
    }
  };

  const handleSave = async ({ form, targetCol }) => {
    try {
      const backendStatus = mapToBackendStatus(targetCol);
      if (modal.type === "edit") {
        await updateTask(modal.task.id, {
          title: form.title,
          priority: form.priority,
          deadline: form.deadline,
          status: backendStatus
        });
        addToast("Tâche modifiée ✓");
      } else {
        await createTask({
          title: form.title,
          priority: form.priority,
          deadline: form.deadline,
          status: backendStatus,
          internship_id: form.internship_id
        });
        addToast("Tâche créée ✓");
      }
      setModal(null);
      fetchAllTasks();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de l'enregistrement de la tâche.", "error");
    }
  };

  const handleDelete = async () => {
    try {
      const { task } = modal;
      await deleteTask(task.id);
      addToast("Tâche supprimée", "error");
      setModal(null);
      fetchAllTasks();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la suppression.", "error");
    }
  };

  const getPriorityStyle = (p) => {
    const priority = (p || "").toLowerCase();
    if (priority === "haute" || priority === "high") return "text-rose-700 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100/60";
    if (priority === "moyenne" || priority === "medium") return "text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100/60";
    return "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/60";
  };

  const colIndicator = (id) => {
    if (id === "todo") return "bg-indigo-500";
    if (id === "doing") return "bg-amber-500";
    return "bg-emerald-500";
  };

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } };

  return (
    <MainLayout>
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Tableau Kanban</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Gérez vos tâches de stage — glissez les cartes d'une colonne à l'autre.</p>
          </div>
          <button
            id="add-task-btn"
            onClick={() => setModal({ type: "add" })}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all cursor-pointer hover:-translate-y-0.5 shrink-0"
          >
            <Plus size={15} />
            <span>Nouvelle Tâche</span>
          </button>
        </motion.div>

        {/* Kanban */}
        <motion.div variants={item}>
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm">Chargement du tableau Kanban...</div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid lg:grid-cols-3 gap-6 items-start">
                {Object.entries(columns).map(([columnId, column]) => (
                  <div key={columnId} className="bg-slate-50/80 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/60 rounded-3xl p-5 flex flex-col min-h-[480px]">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colIndicator(columnId)}`} />
                        <h2 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight text-sm uppercase">{column.name}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {column.items.length}
                        </span>
                        <button
                          onClick={() => setModal({ type: "add", defaultCol: columnId })}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                          title="Ajouter dans cette colonne"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <Droppable droppableId={columnId} isDropDisabled={false}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-4 flex-1 overflow-y-auto max-h-[520px] pr-1"
                        >
                          {column.items.map((task, index) => (
                            <Draggable key={task.id} draggableId={String(task.id)} index={index} isDragDisabled={false}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm ${
                                    snapshot.isDragging
                                      ? "shadow-xl border-indigo-200 ring-2 ring-indigo-500/10"
                                      : "hover:border-slate-300 dark:hover:border-slate-600"
                                  } transition-all duration-200 cursor-grab active:cursor-grabbing`}
                                >
                                  <div className="flex justify-between items-start mb-3 gap-2">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-xs leading-snug">{task.title}</h3>
                                    {true && (
                                      <div className="flex gap-1.5 shrink-0">
                                        <button
                                          onClick={() => setModal({ type: "edit", task, columnId })}
                                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                                        >
                                          <Pencil size={12} />
                                        </button>
                                        <button
                                          onClick={() => setModal({ type: "delete", task, columnId })}
                                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${getPriorityStyle(task.priority)}`}>
                                      <Flag size={10} className="stroke-[2.5]" />
                                      {task.priority}
                                    </span>
                                    {task.deadline && (
                                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                                        <Calendar size={11} />
                                        {task.deadline}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {(modal?.type === "add" || modal?.type === "edit") && (
          <TaskModal
            task={modal.task}
            columnId={modal.defaultCol || modal.columnId || "todo"}
            onClose={() => setModal(null)}
            onSave={handleSave}
            isStudent={isStudent}
            internships={internships}
          />
        )}
        {modal?.type === "delete" && (
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
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">Supprimer la tâche?</h3>
                <p className="text-slate-400 text-xs">«{modal.task.title}» sera définitivement supprimée.</p>
              </div>
              <div className="flex gap-3 p-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-300">
                  Annuler
                </button>
                <button onClick={handleDelete} className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer">
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}