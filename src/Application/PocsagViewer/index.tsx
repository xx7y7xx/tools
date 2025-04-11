import { useEffect, useState } from 'react';

import Papa from 'papaparse';

import { PocsagData, TrainInfo } from './types';
import { convertTrainNumSpeedMileage } from './utils';
import CheciDetail from './CheciDetail';
import CheciTable from './CheciTable';

/**
 * PocsagViewer is a web application that allows you to view POCSAG data.
 * It reads the POCSAG data from a CSV file and displays it in a table.
 * It also allows you to filter the data by train number.
 */
const PocsagViewer = () => {
  const [data, setData] = useState<PocsagData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          'http://localhost:3001/data/pocsag_data_v2.csv'
        );
        if (!response) {
          throw new TypeError('Network error - server may be down');
        }
        if (!response.ok) {
          throw new Error('Server not responding');
        }
        const text = await response.text();
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data as unknown as PocsagData[]);
            setLoading(false);
          },
          error: (err: Error) => {
            setError('Error parsing CSV: ' + err.message);
            setLoading(false);
          },
        });
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Start the server: `node server.js`');
        } else {
          setError('Error fetching CSV: ' + (err as Error).message);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const checiMap: Record<string, TrainInfo[]> = {
    // 69012: TrainInfo[]
  };

  data.forEach((row) => {
    if (row.address !== '1234000') {
      //   console.log('skip', row);
      return;
    }

    const trainInfo = convertTrainNumSpeedMileage(row.message_content);
    if (trainInfo.err || !trainInfo.data) {
      //   console.error('Invalid POCSAG message body', row);
      return;
    }

    checiMap[trainInfo.data.trainNumber] = [
      ...(checiMap[trainInfo.data.trainNumber] || []),
      trainInfo.data,
    ];
  });

  const urlParams = new URLSearchParams(window.location.search);
  const toolParams = urlParams.get('toolParams');
  if (toolParams) {
    const toolParamsObj = JSON.parse(toolParams);
    const checiInfos = checiMap[toolParamsObj.trainNumber];
    // render train detail page for a specific train number
    return (
      <div>
        <h1>TrainDetail</h1>
        <div>TrainNumber: {toolParamsObj.trainNumber}</div>
        {checiInfos && <CheciDetail trainInfos={checiInfos} />}
      </div>
    );
  }

  return (
    <div>
      <h1>PocsagViewer</h1>
      {checiMap && <CheciTable checiMap={checiMap} />}
    </div>
  );
};

export default PocsagViewer;
