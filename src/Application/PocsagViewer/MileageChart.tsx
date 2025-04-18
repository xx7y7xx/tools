import { TooltipItem, Chart as ChartJS, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';

import { useTimeRange } from './TimeRangeContext';
import CommonChart from './CommonChart';
import { getColorForSpeed, getMinMaxSpeed } from './utils';

// Register the time scale
ChartJS.register(TimeScale);

/**
 * MileageChart is a chart that displays the mileage of a train over time.
 * It uses the color of the train to indicate the speed of the train.
 */
const MileageChart = () => {
  const { filteredTrainSignalRecords } = useTimeRange();
  const { minSpeed, maxSpeed } = getMinMaxSpeed(filteredTrainSignalRecords);

  const chartConfig = {
    type: 'line' as const,
    data: {
      labels: filteredTrainSignalRecords.map((record) => record.timestamp),
      datasets: [
        {
          label: 'Mileage',
          data: filteredTrainSignalRecords.map((record) => ({
            x: new Date(record.timestamp).getTime(),
            y: record.payload.mileage,
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
          text: 'Train Mileage Over Time',
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

export default MileageChart;
