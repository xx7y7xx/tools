import { useEffect, useState } from 'react';

import Papa from 'papaparse';

import { MessageType, RawPocsagRow, TrainSignalRecord } from './types';
import { convertTrainNumSpeedMileage } from './utils';
import CheciDetail from './CheciDetail';
import CheciTable from './CheciTable';

/**
 * PocsagViewer is a web application that allows you to view POCSAG data.
 * It reads the POCSAG data from a CSV file and displays it in a table.
 * It also allows you to filter the data by train number.
 */
const PocsagViewer = () => {
  const [rawPocsagRows, setRawPocsagRows] = useState<RawPocsagRow[]>([]);
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
            setRawPocsagRows(results.data as unknown as RawPocsagRow[]);
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

  const trainSignalRecordsMap: Record<string, TrainSignalRecord[]> = {
    // e.g. 69012: TrainSignalRecord[]
  };

  rawPocsagRows.forEach((row) => {
    if (row.address !== '1234000') {
      //   console.log('skip', row);
      return;
    }

    const msgObj = convertTrainNumSpeedMileage(row.message_content);
    if (msgObj.err || !msgObj.data) {
      //   console.error('Invalid POCSAG message body', row);
      return;
    }

    const record: TrainSignalRecord = {
      timestamp: row.timestamp,
      address: row.address,
      messageType: row.message_format as MessageType,
      functionCode: parseInt(row.function_bits),
      payload: {
        ...msgObj.data,
        rawData: row.message_content,
      },
    };

    if (!record.payload.trainNumber) {
      console.error('Invalid POCSAG record, missing train number', row);
      return;
    }

    trainSignalRecordsMap[record.payload.trainNumber] = [
      ...(trainSignalRecordsMap[record.payload.trainNumber] || []),
      record,
    ];
  });

  const urlParams = new URLSearchParams(window.location.search);
  const toolParams = urlParams.get('toolParams');
  if (toolParams) {
    const toolParamsObj = JSON.parse(toolParams);
    const trainSignalRecords = trainSignalRecordsMap[toolParamsObj.trainNumber];
    // render train detail page for a specific train number
    return (
      <div>
        <h1>TrainDetail</h1>
        <div>TrainNumber: {toolParamsObj.trainNumber}</div>
        {trainSignalRecords && (
          <CheciDetail trainSignalRecords={trainSignalRecords} />
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>PocsagViewer</h1>
      {trainSignalRecordsMap && (
        <CheciTable
          trainSignalRecordsMap={trainSignalRecordsMap}
          rawPocsagRows={rawPocsagRows}
        />
      )}
    </div>
  );
};

export default PocsagViewer;
