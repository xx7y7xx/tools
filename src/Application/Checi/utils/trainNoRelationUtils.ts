import { HistoricalTrainsData, FullTrainInfo } from '../../services/trainsData';

export type FieldType = keyof Pick<
  FullTrainInfo,
  'operateGroup' | 'trainNumber' | 'fromStation' | 'toStation' | 'trainType'
>;

export interface TrainNoRelation {
  trainNo: string;
  fieldValue: string;
  count: number;
  percentage: number;
  uniqueTrainCodes: number;
  totalNum: number;
}

export interface AnalysisStats {
  totalTrains: number;
  uniqueTrainNos: number;
  uniqueFieldValues: number;
  mostCommonFieldValue: string;
  mostCommonTrainNo: string;
}

/**
 * Analyzes the relationship between train numbers and selected field values
 * @param historicalData - Historical trains data
 * @param trainsFullInfo - Full train information data
 * @param selectedField - The field to analyze (operateGroup, trainNumber, etc.)
 * @returns Array of train number relations with statistics
 */
export const analyzeTrainNoRelations = (
  historicalData: HistoricalTrainsData,
  trainsFullInfo: Record<string, FullTrainInfo>,
  selectedField: FieldType
): TrainNoRelation[] => {
  const relationMap: Record<
    string,
    {
      count: number;
      trainCodes: Set<string>;
      totalNum: number;
    }
  > = {};
  let totalCount = 0;

  // 遍历所有历史数据
  Object.entries(historicalData).forEach(([date, trains]) => {
    Object.entries(trains).forEach(([trainCode, trainInfo]) => {
      const fieldValue = trainsFullInfo[trainCode]?.[selectedField] || '未知';

      if (!relationMap[fieldValue]) {
        relationMap[fieldValue] = {
          count: 0,
          trainCodes: new Set(),
          totalNum: 0,
        };
      }

      relationMap[fieldValue].count++;
      relationMap[fieldValue].trainCodes.add(trainInfo.station_train_code);
      relationMap[fieldValue].totalNum += parseInt(trainInfo.total_num);
      totalCount++;
    });
  });

  // 转换为数组并计算百分比
  return Object.entries(relationMap).map(([fieldValue, data]) => {
    return {
      trainNo: '', // 不再需要trainNo
      fieldValue,
      count: data.count,
      percentage: (data.count / totalCount) * 100,
      uniqueTrainCodes: data.trainCodes.size,
      totalNum: data.totalNum,
    };
  });
};

/**
 * Calculates statistics from the analysis results
 * @param results - Array of train number relations
 * @returns Analysis statistics
 */
export const calculateStats = (results: TrainNoRelation[]): AnalysisStats => {
  const uniqueTrainNos = new Set(results.map((r) => r.trainNo));
  const uniqueFieldValues = new Set(results.map((r) => r.fieldValue));

  // 找出最常见的字段值
  const fieldValueCounts = results.reduce((acc, curr) => {
    acc[curr.fieldValue] = (acc[curr.fieldValue] || 0) + curr.count;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonFieldValue = Object.entries(fieldValueCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  // 找出最常见的车次号
  const trainNoCounts = results.reduce((acc, curr) => {
    acc[curr.trainNo] = (acc[curr.trainNo] || 0) + curr.count;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonTrainNo = Object.entries(trainNoCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  return {
    totalTrains: results.length,
    uniqueTrainNos: uniqueTrainNos.size,
    uniqueFieldValues: uniqueFieldValues.size,
    mostCommonFieldValue,
    mostCommonTrainNo,
  };
};

/**
 * Generates chart data for visualization (pure, no style)
 * @param analysisResults - Array of train number relations
 * @returns Chart data object for react-chartjs-2 (labels and data arrays only)
 */
export const generateChartData = (analysisResults: TrainNoRelation[]) => {
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
