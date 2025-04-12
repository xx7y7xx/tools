import CommonChart from './CommonChart';
import { TrainSignalRecord } from './types';
import { TooltipItem } from 'chart.js';
import { getColorForSpeed, getMinMaxSpeed } from './utils';

interface SpeedChartProps {
  trainSignalRecords: TrainSignalRecord[];
}

/**
 * SpeedChart is a chart that displays the speed of a train over time.
 * It uses the color of the train to indicate the speed of the train.
 */
const SpeedChart = ({ trainSignalRecords }: SpeedChartProps) => {
  const { minSpeed, maxSpeed } = getMinMaxSpeed(trainSignalRecords);

  const chartConfig = {
    type: 'line' as const,
    data: {
      labels: trainSignalRecords.map(
        (record) => record.timestamp.split(' ')[1]
      ),
      datasets: [
        {
          label: 'Speed',
          data: trainSignalRecords.map((record) => ({
            x: record.timestamp.split(' ')[1],
            y: record.payload.speed,
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
          text: 'Train Speed Over Time',
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
                `Speed: ${context.parsed.y} km/h`,
                `Mileage: ${record.payload.mileage} km`,
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
            text: 'Speed (km/h)',
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

export default SpeedChart;
