import CommonChart from './CommonChart';
import { TrainSignalRecord } from './types';
import { TooltipItem } from 'chart.js';
import { getColorForSpeed, getMinMaxSpeed } from './utils';
import { Chart as ChartJS, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Button } from 'antd';
import { useRef } from 'react';

// Register the time scale and zoom plugin
ChartJS.register(TimeScale, zoomPlugin);

interface SpeedChartProps {
  trainSignalRecords: TrainSignalRecord[];
}

/**
 * SpeedChart is a chart that displays the speed of a train over time.
 * It uses the color of the train to indicate the speed of the train.
 */
const SpeedChart = ({ trainSignalRecords }: SpeedChartProps) => {
  const { minSpeed, maxSpeed } = getMinMaxSpeed(trainSignalRecords);
  const chartRef = useRef<ChartJS | null>(null);
  console.log('trainSignalRecords', trainSignalRecords);

  const chartConfig = {
    type: 'line' as const,
    data: {
      labels: trainSignalRecords.map((record) => record.timestamp),
      datasets: [
        {
          label: 'Speed',
          data: trainSignalRecords.map((record) => ({
            x: new Date(record.timestamp).getTime(),
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
              const record = trainSignalRecords[context.dataIndex];
              return [
                `Speed: ${context.parsed.y} km/h`,
                `Mileage: ${record.payload.mileage} km`,
              ];
            },
          },
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: 'x',
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
            unit: 'minute',
            displayFormats: {
              minute: 'HH:mm:ss',
            },
            parser: 'yyyy-MM-dd HH:mm:ss',
          },
          title: {
            display: true,
            text: 'Time',
          },
        },
      },
    },
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <Button onClick={handleResetZoom}>Reset Zoom</Button>
      </div>
      <div style={{ height: '300px' }}>
        <CommonChart chartConfig={chartConfig} ref={chartRef} />
      </div>
    </div>
  );
};

export default SpeedChart;
