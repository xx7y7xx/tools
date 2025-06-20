import {
  calculateStats,
  FieldAggregationStats,
  aggregateTrainsByField,
  FieldType,
  FullTrainInfoMap,
} from './trainNoRelationUtils';
import { HistoricalTrainsData } from '../../services/trainsData';

describe('trainNoRelationUtils', () => {
  describe('calculateStats', () => {
    it('should calculate correct statistics for train number relations', () => {
      // Arrange
      const mockFieldAggregationStats: FieldAggregationStats[] = [
        {
          trainNo: 'G1',
          fieldValue: '北京南',
          count: 10,
          percentage: 25.0,
          uniqueTrainCodes: 5,
          totalNum: 100,
        },
        {
          trainNo: 'G2',
          fieldValue: '上海虹桥',
          count: 8,
          percentage: 20.0,
          uniqueTrainCodes: 4,
          totalNum: 80,
        },
        {
          trainNo: 'G1', // Same trainNo as first item
          fieldValue: '广州南',
          count: 12,
          percentage: 30.0,
          uniqueTrainCodes: 6,
          totalNum: 120,
        },
        {
          trainNo: 'G3',
          fieldValue: '北京南', // Same fieldValue as first item
          count: 10,
          percentage: 25.0,
          uniqueTrainCodes: 5,
          totalNum: 100,
        },
      ];

      // Act
      const result = calculateStats(mockFieldAggregationStats);

      // Assert
      expect(result).toEqual({
        totalTrains: 4,
        uniqueTrainNos: 3, // G1, G2, G3 (G1 appears twice)
        uniqueFieldValues: 3, // 北京南, 上海虹桥, 广州南 (北京南 appears twice)
        mostCommonFieldValue: '北京南', // 10 + 10 = 20 total count
        mostCommonTrainNo: 'G1', // 10 + 12 = 22 total count
      });
    });
  });

  describe('aggregateTrainsByField', () => {
    it('should aggregate train data by field correctly', () => {
      // Arrange - Create mock historical data with trains across multiple dates
      const mockHistoricalData: HistoricalTrainsData = {
        '2024-01-01': {
          G1: {
            // checi (车次号) - Chinese train number
            station_train_code: 'G1',
            total_num: '100',
            from_station: '北京南',
            to_station: '上海虹桥',
            train_no: 'G1',
          },
          G2: {
            // checi (车次号) - Chinese train number
            station_train_code: 'G2',
            total_num: '80',
            from_station: '上海虹桥',
            to_station: '广州南',
            train_no: 'G2',
          },
        },
        '2024-01-02': {
          G1: {
            // Same checi as first day
            station_train_code: 'G1',
            total_num: '120',
            from_station: '北京南',
            to_station: '深圳北',
            train_no: 'G1',
          },
          G3: {
            // checi (车次号) - Chinese train number
            station_train_code: 'G3',
            total_num: '90',
            from_station: '广州南',
            to_station: '北京南',
            train_no: 'G3',
          },
        },
      };

      // Arrange - Create mock full train info mapping checi to field values
      const mockFullTrainInfo: FullTrainInfoMap = {
        G1: {
          // checi as key
          operateGroup: '北京局',
          trainNumber: 'G1',
          fromStation: '北京南',
          toStation: '上海虹桥',
          trainType: '高铁',
          train_no: 'G1',
        },
        G2: {
          // checi as key
          operateGroup: '上海局',
          trainNumber: 'G2',
          fromStation: '上海虹桥',
          toStation: '广州南',
          trainType: '高铁',
          train_no: 'G2',
        },
        G3: {
          // checi as key
          operateGroup: '广州局',
          trainNumber: 'G3',
          fromStation: '广州南',
          toStation: '北京南',
          trainType: '高铁',
          train_no: 'G3',
        },
      };

      const selectedField: FieldType = 'operateGroup';

      // Act - Aggregate train data by operateGroup field
      const result = aggregateTrainsByField(
        mockHistoricalData,
        mockFullTrainInfo,
        selectedField
      );

      // Assert - Verify aggregation results
      expect(result).toHaveLength(3); // 3 unique operateGroups: 北京局, 上海局, 广州局

      // Expected results based on mock data:
      // - Total of 4 train records across 2 days (2024-01-01: G1, G2; 2024-01-02: G1, G3)
      // - G1 (operated by 北京局) appears on both days, so count=2, percentage=50%
      // - G2 (operated by 上海局) appears only on 2024-01-01, so count=1, percentage=25%
      // - G3 (operated by 广州局) appears only on 2024-01-02, so count=1, percentage=25%
      // - Each bureau operates only one unique train code, so uniqueTrainCodes=1 for all
      // - totalNum is the sum of total_num values for each bureau's trains
      expect(result).toEqual([
        {
          trainNo: '', // Empty string as per current implementation
          fieldValue: '北京局', // Beijing Railway Bureau - appears in G1 train on both days
          count: 2, // G1 appears on 2024-01-01 and 2024-01-02
          percentage: 50, // 2 out of 4 total records = 50%
          uniqueTrainCodes: 1, // Only G1 train code is operated by Beijing Bureau
          totalNum: 220, // Sum of 100 (2024-01-01) + 120 (2024-01-02) from G1
        },
        {
          trainNo: '', // Empty string as per current implementation
          fieldValue: '上海局', // Shanghai Railway Bureau - appears in G2 train
          count: 1, // G2 appears only on 2024-01-01
          percentage: 25, // 1 out of 4 total records = 25%
          uniqueTrainCodes: 1, // Only G2 train code is operated by Shanghai Bureau
          totalNum: 80, // Sum of 80 from G2 on 2024-01-01
        },
        {
          trainNo: '', // Empty string as per current implementation
          fieldValue: '广州局', // Guangzhou Railway Bureau - appears in G3 train
          count: 1, // G3 appears only on 2024-01-02
          percentage: 25, // 1 out of 4 total records = 25%
          uniqueTrainCodes: 1, // Only G3 train code is operated by Guangzhou Bureau
          totalNum: 90, // Sum of 90 from G3 on 2024-01-02
        },
      ]);
    });
  });
});
