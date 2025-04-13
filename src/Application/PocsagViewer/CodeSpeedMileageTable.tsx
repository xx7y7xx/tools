import { Table } from 'antd';

import {
  expandColumns,
  ExtendedTableColumnsType,
  getRelated1234002Row,
} from './CheciTable';
import { RawPocsagRow, TrainSignalRecord } from './types';

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
      />
    </div>
  );
};

export default CodeSpeedMileageTable;
