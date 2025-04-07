import { useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import { MetaData, TrainFullInfoType } from './types';
import { getTrainsMetaDataAsync } from '../helpers/trainHelpers';

interface TrainStats {
  trainType: Record<string, number>;
  operateGroup: Record<string, number>;
  trainCategory: Record<string, number>;
}

/**
 * System info component that displays aggregated train statistics
 * Shows breakdowns by train type, operating group, and train category
 */
const SystemInfo = ({ rawTrains }: { rawTrains: TrainFullInfoType[] }) => {
  const [metaData, setMetaData] = useState<MetaData | null>(null);

  useEffect(() => {
    const loadMetaData = async () => {
      const data = await getTrainsMetaDataAsync();
      if (Array.isArray(data) && data.length > 0) {
        setMetaData(data[0]);
      }
    };
    loadMetaData();
  }, []);

  const stats = rawTrains.reduce<TrainStats>(
    (acc, train) => {
      acc.trainType[train.trainType] =
        (acc.trainType[train.trainType] || 0) + 1;
      acc.operateGroup[train.operateGroup] =
        (acc.operateGroup[train.operateGroup] || 0) + 1;
      acc.trainCategory[train.trainCategory] =
        (acc.trainCategory[train.trainCategory] || 0) + 1;
      return acc;
    },
    { trainType: {}, operateGroup: {}, trainCategory: {} }
  );

  const renderStatsList = (data: Record<string, number>, title: string) => (
    <Col xs={24} sm={12} md={8}>
      <div>
        <h2>{title}</h2>
        <ul>
          {Object.entries(data)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, count]) => (
              <li key={key}>
                {key} - {count}
              </li>
            ))}
        </ul>
      </div>
    </Col>
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
        <div>
          <h2>Meta Data</h2>
          <div>{metaData ? JSON.stringify(metaData) : 'Loading...'}</div>
        </div>
      </Col>
      {renderStatsList(stats.trainType, 'Train Type')}
      {renderStatsList(stats.operateGroup, 'Operate Group')}
      {renderStatsList(stats.trainCategory, 'Train Category')}
    </Row>
  );
};

export default SystemInfo;
