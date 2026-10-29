import React, { useRef, useState } from 'react';
import { FaCloudUploadAlt, FaCar, FaBus, FaImage, FaSpinner } from 'react-icons/fa';

interface Props {
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
}

const UploadArea: React.FC<Props> = ({ onUpload, loading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const processFile = async (file: File) => {
    setError('');
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10 MB size limit.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    await onUpload(file);
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void processFile(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void processFile(e.dataTransfer.files[0]);
    }
  };

  const loadSample = async (samplePath: string, name: string) => {
    try {
      setError('');
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
      await processFile(file);
    } catch (err: any) {
      setError('Failed to load sample image: ' + err.message);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div
        className={`glass-panel rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01] shadow-[0_0_30px_rgba(6,182,212,0.3)]'
            : 'border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-900/50'
        }`}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-cyan-400">
                <FaCar className="text-xl animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-cyan-300 font-display">Analyzing Vehicle Scene...</p>
              <p className="text-xs text-slate-400">Running YOLO neural detection & classification</p>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block max-h-72 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
              <img src={previewUrl} alt="preview" className="max-h-72 w-auto object-contain mx-auto" />
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-md text-xs text-slate-300 border border-white/10 flex items-center gap-2">
                <FaImage className="text-cyan-400" />
                <span>{fileName} ({fileSize})</span>
              </div>
            </div>
            <p className="text-xs text-cyan-400 font-medium hover:underline">Click or drop another image to replace</p>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <FaCloudUploadAlt className="text-3xl" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-200">
                Drop your vehicle image here, or <span className="text-cyan-400 underline decoration-cyan-400/40">browse</span>
              </p>
              <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP (High resolution recommended, max 10MB)</p>
            </div>
          </div>
        )}

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          ref={fileInputRef}
          className="hidden"
          onChange={onSelect}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-sm flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick sample demo buttons */}
      <div className="glass-panel rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-2">
          <span>⚡ Try Instant Sample:</span>
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => loadSample('/samples/highway_traffic.jpg', 'highway_traffic.jpg')}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 font-medium flex items-center gap-2 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <FaCar />
            <span>Busy Highway Scene</span>
          </button>
          <button
            type="button"
            onClick={() => loadSample('/samples/traffic_sample.jpg', 'traffic_sample.jpg')}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-slate-200 font-medium flex items-center gap-2 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <FaBus />
            <span>Transit & Bus</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
