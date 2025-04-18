import { ParsedPocsagRow, TrainSignalRecord } from './types';
import MileageChart from './MileageChart';
import SpeedChart from './SpeedChart';
import TrainSlider from './TrainSlider';
import CodeSpeedMileageTable from './CodeSpeedMileageTable';
import TimeRangeFilter from './TimeRangeFilter';
import { TimeRangeProvider } from './TimeRangeContext';

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
    <TimeRangeProvider
      trainSignalRecords={trainSignalRecords}
      parsedPocsagRows={parsedPocsagRows}
    >
      <div>
        <TimeRangeFilter />
        <TrainSlider />
        <MileageChart />
        <SpeedChart />
        <CodeSpeedMileageTable />
      </div>
    </TimeRangeProvider>
  );
};

export default CheciDetail;
