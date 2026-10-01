// src/components/ResultDashboard.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { FaCar, FaMotorcycle, FaBus, FaTruck, FaBicycle } from 'react-icons/fa';

interface Props {
  result: {
    total_vehicles: number;
    counts: Record<string, number>;
    detections: any[];
    result_image: string;
  };
}

// Assign a distinct color for each class (order matches icons below)
const COLORS = ['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#6b7280'];

const ICONS: Record<string, JSX.Element> = {
  car: <FaCar size={24} />, // blue
  motorcycle: <FaMotorcycle size={24} />, // red
  bus: <FaBus size={24} />, // green
  truck: <FaTruck size={24} />, // orange
  bicycle: <FaBicycle size={24} />, // gray
};

const ResultDashboard: React.FC<Props> = ({ result }) => {
  const { total_vehicles, counts } = result;

  const data = Object.entries(counts).map(([key, value], idx) => ({
    name: key,
    value,
    color: COLORS[idx % COLORS.length],
    icon: ICONS[key] ?? null,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Total Vehicles: {total_vehicles}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded"
          >
            <div className="text-primary-600">{item.icon}</div>
            <div>
              <p className="capitalize font-medium">{item.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Donut chart */}
      {data.length > 0 && (
        <PieChart width={400} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      )}
    </div>
  );
};

export default ResultDashboard;
