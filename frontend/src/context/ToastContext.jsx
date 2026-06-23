import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold pointer-events-auto border ${
                t.type === "success"
                  ? "bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400"
                  : t.type === "error"
                  ? "bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-400"
                  : "bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400"
              }`}
            >
              {t.type === "success" ? (
                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
              ) : t.type === "error" ? (
                <XCircle size={16} className="text-rose-500 shrink-0" />
              ) : (
                <Info size={16} className="text-indigo-500 shrink-0" />
              )}
              <span className="max-w-xs">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="ml-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
