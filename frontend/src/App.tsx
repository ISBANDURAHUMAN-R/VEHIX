import React, { useState, useEffect } from 'react';
import UploadArea from './components/UploadArea';
import ResultDashboard from './components/ResultDashboard';
import AnnotatedImage from './components/AnnotatedImage';
import { FaCar, FaServer, FaCheckCircle, FaExclamationTriangle, FaCode, FaGithub } from 'react-icons/fa';

interface DetectionItem {
  class: string;
  confidence: number;
  bbox: number[]; // [x1, y1, x2, y2]
}

interface DetectionResult {
  total_vehicles: number;
  counts: Record<string, number>;
  detections: DetectionItem[];
  result_image: string;
}

const App: React.FC = () => {
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Check backend health on mount and periodically
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('disconnected');
      }
    } catch {
      setBackendStatus('disconnected');
    }
  };

  useEffect(() => {
    void checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Upload and analysis failed' }));
        throw new Error(err.detail || 'Upload failed');
      }

      const data: DetectionResult = await response.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Error communicating with detection server');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col tech-grid relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/20">
              <FaCar className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl tracking-tight text-white">VEHIX</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase">
                  v1.0 AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Vehicle Detection & Traffic Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Backend Connectivity Status Badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                backendStatus === 'connected'
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                  : backendStatus === 'checking'
                  ? 'bg-amber-950/50 text-amber-300 border-amber-500/30'
                  : 'bg-rose-950/50 text-rose-300 border-rose-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-400'
                }`}
              />
              <span className="flex items-center gap-1.5">
                <FaServer className="text-[10px]" />
                {backendStatus === 'connected'
                  ? 'Backend Connected'
                  : backendStatus === 'checking'
                  ? 'Connecting...'
                  : 'Backend Offline'}
              </span>
            </div>

            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-cyan-300 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
            >
              <FaCode />
              <span className="hidden md:inline">API Docs</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-1">
            <span>Powered by YOLO Neural Networks & FastAPI</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Intelligent Vehicle Detection
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Upload any road, traffic, or aerial photograph to detect cars, buses, trucks, motorcycles, and bicycles with precise bounding boxes and class distribution analytics.
          </p>
        </div>

        {/* Upload Zone */}
        <UploadArea onUpload={handleUpload} loading={loading} />

        {/* Error message */}
        {error && (
          <div className="w-full max-w-2xl mt-6 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-sm flex items-center gap-3">
            <FaExclamationTriangle className="text-red-400 text-lg flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-xs text-red-300 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-xs text-red-300 hover:text-white px-2 py-1 rounded bg-red-900/60"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="w-full mt-10 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                <h2 className="text-2xl font-bold font-display text-white">Detection & Traffic Intelligence</h2>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Clear Results
              </button>
            </div>

            <ResultDashboard result={result} />
            <AnnotatedImage imageUrl={result.result_image} detections={result.detections} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 VEHIX AI — Computer Vision Intelligence Platform</p>
          <div className="flex items-center gap-4">
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition">
              FastAPI Swagger
            </a>
            <span>•</span>
            <span className="text-slate-400">YOLOv8 Engine</span>
            <span>•</span>
            <span className="text-slate-400">React + Vite + Tailwind</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
