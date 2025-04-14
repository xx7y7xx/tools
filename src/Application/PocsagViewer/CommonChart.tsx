import { useEffect, useRef } from 'react';
import Chart, { ChartType } from 'chart.js/auto';

interface CommonChartProps {
  chartConfig: {
    type: ChartType;
    data: { labels: string[]; datasets: any[] };
    options: any;
  };
}

const CommonChart = ({ chartConfig }: CommonChartProps) => {
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
        type: chartConfig.type,
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
  }, [chartConfig]);

  return <canvas ref={chartRef} />;
};

export default CommonChart;
