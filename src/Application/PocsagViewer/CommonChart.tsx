import { useEffect, useRef } from 'react';
import Chart, { ChartType } from 'chart.js/auto';

const CommonChart = ({
  chartConfig,
}: {
  chartConfig: {
    type: ChartType;
    data: { labels: string[]; datasets: any[] };
    options: any;
  };
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      chartInstance.current = new Chart(ctx, {
        type: chartConfig.type, // or 'line', 'pie', etc.
        data: chartConfig.data,
        options: chartConfig.options,
      });
    }

    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef} />;
};

export default CommonChart;
