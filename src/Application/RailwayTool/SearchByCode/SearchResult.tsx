import { Collapse, CollapseProps } from 'antd';

import { searchTrainByNum } from '../../helpers/trainHelpers';
import { renderCollapseItem } from '../helpers';
import { useTrains } from '../../context/TrainsContext';

const SearchResult = ({
  isExactMatch,
  value,
}: {
  isExactMatch: boolean;
  value: string;
}) => {
  const { trainsFullInfoMap } = useTrains();

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
    <div className="pm-search-result">
      <Collapse items={searchResultItems} defaultActiveKey={['1']} />
    </div>
  );
};

export default SearchResult;
