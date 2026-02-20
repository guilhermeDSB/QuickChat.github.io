import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  MessageSquare, 
  Share2, 
  LogOut, 
  Download, 
  Upload as UploadIcon,
  Copy,
  Check,
  X
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import Chat from './Chat';
import FileList from './FileList';
import FileUpload from './FileUpload';

interface RoomProps {
  roomId: string;
  onExit: () => void;
}

export default function Room({ roomId, onExit }: RoomProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if room exists
    fetch(`/api/rooms/${roomId}`)
      .then(res => {
        if (res.ok) {
          setRoomExists(true);
        } else {
          setRoomExists(false);
        }
      })
      .catch(() => setRoomExists(false));

    // Initialize socket
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('join_room', roomId);

    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('file_uploaded', (file) => {
      setFiles(prev => [file, ...prev]);
    });

    // Fetch initial data
    fetch(`/api/rooms/${roomId}/files`)
      .then(res => res.json())
      .then(data => setFiles(data));

    fetch(`/api/rooms/${roomId}/messages`)
      .then(res => res.json())
      .then(data => setMessages(data));

    return () => {
      newSocket.close();
    };
  }, [roomId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (roomExists === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Sala não encontrada</h1>
        <p className="text-zinc-500 mb-8">Esta sala pode ter expirado ou o link está incorreto.</p>
        <button
          onClick={onExit}
          className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-semibold"
        >
          Voltar para o Início
        </button>
      </div>
    );
  }

  if (roomExists === null) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-bottom border-zinc-200 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-zinc-900 rounded-lg">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900 leading-none">QuickShare</h2>
            <p className="text-xs text-zinc-500 mt-1">Sala: {roomId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar Link'}
          </button>
          
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-lg transition-colors md:hidden ${isChatOpen ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={onExit}
            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
            title="Sair da sala"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Files Section */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isChatOpen ? 'md:mr-0' : ''}`}>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <section>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Upload de Arquivos</h3>
              <FileUpload roomId={roomId} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Arquivos na Sala</h3>
                <span className="text-xs font-medium px-2 py-1 bg-zinc-100 text-zinc-600 rounded-full">
                  {files.length} {files.length === 1 ? 'arquivo' : 'arquivos'}
                </span>
              </div>
              <FileList files={files} />
            </section>
          </div>
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full md:relative md:w-96 bg-white border-l border-zinc-200 flex flex-col z-20 shadow-2xl md:shadow-none"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-100 md:hidden">
                <h3 className="font-bold">Chat da Sala</h3>
                <button onClick={() => setIsChatOpen(false)} className="p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <Chat socket={socket} roomId={roomId} messages={messages} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Desktop Chat Toggle Button (when closed) */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="hidden md:flex absolute right-6 bottom-6 p-4 bg-zinc-900 text-white rounded-full shadow-xl hover:scale-110 transition-transform z-30"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </main>
    </div>
  );
}
