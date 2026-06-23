import { useState, useEffect, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import api from "../services/api";
import { getToken } from "../services/auth";
import { motion, AnimatePresence } from "framer-motion";

import {
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Bell,
  Loader2,
  MoreVertical,
  Plus,
  X,
} from "lucide-react";

export default function Messages() {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (getToken()) {
      fetchConversations();
      fetchUsersAndMe();
    }
  }, []);

  const fetchUsersAndMe = async () => {
    try {
      setFetchingUsers(true);
      const [usersRes, meRes] = await Promise.all([
        api.get("/users"),
        api.get("/user")
      ]);
      setAllUsers(usersRes.data);
      setCurrentUser(meRes.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs:", err);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleStartConversation = async (otherUser) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.other_user?.id === otherUser.id);
    if (existing) {
      selectConversation(existing);
      setIsNewChatModalOpen(false);
      return;
    }

    try {
      const res = await api.post("/conversations", {
        user_ids: [otherUser.id]
      });
      const newConvRaw = res.data;
      const formattedConv = {
        id: newConvRaw.id,
        name: otherUser.name,
        other_user: otherUser,
        last_message: null,
        created_at: newConvRaw.created_at
      };
      
      setConversations([formattedConv, ...conversations]);
      selectConversation(formattedConv);
      setIsNewChatModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get("/conversations");
      setConversations(res.data);
      if (res.data.length > 0) {
        selectConversation(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv) => {
    setCurrentConversation(conv);
    try {
      const res = await api.get(`/conversations/${conv.id}`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !currentConversation) return;
    setSending(true);
    try {
      const res = await api.post("/messages", {
        conversation_id: currentConversation.id,
        content: message
      });
      setMessages([...messages, res.data]);
      setMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
            <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Chargement...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-140px)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex h-full">
          {/* Sidebar Conversations */}
          <div className="w-80 border-r border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Messagerie</h1>
                <button 
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition cursor-pointer"
                  title="Nouvelle conversation"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-400 dark:text-slate-200"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
              <div className="px-5 py-3 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Conversations privées
              </div>

              <div className="space-y-1 px-2">
                {conversations.map((conv) => {
                  const isActive = currentConversation?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                        isActive 
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 shadow-sm" 
                          : "hover:bg-slate-100/60 dark:hover:bg-slate-800 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase border border-indigo-200/10">
                            {conv.name.charAt(0)}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${isActive ? "text-indigo-950 dark:text-indigo-200" : "text-slate-800 dark:text-slate-200"}`}>
                            {conv.name}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                            {conv.last_message?.content || "Pas de messages"}
                          </p>
                        </div>
                      </div>
                      <Bell size={12} className={`text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "text-indigo-500" : ""}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Zone Chat */}
          <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/40">
            {currentConversation ? (
              <>
                {/* Header Chat */}
                <div className="h-20 border-b border-slate-200/60 dark:border-slate-800 px-6 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                        {currentConversation.name.charAt(0)}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-none">{currentConversation.name}</h2>
                      <p className="text-[10px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>En ligne</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <Phone size={16} />
                    </button>
                    <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <Video size={16} />
                    </button>
                    <button className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-slate-900/30 scrollbar-thin">
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const isOther = msg.user_id === currentConversation.other_user?.id;
                      return (
                        <div
                          key={index}
                          className={`flex ${isOther ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-md px-4 py-2.5 rounded-2xl text-xs shadow-sm transition-all relative ${
                              isOther
                                ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60"
                                : "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none"
                            }`}
                          >
                            <p className="leading-relaxed break-words">{msg.content}</p>
                            <div
                              className={`text-[9px] mt-1.5 text-right font-medium ${
                                isOther ? "text-slate-400 dark:text-slate-500" : "text-indigo-100/80"
                              }`}
                            >
                              {formatTime(msg.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Zone Saisie */}
                <div className="p-4 border-t border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                      <Paperclip size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                      <Smile size={18} />
                    </button>
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Écrire un message..."
                      className="flex-1 text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all placeholder-slate-400 dark:text-slate-200"
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !message.trim()}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-3 rounded-xl hover:shadow-[0_4px_10px_rgba(79,70,229,0.3)] transition duration-200 disabled:opacity-50 disabled:shadow-none cursor-pointer flex-shrink-0"
                    >
                      {sending ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400/80 dark:text-slate-500">
                <svg className="w-16 h-16 text-slate-300 dark:text-slate-700 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                </svg>
                <p className="text-xs font-bold mt-4 tracking-tight">Sélectionnez une conversation</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Choisissez une personne pour démarrer le chat en direct.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: "80vh" }}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Nouvelle conversation
                </h2>
                <button 
                  onClick={() => setIsNewChatModalOpen(false)} 
                  className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    placeholder="Rechercher un utilisateur..."
                    className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-400 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {fetchingUsers ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-indigo-600" size={20} />
                  </div>
                ) : (
                  allUsers
                    .filter(u => u.id !== currentUser?.id)
                    .filter(u => {
                      const query = searchUserQuery.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(query) ||
                        u.email.toLowerCase().includes(query) ||
                        u.role.toLowerCase().includes(query)
                      );
                    })
                    .map(u => (
                      <div
                        key={u.id}
                        onClick={() => handleStartConversation(u)}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700/60 cursor-pointer transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-850 dark:text-slate-100">{u.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{u.email}</p>
                          </div>
                        </div>
                        <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
                          {u.role}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}