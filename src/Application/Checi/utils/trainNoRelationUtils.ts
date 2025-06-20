import { HistoricalTrainsData, FullTrainInfo } from '../../services/trainsData';

export type FieldType = keyof Pick<
  FullTrainInfo,
  'operateGroup' | 'trainNumber' | 'fromStation' | 'toStation' | 'trainType'
>;

export type FullTrainInfoMap = Record<string, FullTrainInfo>;

export interface FieldAggregationStats {
  /**
   * Train number (车次号) - currently not used in analysis
   * Originally intended to store the train number, but set to empty string in current implementation
   * Example: 'G1', 'G2', 'G3'
   */
  trainNo: string;

  /**
   * The value of the selected field being analyzed
   * Extracted from trainsFullInfo[trainCode]?.[selectedField] or defaults to 'Unknown' if not found
   * Examples: '北京局' (operateGroup), 'G1' (trainNumber), '北京南' (fromStation), '上海虹桥' (toStation), '高铁' (trainType)
   */
  fieldValue: string;

  /**
   * Number of times this field value appears in the historical data
   * Incremented each time a train with this field value is encountered across all dates
   * Example: If '北京局' appears in 2 different train records, count = 2
   */
  count: number;

  /**
   * Percentage of total occurrences this field value represents
   * Calculated as: (count / totalCount) * 100
   * Example: If total count is 4 and this field value appears 2 times, percentage = 50
   */
  percentage: number;

  /**
   * Number of unique train codes (station_train_code) associated with this field value
   * Calculated as the size of the Set containing all unique station_train_code values
   * Example: If '北京局' operates trains G1 and G2, then uniqueTrainCodes = 2
   */
  uniqueTrainCodes: number;

  /**
   * Sum of all total_num values for trains with this field value
   * Accumulated by adding parseInt(trainInfo.total_num) for each occurrence
   * Example: If '北京局' trains have total_num of '100' and '120', then totalNum = 220
   */
  totalNum: number;
}

export interface AggregationSummaryStats {
  /**
   * Total number of groups in the aggregation results
   * Example: If aggregating by operateGroup and there are 3 bureaus, totalGroups = 3
   * Example: If aggregating by trainNumber and there are 3 train numbers, totalGroups = 3
   */
  totalGroups: number;

  /**
   * Number of unique train numbers across all groups
   * Note: Since trainNo is usually empty in current implementation, this is typically 0 or 1
   * Example: If aggregating by trainNumber and there are 3 train numbers, uniqueTrainNumbers = 3
   */
  uniqueTrainNumbers: number;

  /**
   * Number of unique field values (groups) in the aggregation
   * Example: If aggregating by operateGroup and there are 3 unique bureaus, uniqueGroups = 3
   * Example: If aggregating by trainNumber and there are 3 unique train numbers, uniqueGroups = 3
   */
  uniqueGroups: number;

  /**
   * The field value (group) with the highest total count across all groups
   * Example: If 北京局 has the most train records, mostCommonGroup = '北京局'
   * Example: If G1 has the most train records, mostCommonGroup = 'G1'
   */
  mostCommonGroup: string;

  /**
   * The train number with the highest total count across all groups
   * Note: Since trainNo is usually empty in current implementation, this is typically empty string
   * Example: If G1 has the most train records, mostCommonTrainNumber = 'G1'
   */
  mostCommonTrainNumber: string;
}

/**
 * Aggregates train data by a selected field and calculates statistics for each group
 * @param historicalData - Historical trains data
 * @param trainsFullInfo - Full train information data
 * @param selectedField - The field to group by (operateGroup, trainNumber, etc.)
 * @returns Array of aggregated train statistics grouped by field value
 */
export const aggregateTrainsByField = (
  historicalData: HistoricalTrainsData,
  trainsFullInfo: FullTrainInfoMap,
  selectedField: FieldType
): FieldAggregationStats[] => {
  // Map to store aggregated data for each field value
  const relationMap: Record<
    string,
    {
      count: number; // Number of train records for this field value
      trainCodes: Set<string>; // Unique train codes for this field value
      totalNum: number; // Sum of total_num values for this field value
    }
  > = {};
  let totalCount = 0; // Total number of train records across all field values

  // Iterate through all historical data to aggregate by field value
  Object.entries(historicalData).forEach(([date, trains]) => {
    Object.entries(trains).forEach(([trainCode, trainInfo]) => {
      // Get the field value for this train, default to 'Unknown' if not found
      const fieldValue =
        trainsFullInfo[trainCode]?.[selectedField] || 'Unknown';

      // Initialize aggregation data for this field value if it doesn't exist
      if (!relationMap[fieldValue]) {
        relationMap[fieldValue] = {
          count: 0,
          trainCodes: new Set(),
          totalNum: 0,
        };
      }

      // Aggregate statistics for this field value
      relationMap[fieldValue].count++; // Increment record count
      relationMap[fieldValue].trainCodes.add(trainInfo.station_train_code); // Add unique train code
      relationMap[fieldValue].totalNum += parseInt(trainInfo.total_num); // Sum total numbers
      totalCount++; // Increment total count
    });
  });

  // Convert aggregated data to result array with calculated percentages
  return Object.entries(relationMap).map(([fieldValue, data]) => {
    return {
      trainNo: '', // Not used in current implementation
      fieldValue,
      count: data.count,
      percentage: (data.count / totalCount) * 100, // Calculate percentage of total
      uniqueTrainCodes: data.trainCodes.size, // Count of unique train codes
      totalNum: data.totalNum, // Sum of total numbers
    };
  });
};

/**
 * Summarizes meta-statistics from an array of field aggregation stats
 * @param results - Array of field aggregation stats (one per group)
 * @returns Summary statistics across all groups
 */
export const summarizeAggregationStats = (
  results: FieldAggregationStats[]
): AggregationSummaryStats => {
  // Handle empty results
  if (results.length === 0) {
    return {
      totalGroups: 0,
      uniqueTrainNumbers: 0,
      uniqueGroups: 0,
      mostCommonGroup: '',
      mostCommonTrainNumber: '',
    };
  }

  const uniqueTrainNos = new Set(results.map((r) => r.trainNo));
  const uniqueFieldValues = new Set(results.map((r) => r.fieldValue));

  // Find the most common field value
  const fieldValueCounts = results.reduce((acc, curr) => {
    acc[curr.fieldValue] = (acc[curr.fieldValue] || 0) + curr.count;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonFieldValue = Object.entries(fieldValueCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  // Find the most common train number
  const trainNoCounts = results.reduce((acc, curr) => {
    acc[curr.trainNo] = (acc[curr.trainNo] || 0) + curr.count;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonTrainNo = Object.entries(trainNoCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  return {
    totalGroups: results.length,
    uniqueTrainNumbers: uniqueTrainNos.size,
    uniqueGroups: uniqueFieldValues.size,
    mostCommonGroup: mostCommonFieldValue,
    mostCommonTrainNumber: mostCommonTrainNo,
  };
};

/**
 * Generates chart data for visualization (pure, no style)
 * @param analysisResults - Array of train number relations
 * @returns Chart data object for react-chartjs-2 (labels and data arrays only)
 */
export const generateChartData = (analysisResults: FieldAggregationStats[]) => {
  // 按计数排序并只取前20个
  const sortedResults = [...analysisResults]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    labels: sortedResults.map((r) => `[${r.fieldValue}]`),
    data: {
      count: sortedResults.map((r) => r.count),
      uniqueTrainCodes: sortedResults.map((r) => r.uniqueTrainCodes),
      totalNum: sortedResults.map((r) => r.totalNum),
    },
  };
};
