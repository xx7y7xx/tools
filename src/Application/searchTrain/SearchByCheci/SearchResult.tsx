import { Collapse, CollapseProps } from 'antd';

import { searchTrainByNum } from '../../helpers/trainHelpers';
import { getTrainType } from '../trainHelpers';
import CheciInfo from './CheciInfo';

const renderCollapseItem =
  (props?: { collapseItemLabel?: (checi: string) => string }) =>
  (checi: string) => {
    if (!props) {
      props = {};
    }
    if (!props.collapseItemLabel) {
      props.collapseItemLabel = (checi: string) => `${checi}`;
    }

    return {
      key: checi,
      label: props.collapseItemLabel(checi),
      children: (
        <div>
          <CheciInfo checi={checi} />
          Additional Info:
          <br />
          {getTrainType(checi)}
        </div>
      ),
    };
  };

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
    <div className="xxtools-search-by-checi-search-result">
      <Collapse items={searchResultItems} defaultActiveKey={['1']} />
    </div>
  );
};

export default SearchResult;
