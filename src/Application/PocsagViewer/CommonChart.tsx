import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Chart, { ChartType } from 'chart.js/auto';

interface CommonChartProps {
  chartConfig: {
    type: ChartType;
    data: { labels: string[]; datasets: any[] };
    options: any;
  };
}

const CommonChart = forwardRef<Chart, CommonChartProps>(
  ({ chartConfig }, ref) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useImperativeHandle(ref, () => chartInstance.current as Chart, []);

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
  }
);

CommonChart.displayName = 'CommonChart';

export default CommonChart;
