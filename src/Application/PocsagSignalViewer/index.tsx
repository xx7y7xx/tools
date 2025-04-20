import { useEffect, useState } from 'react';

import { ParsedPocsagRow } from '../PocsagViewer/types';
import SignalTable from './SignalTable';
import { parsePocsagData } from '../PocsagViewer/pocsagParser';
import { fetchTsvData } from '../PocsagViewer/utils';

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
    setLoading(true);
    setError(null);

    fetchTsvData()
      .then((rows) => {
        setParsedData(parsePocsagData(rows));
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
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
