import type { TableColumnsType } from 'antd';
import { Table } from 'antd';

import { MessageType, RawPocsagRow, TrainSignalRecord } from './types';
import { getNextSecond, parsePocsag1234002 } from './utils';
import GoogleMapLink from './GoogleMapLink';

interface DataType {
  key: React.Key;
  trainNumber: number;
  infoLength: number;
}

type ExtendedTableColumnsType = {
  key: string;
  timestamp: string;
  trainNumber: number;
  speed: number;
  mileage: number;
  gps?: {
    latitude: string;
    longitude: string;
  };
};

/**
 * record is 1234000, from this record's timestamp, we may find the corresponding 1234002 Numberic record which contains the GPS info
 * if cannot find the 1234002 record at the same timestamp, we use the next 1s record
 */
const getRelated1234002Record = (
  record: TrainSignalRecord,
  rawPocsagRows: RawPocsagRow[]
) => {
  const gpsRecords = rawPocsagRows
    .filter(
      (row) =>
        row.address === '1234002' &&
        row.message_format === MessageType.Numeric &&
        (row.timestamp === record.timestamp ||
          row.timestamp === getNextSecond(record.timestamp))
    )
    .map((row) => {
      const result = parsePocsag1234002(row.message_content);
      if (result.err || !result.latitude || !result.longitude) {
        return null;
      }
      return {
        latitude: result.latitude,
        longitude: result.longitude,
      };
    })
    .filter((result) => result !== null);
  return gpsRecords;
};

const expandColumns: TableColumnsType<ExtendedTableColumnsType> = [
  { title: 'Key', dataIndex: 'key', key: 'key' },
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
  { title: 'TrainNumber', dataIndex: 'trainNumber', key: 'trainNumber' },
  { title: 'Speed', dataIndex: 'speed', key: 'speed' },
  { title: 'Mileage', dataIndex: 'mileage', key: 'mileage' },
  {
    title: 'Latitude&Longitude',
    dataIndex: 'gps',
    key: 'gps',
    render: (gps) => {
      if (!gps) {
        return 'Related 1234002 record not found';
      }
      return (
        <GoogleMapLink latitude={gps.latitude} longitude={gps.longitude} />
      );
    },
  },
];
const columns: TableColumnsType<DataType> = [
  {
    title: 'TrainNumber',
    dataIndex: 'trainNumber',
    key: 'trainNumber',
    render: (trainNumber) => {
      return (
        <a
          href={`/tools?tool=pocsagViewer&toolParams={"trainNumber":${trainNumber}}`}
          target="_blank"
          rel="noreferrer"
        >
          {trainNumber}
        </a>
      );
    },
  },
  {
    title: 'InfoLength',
    dataIndex: 'infoLength',
    key: 'infoLength',
    sorter: (a, b) => a.infoLength - b.infoLength,
    defaultSortOrder: 'descend',
  },
];

const CheciTable = ({
  trainSignalRecordsMap,
  rawPocsagRows,
}: {
  trainSignalRecordsMap: Record<string, TrainSignalRecord[]>;
  rawPocsagRows: RawPocsagRow[];
}) => {
  const dataSource = Object.values(trainSignalRecordsMap).map<DataType>(
    (trainSignalRecords, i) => ({
      key: i.toString(),
      trainNumber: trainSignalRecords[0].payload.trainNumber,
      infoLength: trainSignalRecords.length,
    })
  );

  const expandedRowRender = (record: DataType) => {
    const trainSignalRecords = trainSignalRecordsMap[record.trainNumber];
    const trainSignalRecordsWithKey: ExtendedTableColumnsType[] =
      trainSignalRecords.map((record: TrainSignalRecord, idx: number) => {
        const related1234002Record = getRelated1234002Record(
          record,
          rawPocsagRows
        );
        return {
          key: idx.toString(),
          timestamp: record.timestamp,
          trainNumber: record.payload.trainNumber,
          speed: record.payload.speed,
          mileage: record.payload.mileage,
          gps:
            related1234002Record.length > 0 && related1234002Record[0]
              ? {
                  latitude: related1234002Record[0].latitude,
                  longitude: related1234002Record[0].longitude,
                }
              : undefined,
        };
      });

    return (
      <Table<ExtendedTableColumnsType>
        columns={expandColumns}
        dataSource={trainSignalRecordsWithKey}
        pagination={false}
      />
    );
  };

  return (
    <Table<DataType>
      columns={columns}
      expandable={{ expandedRowRender }}
      dataSource={dataSource}
      pagination={false}
    />
  );
};

export default CheciTable;
