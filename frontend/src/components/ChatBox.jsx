import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Smile, MoreHorizontal } from "lucide-react";

export default function ChatBox({
  messages = [],
  onSend,
}) {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;

    onSend?.({
      id: Date.now(),
      sender: "Moi",
      content: text,
      time: new Date().toLocaleTimeString().slice(0, 5),
    });

    setText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col h-[520px] overflow-hidden"
    >
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs uppercase tracking-wide border border-white/10">
              TT
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight">
              Espace Messagerie
            </h2>
            <p className="text-[10px] text-slate-300">StageTT Support & Equipe</p>
          </div>
        </div>
        <button className="text-slate-300 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquarePattern />
            <p className="text-xs font-semibold mt-3">Aucun message pour le moment</p>
            <p className="text-[11px] mt-1 text-slate-400/80">Commencez la discussion ci-dessous</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === "Moi";
            return (
              <div
                key={msg.id || index}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-xs shadow-sm transition-all relative ${
                    isMe
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none"
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-200/60"
                  }`}
                >
                  {!isMe && (
                    <p className="font-bold text-[10px] text-indigo-600 mb-1">
                      {msg.sender}
                    </p>
                  )}
                  
                  <p className="leading-relaxed break-words">{msg.content}</p>

                  <p className={`text-[9px] mt-1 opacity-70 text-right ${isMe ? "text-indigo-100" : "text-slate-400"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white">
        {/* upload */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
          <Paperclip size={18} />
        </button>

        {/* emoji */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
          <Smile size={18} />
        </button>

        {/* input */}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        {/* send */}
        <button
          onClick={handleSend}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-2.5 rounded-xl hover:shadow-[0_4px_10px_rgba(79,70,229,0.3)] transition duration-200 cursor-pointer flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}

// Icon decoration for empty state
function MessageSquarePattern() {
  return (
    <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
    </svg>
  );
}