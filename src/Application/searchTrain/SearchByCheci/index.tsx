import { useState } from 'react';
import { Checkbox, CheckboxProps, Col, Input, Row } from 'antd';

import SearchResult from './SearchResult';

const SearchByCheci = () => {
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
            size="large"
            placeholder="Search trains"
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
      <SearchResult isExactMatch={isExactMatch} value={value} />
    </div>
  );
};

export default SearchByCheci;
