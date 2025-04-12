import { TooltipItem } from 'chart.js';

import CommonChart from './CommonChart';
import { TrainSignalRecord } from './types';

interface MileageChartProps {
  trainSignalRecords: TrainSignalRecord[];
}

const MileageChart = ({ trainSignalRecords }: MileageChartProps) => {
  const chartConfig = {
    type: 'line' as const,
    data: {
      labels: trainSignalRecords.map(
        (record) => record.timestamp.split(' ')[1]
      ),
      datasets: [
        {
          label: 'Mileage',
          data: trainSignalRecords.map((record) => record.payload.mileage),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.1,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
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

  return (
    <div style={{ height: '300px' }}>
      <CommonChart chartConfig={chartConfig} />
    </div>
  );
};

export default MileageChart;
