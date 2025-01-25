import { Descriptions, DescriptionsProps } from 'antd';
import { TrainFullInfoType } from './types';

export const fullInfoKeyToName: { [key: string]: string } = {
  operateGroup: '担当路局',
  trainCategory: '列车型号',
  trainNumber: '车次',
  runTime: '运行时间',
  fromStation: '始发站',
  toStation: '到达站',
  departureTime: '发车时间',
  arrivalTime: '到站时间',
  trainType: '列车类型',
  distance: '里程',

  // 未知字段定义
  // total_num: '?总数',
  // train_no: '?列车号',
};

export const renderDescriptionsItem =
  (trainFullInfo: TrainFullInfoType) => (key: string) => {
    const renderChildren = () => {
      const val = trainFullInfo[key as 'operateGroup'];
      switch (key) {
        case 'trainNumber':
          return (
            <a
              href={`https://shike.gaotie.cn/checi.asp?CheCi=${val}`}
              target='_blank'
              rel='noreferrer'
            >
              {val}
            </a>
          );
        case 'operateGroup':
          return (
            <a
              href={`https://zh.wikipedia.org/wiki/中国铁路${val}集团`}
              target='_blank'
              rel='noreferrer'
            >
              {val}
            </a>
          );
        default:
          return val;
      }
    };
    return {
      key,
      label: fullInfoKeyToName[key] || key,
      children: renderChildren(),
    };
  };

export const renderCollapseItem =
  (props?: {
    collapseItemLabel?: (trainFullInfo: TrainFullInfoType) => string;
  }) =>
  (trainFullInfo: TrainFullInfoType) => {
    if (!props) {
      props = {};
    }
    if (!props.collapseItemLabel) {
      props.collapseItemLabel = (trainFullInfo: TrainFullInfoType) =>
        `${trainFullInfo.trainNumber} ${trainFullInfo.fromStation} - ${trainFullInfo.toStation}`;
    }

    const trainFullInfoItems: DescriptionsProps['items'] = Object.keys(
      trainFullInfo
    ).map(renderDescriptionsItem(trainFullInfo));

    return {
      key: trainFullInfo.trainNumber,
      label: props.collapseItemLabel(trainFullInfo),
      children: (
        <Descriptions
          // title='Train Full Info'
          items={trainFullInfoItems}
          bordered
        />
      ),
    };
  };
