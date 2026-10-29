import React, { useState } from 'react';
import { FaDownload, FaExpand, FaCompress, FaCheck, FaCar } from 'react-icons/fa';

interface DetectionItem {
  class: string;
  confidence: number;
  bbox: number[];
}

interface Props {
  imageUrl: string;
  detections?: DetectionItem[];
}

const AnnotatedImage: React.FC<Props> = ({ imageUrl, detections = [] }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetectionsTable, setShowDetectionsTable] = useState(false);

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Annotated Detection Output</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">YOLO bounding boxes and confidence scores mapped onto image</p>
        </div>

        <div className="flex items-center gap-3">
          {detections.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDetectionsTable(!showDetectionsTable)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              {showDetectionsTable ? 'Hide Detections Table' : `View All Detections (${detections.length})`}
            </button>
          )}

          <a
            href={imageUrl}
            download="vehix_annotated_result.jpg"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <FaDownload />
            <span>Download Result</span>
          </a>
        </div>
      </div>

      {/* Main Image Viewer */}
      <div className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[300px]">
        <img
          src={imageUrl}
          alt="Annotated vehicle detection result"
          className={`w-auto max-h-[600px] object-contain transition-all duration-300 ${
            isFullscreen ? 'fixed inset-0 z-50 max-h-screen max-w-screen m-auto p-4 bg-slate-950/95 backdrop-blur-xl' : ''
          }`}
        />

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition z-10"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      </div>

      {/* Optional Detailed Detections Table */}
      {showDetectionsTable && detections.length > 0 && (
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <h4 className="text-sm font-semibold text-slate-300">Raw Detection Coordinates & Confidences</h4>
          <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 uppercase font-semibold text-slate-400 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-4 py-2.5">Class</th>
                  <th className="px-4 py-2.5">Confidence</th>
                  <th className="px-4 py-2.5">Bounding Box [X1, Y1, X2, Y2]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {detections.map((det, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2 text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-2 font-sans font-medium text-cyan-300 capitalize">{det.class}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                        {(det.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-400">
                      [{det.bbox.join(', ')}]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotatedImage;
