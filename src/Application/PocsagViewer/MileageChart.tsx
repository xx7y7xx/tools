import { TooltipItem } from 'chart.js';

import CommonChart from './CommonChart';
import { TrainSignalRecord } from './types';
import { getColorForSpeed, getMinMaxSpeed } from './utils';

interface MileageChartProps {
  trainSignalRecords: TrainSignalRecord[];
}

/**
 * MileageChart is a chart that displays the mileage of a train over time.
 * It uses the color of the train to indicate the speed of the train.
 */
const MileageChart = ({ trainSignalRecords }: MileageChartProps) => {
  const { minSpeed, maxSpeed } = getMinMaxSpeed(trainSignalRecords);

  const chartConfig = {
    type: 'line' as const,
    data: {
      labels: trainSignalRecords.map(
        (record) => record.timestamp.split(' ')[1]
      ),
      datasets: [
        {
          label: 'Mileage',
          data: trainSignalRecords.map((record) => ({
            x: record.timestamp.split(' ')[1],
            y: record.payload.mileage,
          })),
          backgroundColor: trainSignalRecords.map((record) =>
            getColorForSpeed(record.payload.speed, minSpeed, maxSpeed)
          ),
          borderColor: 'rgba(54, 162, 235, 0.5)',
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Train Mileage Over Time',
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'line'>) => {
              const record = trainSignalRecords[context.dataIndex];
              return [
                `Mileage: ${context.parsed.y} km`,
                `Speed: ${record.payload.speed} km/h`,
              ];
            },
          },
        },
      },
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
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <CommonChart chartConfig={chartConfig} />
    </div>
  );
};

export default MileageChart;
