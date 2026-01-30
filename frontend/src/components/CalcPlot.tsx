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
  profAvg: number[];   
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

export function CalcPlot({ avg, glb, profAvg }: CalcPlotProps) {
  const maxLength = Math.max(avg.length, glb.length, profAvg.length);
  const labels = Array.from({ length: maxLength }, (_, i) => (i + 1).toString());

  const data = {
    labels,
    datasets: [
      {
        label: 'Average Professor Fairness',
        data: avg,
        borderColor: 'rgba(168,85,247,1)',
        backgroundColor: 'rgba(168,85,247,0.1)',
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'Average Degree Fairness',
        data: glb,
        borderColor: 'rgba(34,197,94,1)',
        backgroundColor: 'rgba(34,197,94,0.1)',
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'Average Overall Fairness',
        data: profAvg,
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.1)',
        borderWidth: 2,
        tension: 0.1,
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
