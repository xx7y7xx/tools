import { useState } from 'react';

import { Col, Collapse, CollapseProps, Input, Row, Segmented } from 'antd';

import { StationToTrainMapType } from './types';
import { renderCollapseItem } from './helpers';

const mmap: { [key: string]: string } = {
  出发: 'from',
  到达: 'to',
};

const SearchResult = ({
  value,
  stationMap,
  fromOrTo,
}: {
  value: string;
  stationMap: StationToTrainMapType;
  fromOrTo: string;
}) => {
  if (!value) {
    return null;
  }

  const trains = stationMap[`${mmap[fromOrTo]}:${value}`] || [];

  const timeKey = fromOrTo === '出发' ? 'departureTime' : 'arrivalTime';

  const searchResultItems: CollapseProps['items'] = trains
    .sort((a, b) => a[timeKey].localeCompare(b[timeKey]))
    .map(
      renderCollapseItem({
        collapseItemLabel: (trainFullInfo) =>
          `${trainFullInfo.trainNumber} ${trainFullInfo[timeKey]} ${trainFullInfo.fromStation} - ${trainFullInfo.toStation}`,
      })
    );

  return (
    <div className='pm-search-result'>
      <Collapse items={searchResultItems} defaultActiveKey={['1']} />
    </div>
  );
};

const SearchByStation = ({
  stationMap,
}: {
  stationMap: StationToTrainMapType;
}) => {
  const [value, setValue] = useState('');
  const [fromOrTo, setFromOrTo] = useState('出发');

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
          <Segmented
            options={['出发', '到达']}
            onChange={(value) => {
              setFromOrTo(value);
            }}
          />
        </Col>
        <Col span={8}></Col>
      </Row>
      <SearchResult stationMap={stationMap} value={value} fromOrTo={fromOrTo} />
    </div>
  );
};

export default SearchByStation;
