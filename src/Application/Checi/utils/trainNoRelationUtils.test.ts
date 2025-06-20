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

    expect(sortedResult).toHaveLength(5);

    // Check each group individually to avoid floating-point precision issues
    const shanghaiGroup = sortedResult.find((r) => r.fieldValue === '上海局');
    expect(shanghaiGroup?.count).toBe(2);
    expect(shanghaiGroup?.percentage).toBeCloseTo(16.67, 1);
    expect(shanghaiGroup?.uniqueTrainCodes).toBe(2);
    expect(shanghaiGroup?.totalNum).toBe(42); // 20 + 22

    const hohhotGroup = sortedResult.find((r) => r.fieldValue === '呼和浩特局');
    expect(hohhotGroup?.count).toBe(2);
    expect(hohhotGroup?.percentage).toBeCloseTo(16.67, 1);
    expect(hohhotGroup?.uniqueTrainCodes).toBe(2);
    expect(hohhotGroup?.totalNum).toBe(25); // 14 + 11

    const harbinGroup = sortedResult.find((r) => r.fieldValue === '哈尔滨局');
    expect(harbinGroup?.count).toBe(4);
    expect(harbinGroup?.percentage).toBeCloseTo(33.33, 1);
    expect(harbinGroup?.uniqueTrainCodes).toBe(4);
    expect(harbinGroup?.totalNum).toBe(33); // 4 + 2 + 14 + 13

    const jinanGroup = sortedResult.find((r) => r.fieldValue === '济南局');
    expect(jinanGroup?.count).toBe(2);
    expect(jinanGroup?.percentage).toBeCloseTo(16.67, 1);
    expect(jinanGroup?.uniqueTrainCodes).toBe(2);
    expect(jinanGroup?.totalNum).toBe(14); // 6 + 8

    const nanningGroup = sortedResult.find((r) => r.fieldValue === '南宁局');
    expect(nanningGroup?.count).toBe(2);
    expect(nanningGroup?.percentage).toBeCloseTo(16.67, 1);
    expect(nanningGroup?.uniqueTrainCodes).toBe(2);
    expect(nanningGroup?.totalNum).toBe(8); // 4 + 4
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

    expect(sortedResult).toHaveLength(12);

    // Check a few key train numbers to avoid floating-point precision issues
    const train1461 = sortedResult.find((r) => r.fieldValue === '1461');
    expect(train1461?.count).toBe(1);
    expect(train1461?.percentage).toBeCloseTo(8.33, 1);
    expect(train1461?.uniqueTrainCodes).toBe(1);
    expect(train1461?.totalNum).toBe(20);

    const train1462 = sortedResult.find((r) => r.fieldValue === '1462');
    expect(train1462?.count).toBe(1);
    expect(train1462?.percentage).toBeCloseTo(8.33, 1);
    expect(train1462?.uniqueTrainCodes).toBe(1);
    expect(train1462?.totalNum).toBe(22);

    const train5036 = sortedResult.find((r) => r.fieldValue === '5036/5037');
    expect(train5036?.count).toBe(1);
    expect(train5036?.percentage).toBeCloseTo(8.33, 1);
    expect(train5036?.uniqueTrainCodes).toBe(1);
    expect(train5036?.totalNum).toBe(6);

    const train5511 = sortedResult.find((r) => r.fieldValue === '5511');
    expect(train5511?.count).toBe(1);
    expect(train5511?.percentage).toBeCloseTo(8.33, 1);
    expect(train5511?.uniqueTrainCodes).toBe(1);
    expect(train5511?.totalNum).toBe(4);
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
