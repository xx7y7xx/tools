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
import { TrainsFullInfoMapType } from './types';
import { searchTrainByNum } from '../helpers/trainHelpers';

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

  // 未知字段定义
  // total_num: '?总数',
  // train_no: '?列车号',
};

const SearchResult = ({
  isExactMatch,
  value,
  trainsFullInfoMap,
}: {
  isExactMatch: boolean;
  value: string;
  trainsFullInfoMap: TrainsFullInfoMapType;
}) => {
  if (!value) {
    return null;
  }

  const searchResultItems: CollapseProps['items'] =
    trainsFullInfoMap &&
    Object.keys(trainsFullInfoMap)
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
          label: `${trainNumber} ${trainFullInfo.fromStation} - ${trainFullInfo.toStation}`,
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

const SearchByCode = ({
  trainsFullInfoMap,
}: {
  trainsFullInfoMap: TrainsFullInfoMapType;
}) => {
  const [value, setValue] = useState('');
  const [isExactMatch, setIsExactMatch] = useState(true);
  const onChange: CheckboxProps['onChange'] = (e) => {
    setIsExactMatch(e.target.checked);
  };

  return (
    <div>
      <Row>
        <Col span={16}>
          <Input
            size='large'
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
        trainsFullInfoMap={trainsFullInfoMap}
        isExactMatch={isExactMatch}
        value={value}
      />
    </div>
  );
};

export default SearchByCode;
