import { Descriptions, DescriptionsProps } from 'antd';

import { dateCheciType } from '../types';
import { getTrainType } from '../trainHelpers';

export const renderCollapseItem =
  (props?: { collapseItemLabel?: (dateCheci: dateCheciType) => string }) =>
  (dateCheci: dateCheciType) => {
    if (!props) {
      props = {};
    }
    if (!props.collapseItemLabel) {
      props.collapseItemLabel = (dateCheci: dateCheciType) =>
        `${dateCheci.checi}`;
    }

    const trainFullInfoItems: DescriptionsProps['items'] =
      dateCheci.dateCheci.map((checi) => ({
        key: 'checi',
        label: `${checi.date}`,
        children: (
          <div>
            <div>
              {checi.from_station} ~ {checi.to_station}
            </div>
            <div>total_num: {checi.total_num}</div>
            <div>train_no: {checi.train_no}</div>
          </div>
        ),
      }));

    return {
      key: dateCheci.checi,
      label: props.collapseItemLabel(dateCheci),
      children: (
        <div>
          <Descriptions
            // title="Train Full Info"
            items={trainFullInfoItems}
            bordered
          />
          Additional Info:
          <br />
          {getTrainType(dateCheci.checi)}
        </div>
      ),
    };
  };

export const renderDescriptionsItem =
  (dateCheci: dateCheciType) => (key: string) => {
    return {
      key,
      label: key,
      children: (
        <div>
          {dateCheci.dateCheci.map((checi) => (
            <div key={checi.date}>{checi.date}</div>
          ))}
        </div>
      ),
    };
  };
