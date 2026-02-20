import { useState, useRef, DragEvent } from 'react';
import { Upload as UploadIcon, X, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  roomId: string;
}

export default function FileUpload({ roomId }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 100 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 100MB.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/rooms/${roomId}/upload`, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploading(false);
          setProgress(0);
        } else {
          setError('Falha no upload. Tente novamente.');
          setUploading(false);
        }
      };

      xhr.onerror = () => {
        setError('Erro de conexão.');
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="relative">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all duration-300
          ${isDragging ? 'border-zinc-900 bg-zinc-100' : 'border-zinc-200 bg-white hover:border-zinc-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-600'}`}>
            <UploadIcon className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-zinc-900 mb-1">
            {isDragging ? 'Solte para enviar' : 'Clique ou arraste arquivos'}
          </h4>
          <p className="text-sm text-zinc-400">Máximo 100MB por arquivo</p>
        </div>

        {/* Progress Overlay */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center p-6 z-10"
            >
              <div className="w-full max-w-xs">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-zinc-900">Enviando...</span>
                  <span className="text-sm font-bold text-zinc-900">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-zinc-900"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1">{error}</p>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
