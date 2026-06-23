import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getRole } from "../services/auth";
import { getNotifications, markNotificationRead, deleteNotification } from "../services/backend";
import { LogOut, Bell, Search, Sun, Moon, X, CheckCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();
  const role = getRole();
  const { dark, toggleDark } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const name = localStorage.getItem("name") || "Utilisateur";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  // Fetch real notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data.map((n) => ({
        id: n.id,
        text: n.message || n.title || "Notification",
        time: n.created_at ? formatTime(n.created_at) : "",
        read: !!n.is_read,
        type: n.type || "info",
      })));
    } catch {
      // Silently fail – show empty notifications
    }
  };

  // Format relative time
  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => { logout(); navigate("/"); };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    try {
      await Promise.all(unread.map((n) => markNotificationRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Optimistic update even on failure
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const removeNotif = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotification(id);
    } catch {
      // Already removed from UI
    }
  };

  useEffect(() => {
    function handle(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const typeIcon = (type) => {
    if (type === "success") return "✅";
    if (type === "warning") return "⚠️";
    if (type === "task") return "📋";
    return "💬";
  };

  return (
    <header className="bg-white dark:bg-[#0d1117] border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 z-20 sticky top-0 transition-colors duration-300">
      {/* Left */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-500/20 flex-shrink-0">
          {role || "guest"}
        </span>
        <div className="relative w-full hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-400 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Dark mode toggle */}
        <button
          id="theme-toggle"
          onClick={toggleDark}
          title={dark ? "Mode clair" : "Mode sombre"}
          className="relative w-14 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 transition-all duration-300 cursor-pointer flex-shrink-0 group overflow-hidden"
          aria-label="Toggle dark mode"
        >
          {/* Track */}
          <div className={`absolute inset-0.5 rounded-full transition-all duration-300 ${dark ? "bg-indigo-950/60" : "bg-slate-100"}`} />
          {/* Thumb */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className={`absolute top-1 w-5 h-5 rounded-full shadow-sm flex items-center justify-center z-10 ${
              dark ? "bg-indigo-500 right-1" : "bg-white left-1"
            }`}
          >
            {dark
              ? <Moon size={11} className="text-white" />
              : <Sun size={11} className="text-amber-500" />
            }
          </motion.div>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications((v) => !v)}
            className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-red-500 rounded-full border border-white dark:border-[#0d1117]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="absolute right-0 top-12 w-80 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead}
                      className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer">
                      <CheckCheck size={12} /> Tout lire
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-8">Aucune notification</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id}
                        className={`flex gap-3 px-3 py-3 items-start group/notif ${!n.read ? "bg-indigo-50/50 dark:bg-indigo-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}>
                        <span className="text-base shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug font-medium ${n.read ? "text-slate-500 dark:text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
                            {n.text}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                        <button onClick={() => removeNotif(n.id)}
                          className="opacity-0 group-hover/notif:opacity-100 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 cursor-pointer shrink-0 transition-opacity">
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* User + logout */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
            {initials}
          </div>
          <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{name}</span>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
            title="Déconnexion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}