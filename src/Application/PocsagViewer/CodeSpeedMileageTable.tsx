import { Button, Table } from 'antd';

import { useTimeRange } from './TimeRangeContext';

import { generateExpandColumns, ExtendedTableColumnsType } from './CheciTable';
import { ParsedPocsagPayload1234002 } from './types';
import { convertGpsListToWkt, downloadFile } from './utils';

const CodeSpeedMileageTable = () => {
  const { filteredTrainSignalRecords, parsedPocsagRows } = useTimeRange();

  const trainSignalRecordsWithKey: ExtendedTableColumnsType[] =
    filteredTrainSignalRecords.map((record, idx: number) => {
      return {
        key: idx.toString(),
        timestamp: record.timestamp,
        trainNumber: record.payload.trainNumber,
        speed: record.payload.speed,
        mileage: record.payload.mileage,
        _related1234002RowIdx: record._related1234002RowIdx,
      };
    });

  return (
    <div>
      <Table<ExtendedTableColumnsType>
        columns={generateExpandColumns(parsedPocsagRows)}
        dataSource={trainSignalRecordsWithKey}
        pagination={false}
        title={() => (
          <div>
            <Button
              onClick={() => {
                const gpsList = trainSignalRecordsWithKey
                  .map((record) => {
                    if (!record._related1234002RowIdx) {
                      return {
                        latitude: 0,
                        longitude: 0,
                      };
                    }
                    const payload = parsedPocsagRows[
                      record._related1234002RowIdx
                    ]?.messagePayload as ParsedPocsagPayload1234002;
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
