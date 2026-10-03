import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaCar, FaMotorcycle, FaBus, FaTruck, FaBicycle, FaCheckCircle, FaChartPie, FaLayerGroup } from 'react-icons/fa';

interface DetectionItem {
  class: string;
  confidence: number;
  bbox: number[];
}

interface Props {
  result: {
    total_vehicles: number;
    counts: Record<string, number>;
    detections: DetectionItem[];
    result_image: string;
  };
}

const CLASS_COLORS: Record<string, string> = {
  car: '#06b6d4',        // cyan-500
  motorcycle: '#f43f5e', // rose-500
  bus: '#10b981',        // emerald-500
  truck: '#f59e0b',      // amber-500
  bicycle: '#8b5cf6',    // purple-500
};

const CLASS_ICONS: Record<string, JSX.Element> = {
  car: <FaCar className="text-xl text-cyan-400" />,
  motorcycle: <FaMotorcycle className="text-xl text-rose-400" />,
  bus: <FaBus className="text-xl text-emerald-400" />,
  truck: <FaTruck className="text-xl text-amber-400" />,
  bicycle: <FaBicycle className="text-xl text-purple-400" />,
};

const ResultDashboard: React.FC<Props> = ({ result }) => {
  const { total_vehicles, counts, detections } = result;

  const chartData = Object.entries(counts).map(([key, value], idx) => ({
    name: key,
    value,
    color: CLASS_COLORS[key.toLowerCase()] || ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'][idx % 5],
  }));

  const avgConfidence = detections.length > 0
    ? (detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100).toFixed(1)
    : '0';

  const dominantClass = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  return (
    <div className="space-y-6 mb-8 w-full">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel-interactive rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Vehicles</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FaLayerGroup />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-display">{total_vehicles}</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <FaCheckCircle className="text-xs" /> Detected
            </span>
          </div>
        </div>

        <div className="glass-panel-interactive rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Dominant Category</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FaCar />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-display capitalize">{dominantClass}</span>
            <span className="text-xs text-slate-400">
              ({counts[dominantClass] || 0} units)
            </span>
          </div>
        </div>

        <div className="glass-panel-interactive rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Avg Confidence</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FaChartPie />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-display">{avgConfidence}%</span>
            <span className="text-xs text-emerald-400 font-medium">High Accuracy</span>
          </div>
        </div>
      </div>

      {/* Breakdown and Pie Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Vehicle Classification Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400">{Object.keys(counts).length} classes found</span>
          </div>

          <div className="space-y-3">
            {Object.entries(counts).map(([name, count]) => {
              const percentage = total_vehicles > 0 ? ((count / total_vehicles) * 100).toFixed(0) : '0';
              const color = CLASS_COLORS[name.toLowerCase()] || '#06b6d4';
              const icon = CLASS_ICONS[name.toLowerCase()] || <FaCar className="text-xl text-cyan-400" />;

              return (
                <div key={name} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                        {icon}
                      </div>
                      <span className="font-semibold text-slate-200 capitalize text-base">{name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white text-base">{count}</span>
                      <span className="text-xs text-slate-400 ml-1.5">({percentage}%)</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-slate-100 mb-2 self-start flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>Distribution Analysis</span>
          </h3>

          {chartData.length > 0 ? (
            <div className="w-full h-64 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-white font-display">{total_vehicles}</span>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Total</span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No vehicles detected to display distribution
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;
