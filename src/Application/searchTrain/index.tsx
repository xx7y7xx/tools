import {
  Checkbox,
  CheckboxProps,
  Col,
  Collapse,
  CollapseProps,
  Descriptions,
  DescriptionsProps,
  Input,
  Row,
} from 'antd';
import { useState } from 'react';
import {
  DataKey,
  GlobalTrainsMapType,
  TrainsFullInfoMapDataKey,
  TrainsFullInfoType,
  TrainsMapType,
} from './types';
import { searchTrainByNum } from '../helpers/trainHelpers';

// TODO how to make global use
// 扩展 Window 接口
declare global {
  interface Window {
    PM_trainsMap: GlobalTrainsMapType;
  }
}
window.PM_trainsMap = window.PM_trainsMap || {};

const fullInfoKeyToName: { [key: string]: string } = {
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
};

const SearchResult = ({
  isExactMatch,
  value,
  trainsMap,
  trainsFullInfoMap,
}: {
  isExactMatch: boolean;
  value: string;
  trainsMap: TrainsMapType;
  trainsFullInfoMap: TrainsFullInfoType;
}) => {
  if (!value) {
    return null;
  }

  const searchResultItems: CollapseProps['items'] =
    trainsMap &&
    Object.keys(trainsMap)
      .filter((trainNumber) => {
        return searchTrainByNum(isExactMatch, trainNumber, value);
      })
      .filter((trainNumber) => {
        if (!trainsFullInfoMap[trainNumber]) {
          console.log(
            `trainNumber ${trainNumber} not found in trainsFullInfoMap`
          );
          return false;
        }
        return true;
      })
      .map((trainNumber) => {
        const train = trainsMap[trainNumber];
        const trainFullInfo = trainsFullInfoMap[trainNumber];
        const trainFullInfoItems: DescriptionsProps['items'] = Object.keys(
          trainFullInfo
        ).map((key) => {
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
        });

        return {
          key: trainNumber,
          label: `${trainNumber} ${train.from_station} - ${train.to_station}`,
          children: (
            <Descriptions
              // title='Train Full Info'
              items={trainFullInfoItems}
              bordered
            />
          ),
        };
      });

  return (
    <div className='pm-search-result'>
      <Collapse items={searchResultItems} defaultActiveKey={['1']} />
    </div>
  );
};

const SearchTrain = ({ date }: { date: string }) => {
  const [value, setValue] = useState('');
  const [isExactMatch, setIsExactMatch] = useState(true);
  const onChange: CheckboxProps['onChange'] = (e) => {
    setIsExactMatch(e.target.checked);
  };
  return (
    <div style={{ marginTop: 10 }}>
      <Row>
        <Col span={16}>
          <Input
            placeholder='Search trains'
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <Checkbox checked={isExactMatch} onChange={onChange}>
            Exactly Match
          </Checkbox>
        </Col>
      </Row>
      <SearchResult
        trainsMap={JSON.parse(
          localStorage.getItem(`PM_trainsMap_trainsMap_${date}.json`) || '{}'
        )}
        trainsFullInfoMap={
          window.PM_trainsMap[
            `trainsFullInfoMap_${date}.json` as TrainsFullInfoMapDataKey
          ]
        }
        isExactMatch={isExactMatch}
        value={value}
      />
    </div>
  );
};

export default SearchTrain;
