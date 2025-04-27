import { useState } from 'react';

import { Checkbox, CheckboxProps, Col, Input, Row } from 'antd';

import SearchResult from './SearchResult';
import { useTrains } from '../../context/TrainsContext';

const SearchByCode = () => {
  const { date } = useTrains();

  const [value, setValue] = useState('');
  const [isExactMatch, setIsExactMatch] = useState(true);
  const onChange: CheckboxProps['onChange'] = (e) => {
    setIsExactMatch(e.target.checked);
  };

  return (
    <div>
      <Row>
        <Col span={8}>{date}</Col>
        <Col span={10}>
          <Input
            size="large"
            placeholder="Search trains"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <Checkbox checked={isExactMatch} onChange={onChange}>
            Exactly Match
          </Checkbox>
        </Col>
      </Row>
      <SearchResult isExactMatch={isExactMatch} value={value} />
      <div>
        时刻表:{' '}
        <a
          href="https://kyfw.12306.cn/otn/queryTrainInfo/init"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://kyfw.12306.cn/otn/queryTrainInfo/init
        </a>
      </div>
    </div>
  );
};

export default SearchByCode;
