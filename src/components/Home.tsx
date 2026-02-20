import { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, Plus, ArrowRight } from 'lucide-react';

interface HomeProps {
  onRoomCreated: (roomId: string) => void;
}

export default function Home({ onRoomCreated }: HomeProps) {
  const [isCreating, setIsCreating] = useState(false);

  const createRoom = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/rooms', { method: 'POST' });
      const data = await response.json();
      if (data.roomId) {
        onRoomCreated(data.roomId);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-zinc-900 rounded-2xl shadow-xl">
            <Share2 className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-zinc-900">
          QuickShare & Chat
        </h1>
        
        <p className="text-xl text-zinc-600 mb-12 leading-relaxed">
          Compartilhe arquivos e converse em tempo real. 
          Sem cadastro, sem complicações. Crie uma sala temporária e compartilhe o link.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={createRoom}
            disabled={isCreating}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isCreating ? (
              "Criando..."
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Criar Nova Sala
              </>
            )}
          </button>
          
          <div className="relative group">
            <input
              type="text"
              placeholder="Ou cole um ID de sala..."
              className="w-full sm:w-64 px-6 py-4 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) onRoomCreated(val);
                }
              }}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <FeatureCard 
            title="Instantâneo"
            description="Crie uma sala em segundos e comece a compartilhar imediatamente."
          />
          <FeatureCard 
            title="Colaborativo"
            description="Chat integrado para discutir arquivos enquanto eles são enviados."
          />
          <FeatureCard 
            title="Privado"
            description="Salas com IDs únicos e difíceis de adivinhar. Seus dados, seu controle."
          />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm">
      <h3 className="font-bold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
