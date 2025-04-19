import { useEffect, useState } from 'react';

import Papa from 'papaparse';

import {
  ParsedPocsagRow,
  ParsedPocsagPayload1234000,
  RawPocsagRow,
  TrainSignalRecord,
} from './types';
import { parsePocsagData } from './pocsagParser';
import CheciDetail from './CheciDetail';
import CheciTable from './CheciTable';

/**
 * PocsagViewer is a web application that allows you to view POCSAG data.
 * It reads the POCSAG data from a CSV file and displays it in a table.
 * It also allows you to filter the data by train number.
 */
const PocsagViewer = () => {
  const [parsedPocsagRows, setParsedPocsagRows] = useState<ParsedPocsagRow[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
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
            setParsedPocsagRows(
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

  const trainSignalRecordsMap: Record<string, TrainSignalRecord[]> = {
    // e.g. 69012: TrainSignalRecord[]
  };

  parsedPocsagRows.forEach((row) => {
    if (row.address !== 1234000) {
      //   console.log('skip', row);
      return;
    }

    if (row.parsedErrorMessage) {
      //   console.error('Invalid POCSAG message body', row);
      return;
    }

    const payload = row.messagePayload as ParsedPocsagPayload1234000;

    const record: TrainSignalRecord = {
      timestamp: row.timestamp,
      address: row.rawSignal.address,
      messageType: row.messageFormat,
      functionCode: row.functionBits,
      payload: {
        trainNumber: payload.trainNumber,
        speed: payload.speed,
        mileage: payload.mileage,
        rawData: row.rawSignal.message_content,
      },
      _related1234002Row: row._related1234002Row,
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
          <CheciDetail
            trainSignalRecords={trainSignalRecords}
            parsedPocsagRows={parsedPocsagRows}
          />
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
          parsedPocsagRows={parsedPocsagRows}
        />
      )}
    </div>
  );
};

export default PocsagViewer;
