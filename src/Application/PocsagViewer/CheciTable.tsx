import type { TableColumnsType } from 'antd';
import { Table } from 'antd';

import { TrainSignalRecord } from './types';

interface DataType {
  key: React.Key;
  trainNumber: number;
  infoLength: number;
}

const expandColumns: TableColumnsType<TrainSignalRecord> = [
  { title: 'Key', dataIndex: 'key', key: 'key' },
  { title: 'TrainNumber', dataIndex: 'trainNumber', key: 'trainNumber' },
  { title: 'Speed', dataIndex: 'speed', key: 'speed' },
  { title: 'Mileage', dataIndex: 'mileage', key: 'mileage' },
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

/**
 * PocsagViewer is a web application that allows you to view POCSAG data.
 * It reads the POCSAG data from a CSV file and displays it in a table.
 * It also allows you to filter the data by train number.
 */
const CheciTable = ({
  trainSignalRecordsMap,
}: {
  trainSignalRecordsMap: Record<string, TrainSignalRecord[]>;
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
    const trainSignalRecordsWithKey = trainSignalRecords.map((record, idx) => ({
      ...record,
      key: idx.toString(),
    }));
    return (
      <Table<TrainSignalRecord>
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
