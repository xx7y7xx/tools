import { RawPocsagRow, TrainSignalRecord } from './types';
import MileageChart from './MileageChart';
import SpeedChart from './SpeedChart';
import TrainSlider from './TrainSlider';
import CodeSpeedMileageTable from './CodeSpeedMileageTable';

/**
 * Show the detail of a train's checi
 * Show an animation of the handler on slider
 */
const CheciDetail = ({
  trainSignalRecords,
  rawPocsagRows,
}: {
  trainSignalRecords: TrainSignalRecord[];
  rawPocsagRows: RawPocsagRow[];
}) => {
  return (
    <div>
      <TrainSlider trainSignalRecords={trainSignalRecords} />
      <MileageChart trainSignalRecords={trainSignalRecords} />
      <SpeedChart trainSignalRecords={trainSignalRecords} />
      <CodeSpeedMileageTable
        trainSignalRecords={trainSignalRecords}
        rawPocsagRows={rawPocsagRows}
      />
    </div>
  );
};

export default CheciDetail;
