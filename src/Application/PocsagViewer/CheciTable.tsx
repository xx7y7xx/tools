import type { TableColumnsType } from 'antd';
import { Table } from 'antd';

import {
  ParsedPocsagRow,
  ParsedPocsagPayload1234002,
  TrainSignalRecord,
} from './types';
import GoogleMapLink from './GoogleMapLink';

interface CheciRowType {
  trainNumber: number;
  infoLength: number;
}

export type ExtendedTableColumnsType = {
  key: string;
  timestamp: string;
  trainNumber: number;
  speed: number;
  mileage: number;
  _related1234002Row?: ParsedPocsagRow;
};

export const expandColumns: TableColumnsType<ExtendedTableColumnsType> = [
  { title: 'Key', dataIndex: 'key', key: 'key' },
  { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
  { title: 'TrainNumber', dataIndex: 'trainNumber', key: 'trainNumber' },
  { title: 'Speed', dataIndex: 'speed', key: 'speed' },
  { title: 'Mileage', dataIndex: 'mileage', key: 'mileage' },
  {
    title: 'Related 1234002 Row',
    dataIndex: '_related1234002Row',
    key: '_related1234002Row',
    render: (related1234002Row: ParsedPocsagRow | null) => {
      if (!related1234002Row) {
        return 'Related 1234002 row not found';
      }
      const payload =
        related1234002Row.messagePayload as ParsedPocsagPayload1234002;
      return (
        <div>
          <GoogleMapLink wgs84Str={payload.wgs84Str || ''} /> Raw:{' '}
          <code>{related1234002Row.rawSignal.message_content}</code>
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
  parsedPocsagRows,
}: {
  trainSignalRecordsMap: Record<string, TrainSignalRecord[]>;
  parsedPocsagRows: ParsedPocsagRow[];
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
        return {
          key: idx.toString(),
          timestamp: record.timestamp,
          trainNumber: record.payload.trainNumber,
          speed: record.payload.speed,
          mileage: record.payload.mileage,
          _related1234002Row: record._related1234002Row,
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
