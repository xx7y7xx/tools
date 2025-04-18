import { Button, Table } from 'antd';

import { useTimeRange } from './TimeRangeContext';

import {
  expandColumns,
  ExtendedTableColumnsType,
  getRelated1234002Row,
} from './CheciTable';
import { ParsedPocsagPayload1234002 } from './types';
import { convertGpsListToWkt, downloadFile } from './utils';

const CodeSpeedMileageTable = () => {
  const { filteredTrainSignalRecords, filteredParsedPocsagRows } =
    useTimeRange();

  const trainSignalRecordsWithKey: ExtendedTableColumnsType[] =
    filteredTrainSignalRecords.map((record, idx: number) => {
      const related1234002Row = getRelated1234002Row(
        record,
        filteredParsedPocsagRows
      );
      return {
        key: idx.toString(),
        timestamp: record.timestamp,
        trainNumber: record.payload.trainNumber,
        speed: record.payload.speed,
        mileage: record.payload.mileage,
        _related1234002Row: related1234002Row,
      };
    });

  return (
    <div>
      <Table<ExtendedTableColumnsType>
        columns={expandColumns}
        dataSource={trainSignalRecordsWithKey}
        pagination={false}
        title={() => (
          <div>
            <Button
              onClick={() => {
                const gpsList = trainSignalRecordsWithKey
                  .map((record) => {
                    const payload = record._related1234002Row
                      ?.messagePayload as ParsedPocsagPayload1234002;
                    return {
                      latitude: payload?.gcj02 ? payload?.gcj02.latitude : 0,
                      longitude: payload?.gcj02 ? payload?.gcj02.longitude : 0,
                    };
                  })
                  .filter((gps) => !!gps);
                const wkt = convertGpsListToWkt(gpsList);
                downloadFile(wkt, 'train_route.csv');
              }}
            >
              Export to KML
            </Button>{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.google.com/mymaps"
            >
              https://www.google.com/mymaps
            </a>
          </div>
        )}
      />
    </div>
  );
};

export default CodeSpeedMileageTable;
