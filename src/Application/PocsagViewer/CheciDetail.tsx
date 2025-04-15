import { ParsedPocsagRow, TrainSignalRecord } from './types';
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
  parsedPocsagRows,
}: {
  trainSignalRecords: TrainSignalRecord[];
  parsedPocsagRows: ParsedPocsagRow[];
}) => {
  return (
    <div>
      <TrainSlider trainSignalRecords={trainSignalRecords} />
      <MileageChart trainSignalRecords={trainSignalRecords} />
      <SpeedChart trainSignalRecords={trainSignalRecords} />
      <CodeSpeedMileageTable
        trainSignalRecords={trainSignalRecords}
        parsedPocsagRows={parsedPocsagRows}
      />
    </div>
  );
};

export default CheciDetail;
