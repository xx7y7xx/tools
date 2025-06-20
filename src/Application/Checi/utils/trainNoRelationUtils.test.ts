import {
  aggregateTrainsByField,
  summarizeAggregationStats,
} from './trainNoRelationUtils';
import { mockHistoricalData, mockTrainsFullInfo } from './mockTrainData';

describe('aggregateTrainsByField', () => {
  it('should aggregate trains by operateGroup correctly', () => {
    const result = aggregateTrainsByField(
      mockHistoricalData,
      mockTrainsFullInfo,
      'operateGroup'
    );

    // Sort results by fieldValue for consistent ordering
    const sortedResult = result.sort((a, b) =>
      a.fieldValue.localeCompare(b.fieldValue)
    );

    // Round percentages to 2 decimal places to avoid floating-point precision issues
    const normalizedResult = sortedResult.map((item) => ({
      ...item,
      percentage: Math.round(item.percentage * 100) / 100,
    }));

    expect(normalizedResult).toEqual([
      {
        trainNo: '',
        fieldValue: '上海局',
        count: 2,
        percentage: 16.67,
        uniqueTrainCodes: 2,
        totalNum: 42, // 20 + 22
      },
      {
        trainNo: '',
        fieldValue: '南宁局',
        count: 2,
        percentage: 16.67,
        uniqueTrainCodes: 2,
        totalNum: 8, // 4 + 4
      },
      {
        trainNo: '',
        fieldValue: '呼和浩特局',
        count: 2,
        percentage: 16.67,
        uniqueTrainCodes: 2,
        totalNum: 25, // 14 + 11
      },
      {
        trainNo: '',
        fieldValue: '哈尔滨局',
        count: 4,
        percentage: 33.33,
        uniqueTrainCodes: 4,
        totalNum: 33, // 4 + 2 + 14 + 13
      },
      {
        trainNo: '',
        fieldValue: '济南局',
        count: 2,
        percentage: 16.67,
        uniqueTrainCodes: 2,
        totalNum: 14, // 6 + 8
      },
    ]);
  });

  it('should aggregate trains by trainNumber correctly', () => {
    const result = aggregateTrainsByField(
      mockHistoricalData,
      mockTrainsFullInfo,
      'trainNumber'
    );

    // Sort results by fieldValue for consistent ordering
    const sortedResult = result.sort((a, b) =>
      a.fieldValue.localeCompare(b.fieldValue)
    );

    // Round percentages to 2 decimal places to avoid floating-point precision issues
    const normalizedResult = sortedResult.map((item) => ({
      ...item,
      percentage: Math.round(item.percentage * 100) / 100,
    }));

    expect(normalizedResult).toEqual([
      {
        trainNo: '',
        fieldValue: '1461',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 20,
      },
      {
        trainNo: '',
        fieldValue: '1462',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 22,
      },
      {
        trainNo: '',
        fieldValue: '2635',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 14,
      },
      {
        trainNo: '',
        fieldValue: '2636',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 11,
      },
      {
        trainNo: '',
        fieldValue: '4016',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 4,
      },
      {
        trainNo: '',
        fieldValue: '4017',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 2,
      },
      {
        trainNo: '',
        fieldValue: '4051',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 14,
      },
      {
        trainNo: '',
        fieldValue: '4052',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 13,
      },
      {
        trainNo: '',
        fieldValue: '5036/5037',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 6,
      },
      {
        trainNo: '',
        fieldValue: '5038/5035',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 8,
      },
      {
        trainNo: '',
        fieldValue: '5511',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 4,
      },
      {
        trainNo: '',
        fieldValue: '5512',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 4,
      },
    ]);
  });

  it('should return empty array for empty input', () => {
    const result = aggregateTrainsByField({}, {}, 'operateGroup');
    expect(result).toEqual([]);
  });

  it('should handle trains with missing operateGroup field', () => {
    const trainsWithMissingField = {
      ...mockHistoricalData,
      '2025-04-01': {
        ...mockHistoricalData['2025-04-01'],
        '9999': {
          from_station: '北京',
          station_train_code: '9999',
          to_station: '上海',
          total_num: '10',
          train_no: '999999999999',
        },
      },
    };

    const trainsFullInfoWithMissingField = {
      ...mockTrainsFullInfo,
      '9999': {
        ...mockTrainsFullInfo['1461'],
        operateGroup: undefined as any,
      },
    };

    const result = aggregateTrainsByField(
      trainsWithMissingField,
      trainsFullInfoWithMissingField,
      'operateGroup'
    );

    // Should include the undefined operateGroup as '未知'
    const unknownGroup = result.find((r) => r.fieldValue === '未知');
    expect(unknownGroup).toBeDefined();
    expect(unknownGroup?.count).toBe(1);
  });
});

describe('summarizeAggregationStats', () => {
  it('should calculate summary statistics correctly', () => {
    const aggregationStats = [
      {
        trainNo: '',
        fieldValue: '上海局',
        count: 2,
        percentage: 16.67,
        uniqueTrainCodes: 2,
        totalNum: 42,
      },
      {
        trainNo: '',
        fieldValue: '呼和浩特局',
        count: 1,
        percentage: 8.33,
        uniqueTrainCodes: 1,
        totalNum: 14,
      },
      {
        trainNo: '',
        fieldValue: '哈尔滨局',
        count: 3,
        percentage: 25.0,
        uniqueTrainCodes: 3,
        totalNum: 20,
      },
    ];

    const result = summarizeAggregationStats(aggregationStats);

    expect(result).toEqual({
      totalGroups: 3,
      uniqueTrainNumbers: 1, // All trainNo are empty strings
      uniqueGroups: 3,
      mostCommonGroup: '哈尔滨局', // Has highest count (3)
      mostCommonTrainNumber: '', // All trainNo are empty strings
    });
  });

  it('should handle empty aggregation stats', () => {
    const result = summarizeAggregationStats([]);

    expect(result).toEqual({
      totalGroups: 0,
      uniqueTrainNumbers: 0,
      uniqueGroups: 0,
      mostCommonGroup: '',
      mostCommonTrainNumber: '',
    });
  });

  it('should handle single group correctly', () => {
    const singleGroupStats = [
      {
        trainNo: '',
        fieldValue: '上海局',
        count: 2,
        percentage: 100.0,
        uniqueTrainCodes: 2,
        totalNum: 42,
      },
    ];

    const result = summarizeAggregationStats(singleGroupStats);

    expect(result).toEqual({
      totalGroups: 1,
      uniqueTrainNumbers: 1, // All trainNo are empty strings
      uniqueGroups: 1,
      mostCommonGroup: '上海局',
      mostCommonTrainNumber: '',
    });
  });
});
