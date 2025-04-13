import type { TableColumnsType } from 'antd';
import { Table } from 'antd';

import { MessageType, RawPocsagRow, TrainSignalRecord } from './types';
import { getNextSecond, parsePocsag1234002 } from './utils';
import GoogleMapLink from './GoogleMapLink';

interface CheciRowType {
  trainNumber: number;
  infoLength: number;
}

type ExtendedTableColumnsType = {
  key: string;
  timestamp: string;
  trainNumber: number;
  speed: number;
  mileage: number;
  _related1234002Row: getRelated1234002RowType | null;
};

type getRelated1234002RowType = {
  originalRow: RawPocsagRow;
  gps: {
    latitude: string;
    longitude: string;
  };
};

/**
 * record is 1234000, from this record's timestamp, we may find the corresponding 1234002 Numberic record which contains the GPS info
 * if cannot find the 1234002 record at the same timestamp, we use the next 1s record
 */
const getRelated1234002Row = (
  record: TrainSignalRecord,
  rawPocsagRows: RawPocsagRow[]
) => {
  const foundRows: getRelated1234002RowType[] = [];
  rawPocsagRows
    .filter(
      (row) =>
        row.address === '1234002' &&
        row.message_format === MessageType.Numeric &&
        (row.timestamp === record.timestamp ||
          row.timestamp === getNextSecond(record.timestamp))
    )
    .forEach((row) => {
      const result = parsePocsag1234002(row.message_content);
      if (result.err || !result.latitude || !result.longitude) {
        return;
      }
      foundRows.push({
        originalRow: row,
        gps: {
          latitude: result.latitude,
          longitude: result.longitude,
        },
      });
    });
  if (foundRows.length > 1) {
    console.warn(
      `Found ${foundRows.length} related 1234002 records for ${record.payload.trainNumber} at ${record.timestamp}`
    );
  }
  if (foundRows.length === 0) {
    return null;
  }
  return foundRows[0];
};

const expandColumns: TableColumnsType<ExtendedTableColumnsType> = [
  { title: 'Key', dataIndex: 'key', key: 'key' },
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
  { title: 'TrainNumber', dataIndex: 'trainNumber', key: 'trainNumber' },
  { title: 'Speed', dataIndex: 'speed', key: 'speed' },
  { title: 'Mileage', dataIndex: 'mileage', key: 'mileage' },
  {
    title: 'Related 1234002 Row',
    dataIndex: '_related1234002Row',
    key: '_related1234002Row',
    render: (related1234002Row: getRelated1234002RowType | null) => {
      if (!related1234002Row) {
        return 'Related 1234002 record not found';
      }
      return (
        <div>
          <GoogleMapLink
            latitude={related1234002Row.gps.latitude}
            longitude={related1234002Row.gps.longitude}
          />{' '}
          Raw: <code>{related1234002Row.originalRow.message_content}</code>
        </div>
      );
    },
  },
];
const columns: TableColumnsType<CheciRowType> = [
  {
    title: 'TrainNumber',
    dataIndex: 'trainNumber',
    key: 'trainNumber',
    sorter: (a, b) => a.trainNumber - b.trainNumber,
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
  const checiRows = Object.values(trainSignalRecordsMap).map<CheciRowType>(
    (trainSignalRecords) => ({
      trainNumber: trainSignalRecords[0].payload.trainNumber,
      infoLength: trainSignalRecords.length,
    })
  );
  const expandedRowRender = (record: CheciRowType) => {
    const trainSignalRecords = trainSignalRecordsMap[record.trainNumber];
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
      <Table<ExtendedTableColumnsType>
        columns={expandColumns}
        dataSource={trainSignalRecordsWithKey}
        pagination={false}
      />
    );
  };

  return (
    <Table<CheciRowType>
      rowKey="trainNumber"
      columns={columns}
      expandable={{ expandedRowRender }}
      dataSource={checiRows}
      pagination={false}
    />
  );
};

export default CheciTable;
