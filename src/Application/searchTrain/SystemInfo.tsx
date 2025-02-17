import { Col, Row } from 'antd';
import { TrainFullInfoType } from './types';

/**
 * System info
 * Render aggregated info by trainType, operateGroup, trainCategory
 * @param rawTrains all trains info
 * @returns
 */
const SystemInfo = ({ rawTrains }: { rawTrains: TrainFullInfoType[] }) => {
  const trainTypeMap = {} as Record<string, number>;
  const operateGroupMap = {} as Record<string, number>;
  const trainCategoryMap = {} as Record<string, number>;

  rawTrains.forEach((train) => {
    trainTypeMap[train.trainType] = (trainTypeMap[train.trainType] || 0) + 1;
    operateGroupMap[train.operateGroup] =
      (operateGroupMap[train.operateGroup] || 0) + 1;
    trainCategoryMap[train.trainCategory] =
      (trainCategoryMap[train.trainCategory] || 0) + 1;
  });

  return (
    <Row>
      <Col xs={24} sm={12} md={8}>
        <div>
          <h2>Train Type</h2>
          <ul>
            {Object.entries(trainTypeMap)
              .sort()
              .map(([trainType, count]) => (
                <li key={trainType}>
                  {trainType} - {count}
                </li>
              ))}
          </ul>
        </div>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <div>
          <h2>Operate Group</h2>
          <ul>
            {Object.entries(operateGroupMap)
              .sort()
              .map(([operateGroup, count]) => (
                <li key={operateGroup}>
                  {operateGroup} - {count}
                </li>
              ))}
          </ul>
        </div>
      </Col>
      <Col xs={24} sm={12} md={8}>
        <div>
          <h2>Train Category</h2>
          <ul>
            {Object.entries(trainCategoryMap)
              .sort()
              .map(([trainCategory, count]) => (
                <li key={trainCategory}>
                  {trainCategory} - {count}
                </li>
              ))}
          </ul>
        </div>
      </Col>
    </Row>
  );
};

export default SystemInfo;
