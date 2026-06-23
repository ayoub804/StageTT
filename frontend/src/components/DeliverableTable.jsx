import { motion } from "framer-motion";
import { Download, Trash2, FileText } from "lucide-react";

export default function DeliverableTable({
  data = [],
  onDownload,
  onDelete,
}) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Validé":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100/60";
      case "En attente":
        return "bg-amber-50 text-amber-700 border border-amber-100/60";
      case "Refusé":
        return "bg-rose-50 text-rose-700 border border-rose-100/60";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]"
    >
      {/* HEADER */}
      <div className="p-6 border-b border-slate-100 bg-white">
        <h2 className="text-base font-bold text-slate-800 tracking-tight">
          Gestion des Livrables
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Suivi et validation en temps réel des rapports et livrables de stage.
        </p>
      </div>

      {/* TABLE CONTAINER */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50/70 text-left text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider">
              <th className="p-4 font-bold">Titre</th>
              <th className="p-4 font-bold">Type</th>
              <th className="p-4 font-bold">Date de dépôt</th>
              <th className="p-4 font-bold">Statut</th>
              <th className="p-4 font-bold">Commentaire</th>
              <th className="p-4 font-bold text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                  Aucun livrable disponible
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <motion.tr
                  key={item.id || index}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors duration-150"
                >
                  {/* Titre */}
                  <td className="p-4 font-semibold text-slate-800 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <FileText size={14} className="stroke-[2.2]" />
                    </div>
                    <span>{item.title}</span>
                  </td>

                  {/* Type */}
                  <td className="p-4 text-slate-500 font-medium">
                    {item.type}
                  </td>

                  {/* Date */}
                  <td className="p-4 text-slate-500 font-medium">
                    {item.date}
                  </td>

                  {/* Statut */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xxs font-semibold border ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Commentaire */}
                  <td className="p-4 text-slate-400 font-medium max-w-xs truncate" title={item.comment}>
                    {item.comment || "-"}
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onDownload?.(item)}
                        className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                        title="Télécharger"
                      >
                        <Download size={14} className="stroke-[2.2]" />
                      </button>

                      <button
                        onClick={() => onDelete?.(item)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 size={14} className="stroke-[2.2]" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}