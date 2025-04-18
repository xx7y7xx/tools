import { Chart as ChartJS, TimeScale, TooltipItem } from 'chart.js';
import 'chartjs-adapter-date-fns';

import { useTimeRange } from './TimeRangeContext';
import CommonChart from './CommonChart';
import { getColorForSpeed, getMinMaxSpeed } from './utils';

// Register the time scale
ChartJS.register(TimeScale);

/**
 * SpeedChart is a chart that displays the speed of a train over time.
 * It uses the color of the train to indicate the speed of the train.
 */
const SpeedChart = () => {
  const { filteredTrainSignalRecords } = useTimeRange();
  const { minSpeed, maxSpeed } = getMinMaxSpeed(filteredTrainSignalRecords);

  const chartConfig = {
    type: 'line' as const,
    data: {
      labels: filteredTrainSignalRecords.map((record) => record.timestamp),
      datasets: [
        {
          label: 'Speed',
          data: filteredTrainSignalRecords.map((record) => ({
            x: new Date(record.timestamp).getTime(),
            y: record.payload.speed,
          })),
          backgroundColor: filteredTrainSignalRecords.map((record) =>
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
        legend: {
          display: false,
        },
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
              const record = filteredTrainSignalRecords[context.dataIndex];
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
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'MMM d, HH:mm',
            },
            parser: 'yyyy-MM-dd HH:mm:ss',
          },
          title: {
            display: true,
            text: 'Time',
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            maxTicksLimit: 8,
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
