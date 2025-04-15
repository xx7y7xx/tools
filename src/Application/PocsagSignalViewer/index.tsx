import { useEffect, useState } from 'react';

import Papa from 'papaparse';

import { ParsedPocsagRow, RawPocsagRow } from '../PocsagViewer/types';
import SignalTable from './SignalTable';
import { parsePocsagData } from '../PocsagViewer/pocsagParser';

/**
 * PocsagSignalViewer is a web application that allows you to view POCSAG data.
 * It reads the POCSAG data from a CSV file and displays it in a table.
 * It also allows you to filter the data by train number.
 */
const PocsagSignalViewer = () => {
  const [parsedData, setParsedData] = useState<ParsedPocsagRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // we have problem in the format of CSV file, because the `messageContent` may contain commas and quotes
        // so maybe we need TSV file for other program to process
        const response = await fetch(
          'http://localhost:3001/data/pocsag_data_v2.tsv'
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
          delimiter: '\t',
          complete: (results) => {
            setParsedData(
              parsePocsagData(results.data as unknown as RawPocsagRow[])
            );
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
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1>POCSAG Signal Viewer</h1>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <SignalTable parsedSignalRows={parsedData} />
      </div>
    </div>
  );
};

export default PocsagSignalViewer;
