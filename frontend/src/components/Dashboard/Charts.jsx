import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const chartDefaults = {
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter', size: 12 },
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#1a2235',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      padding: 12,
    },
  },
};

export const StatusChart = ({ stats }) => {
  const data = {
    labels: ['To Do', 'In Progress', 'Completed'],
    datasets: [{
      data: [stats.todo || 0, stats.inProgress || 0, stats.completed || 0],
      backgroundColor: ['rgba(100,116,139,0.7)', 'rgba(59,130,246,0.7)', 'rgba(16,185,129,0.7)'],
      borderColor: ['#64748b', '#3b82f6', '#10b981'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const options = {
    ...chartDefaults,
    cutout: '68%',
    plugins: {
      ...chartDefaults.plugins,
      legend: { ...chartDefaults.plugins.legend, position: 'bottom' },
    },
  };

  return (
    <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>Task Status Overview</h3>
      <div style={{ height: 240 }}>
        <Doughnut data={data} options={{ ...options, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export const PriorityChart = ({ stats }) => {
  const data = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      label: 'Tasks',
      data: [
        stats.byPriority?.High || 0,
        stats.byPriority?.Medium || 0,
        stats.byPriority?.Low || 0,
      ],
      backgroundColor: ['rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(16,185,129,0.7)'],
      borderColor: ['#ef4444', '#f59e0b', '#10b981'],
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const options = {
    ...chartDefaults,
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, stepSize: 1 },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'rgba(255,255,255,0.08)' },
        beginAtZero: true,
      },
    },
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
    },
  };

  return (
    <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>Tasks by Priority</h3>
      <div style={{ height: 240 }}>
        <Bar data={data} options={{ ...options, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};
