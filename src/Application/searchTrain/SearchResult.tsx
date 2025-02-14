import { Collapse, CollapseProps } from "antd";

import { TrainsFullInfoMapType } from "./types";
import { searchTrainByNum } from "../helpers/trainHelpers";
import { renderCollapseItem } from "./helpers";

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

  const searchResultItems: CollapseProps["items"] =
    trainsFullInfoMap &&
    Object.keys(trainsFullInfoMap)
      .filter((trainNumber) => {
        return searchTrainByNum(isExactMatch, trainNumber, value);
      })
      .map((trainNumber) => trainsFullInfoMap[trainNumber])
      .map(renderCollapseItem());

  return (
    <div className="pm-search-result">
      <Collapse items={searchResultItems} defaultActiveKey={["1"]} />
    </div>
  );
};

export default SearchResult;
