// this is web application, how to read csv file from file system
// file path is ../pocsag-data/pocsag_data_v2.csv

// use papaparse to read csv file

import { useEffect, useState } from 'react';
import Papa from 'papaparse';

interface PocsagData {
  // Add your CSV data structure here
  [key: string]: string;
}

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

  return (
    <div>
      <h1>PocsagViewer</h1>
      {data.length > 0 && (
        <div>
          <h2>Data Preview</h2>
          <pre>{JSON.stringify(data.slice(0, 5), null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PocsagViewer;
