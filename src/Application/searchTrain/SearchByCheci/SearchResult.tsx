import { Collapse, CollapseProps } from 'antd';

import { searchTrainByNum } from '../../helpers/trainHelpers';
import { renderCollapseItem } from './helpers';

const SearchResult = ({
  isExactMatch,
  value,
  checis,
}: {
  isExactMatch: boolean;
  value: string;
  checis: string[];
}) => {
  if (!value) {
    return null;
  }

  const searchResultItems: CollapseProps['items'] = checis
    .filter((checi) => {
      return searchTrainByNum(isExactMatch, checi, value);
    })
    .map(renderCollapseItem());

  return (
    <div className="rwtool-search-by-checi-search-result">
      <Collapse items={searchResultItems} defaultActiveKey={['1']} />
    </div>
  );
};

export default SearchResult;
