import { Descriptions, DescriptionsProps } from 'antd';
import { renderDescriptionsItem } from '../helpers';
import { TrainFullInfoType } from '../types';

const CheciInfoDescriptions = ({
  trainFullInfo,
}: {
  trainFullInfo: TrainFullInfoType;
}) => {
  const trainFullInfoItems: DescriptionsProps['items'] = Object.keys(
    trainFullInfo
  ).map(renderDescriptionsItem(trainFullInfo));

  return (
    <div>
      <Descriptions items={trainFullInfoItems} bordered />
    </div>
  );
};

export default CheciInfoDescriptions;
