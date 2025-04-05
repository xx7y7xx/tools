import { Collapse, CollapseProps } from 'antd';

import { dateCheciType } from '../../searchTrain/types';
import { searchTrainByNum } from '../../helpers/trainHelpers';
import { renderCollapseItem } from './helpers';

const SearchResult = ({
  isExactMatch,
  value,
  dateChecis,
}: {
  isExactMatch: boolean;
  value: string;
  dateChecis: dateCheciType[];
}) => {
  if (!value) {
    return null;
  }

  const searchResultItems: CollapseProps['items'] = dateChecis
    .filter((dateCheci) => {
      return searchTrainByNum(isExactMatch, dateCheci.checi, value);
    })
    .map(renderCollapseItem());

  return (
    <div className="rwtool-search-by-checi-search-result">
      <Collapse items={searchResultItems} defaultActiveKey={['1']} />
    </div>
  );
};

export default SearchResult;
