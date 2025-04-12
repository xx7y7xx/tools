import CommonChart from './CommonChart';
import { TrainInfo } from './types';
import { TooltipItem } from 'chart.js';

interface MileageChartProps {
  trainInfos: TrainInfo[];
}

const MileageChart = ({ trainInfos }: MileageChartProps) => {
  const chartConfig = {
    type: 'line' as const,
    data: {
      labels: trainInfos.map((_, index) => `Point ${index + 1}`),
      datasets: [
        {
          label: 'Mileage',
          data: trainInfos.map((info) => info.mileage),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Mileage (km)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Time Points',
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'line'>) => `${context.parsed.y} km`,
          },
        },
      },
    },
  };

  return <CommonChart chartConfig={chartConfig} />;
};

export default MileageChart;
