import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

interface CalcPlotProps {
  avg: number[];
  glb: number[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function CalcPlot({ avg, glb }: CalcPlotProps) {
  const labels = avg.map((_, i) => i + 1); // Asse x: 1..n

  const data = {
    labels,
    datasets: [
      {
        label: 'Student Class Average Fairness',
        data: avg,
        borderColor: 'rgba(34,197,94,1)', // verde
        backgroundColor: 'rgba(34,197,94,0.2)',
      },
      {
        label: 'Global Fairness',
        data: glb,
        borderColor: 'rgba(59,130,246,1)', // blu
        backgroundColor: 'rgba(59,130,246,0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: {
        display: true,
        text: 'Trend plotter',
      },
    },
    scales: {
      y: {
        beginAtZero: false, 
      },
    },
  };

  return (
    <div className="border-1 border-green-500 rounded-xl p-4 w-full max-w-3xl">
      <Line data={data} options={options} />
    </div>
  );
}
