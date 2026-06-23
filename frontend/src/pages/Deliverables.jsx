import { useState, useEffect, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { getRole } from "../services/auth";
import {
  getDeliverables,
  uploadDeliverable,
  downloadDeliverable,
  deleteDeliverable,
  validateDeliverable,
  rejectDeliverable,
  getInternships,
} from "../services/backend";
import StatCard from "../components/StatCard";
import {
  Upload, CheckCircle, Clock, XCircle, FileText, Download, Trash2, Eye, X, Check, AlertTriangle
} from "lucide-react";

const getStatusStyle = (status) => {
  const formatted = (status || "").toLowerCase();
  switch (formatted) {
    case "validé":
    case "valide":
      return "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100/60";
    case "en attente":
    case "déposé":
    case "depose":
    case "soumis":
      return "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100/60";
    case "refusé":
    case "refuse":
      return "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100/60";
    default:
      return "bg-slate-50 text-slate-600 border border-slate-100";
  }
};

const getStatusText = (status) => {
  const formatted = (status || "").toLowerCase();
  if (formatted === "validé" || formatted === "valide") return "Validé";
  if (formatted === "refusé" || formatted === "refuse") return "Refusé";
  return "En attente";
};

export default function Deliverables() {
  const { addToast } = useToast();
  const role = getRole();
  const isStudent = role === "student";
  const isSupervisor = role === "supervisor";

  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileRef = useRef(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchAllDeliverables = async () => {
    try {
      setLoading(true);
      const res = await getDeliverables();
      setDeliverables(res.data);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du chargement des livrables.", "error");
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
    fetchAllDeliverables();
    if (!isStudent) {
      fetchInternshipsList();
    }
  }, []);

  const handleUploadButtonClick = () => {
    if (isStudent) {
      fileRef.current?.click();
    } else {
      setIsUploadModalOpen(true);
    }
  };

  const handleStudentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      addToast("Seuls les fichiers PDF sont acceptés.", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(".pdf", ""));
      formData.append("type", "PDF");

      await uploadDeliverable(formData);
      addToast(`"${file.name}" déposé avec succès ✓`);
      fetchAllDeliverables();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du dépôt du fichier.", "error");
    } finally {
      e.target.value = "";
    }
  };

  const handleModalUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      addToast("Veuillez sélectionner un fichier.", "error");
      return;
    }
    if (!selectedInternshipId) {
      addToast("Veuillez sélectionner un stage.", "error");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadFile.name.replace(".pdf", ""));
      formData.append("type", "PDF");
      formData.append("internship_id", selectedInternshipId);

      await uploadDeliverable(formData);
      addToast(`"${uploadFile.name}" déposé avec succès ✓`);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setSelectedInternshipId("");
      fetchAllDeliverables();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du dépôt du fichier.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (item) => {
    try {
      addToast(`Téléchargement de "${item.title}" démarré...`);
      const res = await downloadDeliverable(item.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du téléchargement du fichier.", "error");
    }
  };

  const handlePreview = async (item) => {
    setPreviewTarget(item);
    setPreviewLoading(true);
    setPreviewUrl(null);
    try {
      const res = await downloadDeliverable(item.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
      addToast("Impossible de charger l'aperçu PDF.", "error");
      setPreviewTarget(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewTarget(null);
    setPreviewUrl(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDeliverable(deleteTarget.id);
      addToast(`"${deleteTarget.title}" supprimé`, "error");
      setDeleteTarget(null);
      fetchAllDeliverables();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la suppression.", "error");
    }
  };

  const handleValidate = async (id) => {
    try {
      await validateDeliverable(id);
      addToast("Livrable validé avec succès ✓");
      fetchAllDeliverables();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors de la validation.", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectDeliverable(id);
      addToast("Livrable refusé", "error");
      fetchAllDeliverables();
    } catch (err) {
      console.error(err);
      addToast("Erreur lors du refus.", "error");
    }
  };

  const validated = deliverables.filter((d) => getStatusText(d.status) === "Validé").length;
  const pending = deliverables.filter((d) => getStatusText(d.status) === "En attente").length;
  const refused = deliverables.filter((d) => getStatusText(d.status) === "Refusé").length;

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } } };

  return (
    <MainLayout>
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-8 pb-12">
        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Gestion des Livrables</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Dépôt, validation et téléchargement des rapports de stage.</p>
          </div>
          <button
            onClick={handleUploadButtonClick}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-0.5 shrink-0 w-fit cursor-pointer"
            id="upload-pdf-btn"
          >
            <Upload size={15} />
            <span>Déposer un PDF</span>
          </button>
          {isStudent && (
            <input type="file" accept=".pdf" className="hidden" ref={fileRef} onChange={handleStudentUpload} />
          )}
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard title="Livrables Validés" value={validated} icon={CheckCircle} color="bg-green-100 text-green-600" trend="Archivé" />
          <StatCard title="En attente de validation" value={pending} icon={Clock} color="bg-orange-100 text-orange-500" trend="À valider" />
          <StatCard title="Refusés (à réviser)" value={refused} icon={XCircle} color="bg-red-100 text-red-600" trend="Action requise" />
        </motion.div>

        {/* Table */}
        <motion.div variants={item} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Liste des livrables</h2>
            <p className="text-xs text-slate-400 mt-1">Suivi et validation en temps réel des rapports et livrables de stage.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-semibold uppercase tracking-wider">
                  <th className="p-4">Titre</th>
                  {!isStudent && <th className="p-4">Étudiant</th>}
                  <th className="p-4">Type</th>
                  <th className="p-4">Date de dépôt</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={isStudent ? 5 : 6} className="p-10 text-center text-slate-400 dark:text-slate-600">
                      Chargement des livrables...
                    </td>
                  </tr>
                ) : deliverables.length === 0 ? (
                  <tr>
                    <td colSpan={isStudent ? 5 : 6} className="p-10 text-center text-slate-400 dark:text-slate-600">
                      Aucun livrable. {isStudent && "Déposez votre premier PDF."}
                    </td>
                  </tr>
                ) : (
                  deliverables.map((d, idx) => (
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            <FileText size={14} className="stroke-[2.2]" />
                          </div>
                          <span>{d.title}</span>
                        </div>
                      </td>
                      {!isStudent && (
                        <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">
                          {d.internship?.student?.user?.name || "Stagiaire"}
                        </td>
                      )}
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">{d.type || "PDF"}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">
                        {d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusStyle(d.status)}`}>
                          {getStatusText(d.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handlePreview(d)}
                            title="Prévisualiser"
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                          >
                            <Eye size={14} className="stroke-[2.2]" />
                          </button>
                          <button
                            onClick={() => handleDownload(d)}
                            title="Télécharger"
                            className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer"
                          >
                            <Download size={14} className="stroke-[2.2]" />
                          </button>
                          {isSupervisor && getStatusText(d.status) === "En attente" && (
                            <>
                              <button
                                onClick={() => handleValidate(d.id)}
                                title="Valider"
                                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition cursor-pointer"
                              >
                                <Check size={14} className="stroke-[2.2]" />
                              </button>
                              <button
                                onClick={() => handleReject(d.id)}
                                title="Refuser"
                                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition cursor-pointer"
                              >
                                <X size={14} className="stroke-[2.2]" />
                              </button>
                            </>
                          )}
                          {(isStudent || role === "admin") && (
                            <button
                              onClick={() => setDeleteTarget(d)}
                              title="Supprimer"
                              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition cursor-pointer"
                            >
                              <Trash2 size={14} className="stroke-[2.2]" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {previewTarget && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: "90vh" }}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{previewTarget.title}</h3>
                <button onClick={closePreview} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              {previewLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 text-xs">
                  Chargement de l'aperçu PDF...
                </div>
              ) : previewUrl ? (
                <iframe
                  src={previewUrl}
                  title="PDF Preview"
                  className="flex-1 w-full bg-slate-100 dark:bg-slate-950"
                  style={{ minHeight: "70vh" }}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-rose-500 text-xs gap-2">
                  <AlertTriangle size={24} />
                  <span>Impossible de charger le fichier PDF.</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
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
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">Supprimer ce livrable?</h3>
                <p className="text-slate-400 text-xs">«{deleteTarget.title}» sera définitivement supprimé.</p>
              </div>
              <div className="flex gap-3 p-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-300">
                  Annuler
                </button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer">
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin/Supervisor Upload PDF Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Déposer un document PDF
                </h2>
                <button 
                  onClick={() => setIsUploadModalOpen(false)} 
                  className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleModalUpload} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Sélectionner le Stage *
                  </label>
                  <select
                    value={selectedInternshipId}
                    onChange={(e) => setSelectedInternshipId(e.target.value)}
                    required
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="">-- Choisir un stagiaire / sujet --</option>
                    {internships.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.student?.user?.name || "Stagiaire"} - {i.topic?.title || "Sujet"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Fichier PDF *
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsUploadModalOpen(false)} 
                    className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-slate-600 dark:text-slate-300"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={uploading}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={13} />
                        <span>Téléversement...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        <span>Déposer</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}