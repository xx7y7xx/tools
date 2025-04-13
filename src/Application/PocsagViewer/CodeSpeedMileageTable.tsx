import { Button, Table } from 'antd';

import {
  expandColumns,
  ExtendedTableColumnsType,
  getRelated1234002Row,
} from './CheciTable';
import { RawPocsagRow, TrainSignalRecord } from './types';
import { convertGps, convertGpsListToWkt } from './utils';

const CodeSpeedMileageTable = ({
  trainSignalRecords,
  rawPocsagRows,
}: {
  trainSignalRecords: TrainSignalRecord[];
  rawPocsagRows: RawPocsagRow[];
}) => {
  const trainSignalRecordsWithKey: ExtendedTableColumnsType[] =
    trainSignalRecords.map((record: TrainSignalRecord, idx: number) => {
      const related1234002Row = getRelated1234002Row(record, rawPocsagRows);
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
                  .map((record) => record._related1234002Row?.gps)
                  .filter((gps) => !!gps)
                  .map((gps) =>
                    convertGps(gps || { latitude: '', longitude: '' })
                  );
                const wkt = convertGpsListToWkt(gpsList);
                const a = document.createElement('a');
                a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(
                  wkt
                )}`;
                a.download = 'train_route.csv';
                a.click();
              }}
            >
              Export to KML
            </Button>
          </div>
        )}
      />
    </div>
  );
};

export default CodeSpeedMileageTable;
