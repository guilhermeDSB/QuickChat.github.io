import { Download, File, FileImage, FileVideo, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileListProps {
  files: any[];
}

export default function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-zinc-200 rounded-2xl">
        <File className="w-12 h-12 text-zinc-200 mb-4" />
        <p className="text-zinc-400 text-sm">Nenhum arquivo enviado ainda.</p>
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <FileImage className="w-6 h-6 text-blue-500" />;
    if (mimetype.startsWith('video/')) return <FileVideo className="w-6 h-6 text-purple-500" />;
    if (mimetype.includes('pdf') || mimetype.includes('text')) return <FileText className="w-6 h-6 text-orange-500" />;
    return <File className="w-6 h-6 text-zinc-400" />;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {files.map((file) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key={file.id}
            className="group relative bg-white border border-zinc-200 rounded-2xl p-4 hover:border-zinc-900 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-50 rounded-xl group-hover:bg-zinc-100 transition-colors">
                {getFileIcon(file.mimetype)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-zinc-900 truncate mb-1" title={file.original_name}>
                  {file.original_name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                  <span>{formatSize(file.size)}</span>
                  <span>•</span>
                  <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <a
                href={`/api/files/${file.id}/download`}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-900 hover:text-white transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
              
              <button className="p-1.5 text-zinc-300 hover:text-zinc-600 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
