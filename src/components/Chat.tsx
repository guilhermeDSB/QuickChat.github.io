import { useState, useEffect, useRef, FormEvent } from 'react';
import { Send, User } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { motion } from 'motion/react';

interface ChatProps {
  socket: Socket | null;
  roomId: string;
  messages: any[];
}

export default function Chat({ socket, roomId, messages }: ChatProps) {
  const [input, setInput] = useState('');
  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem('quickshare_username');
    return saved || `Usuário_${Math.floor(Math.random() * 1000)}`;
  });
  const [isEditingUsername, setIsEditingUsername] = useState(!localStorage.getItem('quickshare_username'));
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('user_typing', (data) => {
      setTypingUser(data.username);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
    });

    return () => {
      socket.off('user_typing');
    };
  }, [socket]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.emit('send_message', {
      room_id: roomId,
      sender: username,
      content: input.trim()
    });

    setInput('');
  };

  const handleTyping = () => {
    if (!socket) return;
    socket.emit('typing', { room_id: roomId, username });
  };

  const saveUsername = () => {
    if (username.trim()) {
      localStorage.setItem('quickshare_username', username.trim());
      setIsEditingUsername(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Username Header */}
      <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
        {isEditingUsername ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu nome..."
              className="flex-1 px-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              onKeyDown={(e) => e.key === 'Enter' && saveUsername()}
            />
            <button
              onClick={saveUsername}
              className="px-3 py-1.5 text-sm bg-zinc-900 text-white rounded-lg font-medium"
            >
              Salvar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-600" />
              </div>
              <span className="text-sm font-semibold text-zinc-700">{username}</span>
            </div>
            <button
              onClick={() => setIsEditingUsername(true)}
              className="text-xs text-zinc-400 hover:text-zinc-900"
            >
              Alterar
            </button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.sender === username;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id || idx}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {!isMe && (
                <span className="text-[10px] font-bold text-zinc-400 mb-1 ml-1 uppercase tracking-wider">
                  {msg.sender}
                </span>
              )}
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-zinc-900 text-white rounded-tr-none'
                    : 'bg-zinc-100 text-zinc-800 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          );
        })}
        {typingUser && (
          <div className="text-[10px] italic text-zinc-400 animate-pulse">
            {typingUser} está digitando...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t border-zinc-100">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            placeholder="Digite uma mensagem..."
            className="w-full pl-4 pr-12 py-3 bg-zinc-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
