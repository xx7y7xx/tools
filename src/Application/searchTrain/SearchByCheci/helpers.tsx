import { getTrainType } from '../trainHelpers';

export const renderCollapseItem =
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
          Additional Info:
          <br />
          {getTrainType(checi)}
        </div>
      ),
    };
  };

export const renderDescriptionsItem = (checi: string) => (key: string) => {
  return {
    key,
    label: key,
    children: <div>{checi}</div>,
  };
};
