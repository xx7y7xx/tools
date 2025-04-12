import { TrainSignalRecord } from './types';
import MileageChart from './MileageChart';
import SpeedChart from './SpeedChart';
import TrainSlider from './TrainSlider';
/**
 * Show the detail of a train's checi
 * Show an animation of the handler on slider
 */
const CheciDetail = ({
  trainSignalRecords,
}: {
  trainSignalRecords: TrainSignalRecord[];
}) => {
  return (
    <div>
      <TrainSlider trainSignalRecords={trainSignalRecords} />
      <MileageChart trainSignalRecords={trainSignalRecords} />
      <SpeedChart trainSignalRecords={trainSignalRecords} />
    </div>
  );
};

export default CheciDetail;
