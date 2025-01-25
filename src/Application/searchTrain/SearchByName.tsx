import { useState } from 'react';

import {
  Checkbox,
  CheckboxProps,
  Col,
  Collapse,
  CollapseProps,
  Input,
  Row,
} from 'antd';

import { TrainsFullInfoMapType } from './types';
import { searchTrainByNum } from '../helpers/trainHelpers';
import { renderCollapseItem } from './helpers';

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
      .map((trainNumber) => trainsFullInfoMap[trainNumber])
      .map(renderCollapseItem());

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
