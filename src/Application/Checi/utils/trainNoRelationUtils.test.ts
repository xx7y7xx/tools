import {
  summarizeAggregationStats,
  FieldAggregationStats,
  aggregateTrainsByField,
  FieldType,
  FullTrainInfoMap,
} from './trainNoRelationUtils';
import { HistoricalTrainsData } from '../../services/trainsData';

describe('trainNoRelationUtils', () => {
  describe('summarizeAggregationStats', () => {
    it('should summarize aggregation statistics correctly', () => {
      // Arrange
      const mockFieldAggregationStats: FieldAggregationStats[] = [
        {
          trainNo: '',
          fieldValue: '北京局', // operateGroup
          count: 15,
          percentage: 37.5,
          uniqueTrainCodes: 3,
          totalNum: 300,
        },
        {
          trainNo: '',
          fieldValue: '上海局', // operateGroup
          count: 10,
          percentage: 25.0,
          uniqueTrainCodes: 2,
          totalNum: 180,
        },
        {
          trainNo: '',
          fieldValue: '广州局', // operateGroup
          count: 15,
          percentage: 37.5,
          uniqueTrainCodes: 4,
          totalNum: 320,
        },
      ];

      // Act
      const result = summarizeAggregationStats(mockFieldAggregationStats);

      // Assert
      expect(result).toEqual({
        totalGroups: 3,
        uniqueTrainNumbers: 1, // Only '' is used as trainNo in this mock
        uniqueGroups: 3, // 北京局, 上海局, 广州局 (all are operateGroups)
        mostCommonGroup: '广州局', // 15 (北京局) == 15 (广州局), but 广州局 comes last in the array
        mostCommonTrainNumber: '', // Only '' is used as trainNo
      });
    });
  });

  describe('aggregateTrainsByField', () => {
    // Shared mock data for both tests
    const mockHistoricalData: HistoricalTrainsData = {
      '2024-01-01': {
        G1: {
          station_train_code: 'G1',
          total_num: '100',
          from_station: '北京南',
          to_station: '上海虹桥',
          train_no: '240000G1000C',
        },
        G2: {
          station_train_code: 'G2',
          total_num: '80',
          from_station: '上海虹桥',
          to_station: '广州南',
          train_no: '240000G2000C',
        },
        D1: {
          station_train_code: 'D1',
          total_num: '85',
          from_station: '北京西',
          to_station: '广州南',
          train_no: '240000D1000C',
        },
      },
      '2024-01-02': {
        G1: {
          station_train_code: 'G1',
          total_num: '120',
          from_station: '北京南',
          to_station: '上海虹桥',
          train_no: '240000G1000C',
        },
        G3: {
          station_train_code: 'G3',
          total_num: '110',
          from_station: '广州南',
          to_station: '北京南',
          train_no: '240000G3000C',
        },
        D1: {
          station_train_code: 'D1',
          total_num: '88',
          from_station: '北京西',
          to_station: '广州南',
          train_no: '240000D1000C',
        },
        'G1-ALT': {
          station_train_code: 'G1-ALT',
          total_num: '110',
          from_station: '北京南',
          to_station: '上海虹桥',
          train_no: '240000G1000C', // Same trainNumber as G1
        },
      },
    };

    const mockFullTrainInfo: FullTrainInfoMap = {
      G1: {
        operateGroup: '北京局',
        trainNumber: 'G1',
        fromStation: '北京南',
        toStation: '上海虹桥',
        trainType: '高铁',
        train_no: '240000G1000C',
      },
      G2: {
        operateGroup: '上海局',
        trainNumber: 'G2',
        fromStation: '上海虹桥',
        toStation: '广州南',
        trainType: '高铁',
        train_no: '240000G2000C',
      },
      G3: {
        operateGroup: '广州局',
        trainNumber: 'G3',
        fromStation: '广州南',
        toStation: '北京南',
        trainType: '高铁',
        train_no: '240000G3000C',
      },
      D1: {
        operateGroup: '北京局', // Same bureau as G1
        trainNumber: 'D1',
        fromStation: '北京西',
        toStation: '广州南',
        trainType: '高铁',
        train_no: '240000D1000C',
      },
      'G1-ALT': {
        operateGroup: '北京局',
        trainNumber: 'G1', // Same trainNumber as G1
        fromStation: '北京南',
        toStation: '上海虹桥',
        trainType: '高铁',
        train_no: '240000G1000C',
      },
    };

    it('should aggregate train data by operateGroup correctly', () => {
      const selectedField: FieldType = 'operateGroup';

      // Act
      const result = aggregateTrainsByField(
        mockHistoricalData,
        mockFullTrainInfo,
        selectedField
      );

      // Assert
      expect(result).toHaveLength(3); // 3 unique operateGroups: 北京局, 上海局, 广州局

      // Expected results based on mock data:
      // - Total of 7 train records across 2 days
      // - 北京局 operates G1 (appears on both days), D1 (appears on both days), G1-ALT (appears on 2024-01-02)
      //   so count=5, percentage=71.43%, uniqueTrainCodes=3 (G1, D1, G1-ALT)
      // - 上海局 operates G2 (appears only on 2024-01-01), so count=1, percentage=14.29%
      // - 广州局 operates G3 (appears only on 2024-01-02), so count=1, percentage=14.29%
      expect(result).toEqual([
        {
          trainNo: '',
          fieldValue: '北京局',
          count: 5,
          percentage: 71.42857142857143,
          uniqueTrainCodes: 3,
          totalNum: 523, // G1(100+120) + D1(85+88) + G1-ALT(110) = 220 + 173 + 110 = 523
        },
        {
          trainNo: '',
          fieldValue: '上海局',
          count: 1,
          percentage: 14.285714285714286,
          uniqueTrainCodes: 1,
          totalNum: 80,
        },
        {
          trainNo: '',
          fieldValue: '广州局',
          count: 1,
          percentage: 14.285714285714286,
          uniqueTrainCodes: 1,
          totalNum: 110,
        },
      ]);
    });

    it('should aggregate train data by trainNumber', () => {
      const selectedField: FieldType = 'trainNumber';

      // Act
      const result = aggregateTrainsByField(
        mockHistoricalData,
        mockFullTrainInfo,
        selectedField
      );

      // Assert
      // There should be 3 groups: G1, G2, G3, D1
      expect(result).toHaveLength(4);
      // G1 group: 3 records (G1 on both days, G1-ALT on 2024-01-02), sum total_num = 100+120+110=330
      // G2 group: 1 record (G2 on 2024-01-01), sum total_num = 80
      // G3 group: 1 record (G3 on 2024-01-02), sum total_num = 110
      // D1 group: 2 records (D1 on both days), sum total_num = 85+88=173
      expect(result).toEqual([
        {
          trainNo: '',
          fieldValue: 'G1',
          count: 3,
          percentage: 42.857142857142854, // 3/7
          uniqueTrainCodes: 2, // G1, G1-ALT
          totalNum: 330,
        },
        {
          trainNo: '',
          fieldValue: 'G2',
          count: 1,
          percentage: 14.285714285714286, // 1/7
          uniqueTrainCodes: 1, // G2
          totalNum: 80,
        },
        {
          trainNo: '',
          fieldValue: 'G3',
          count: 1,
          percentage: 14.285714285714286, // 1/7
          uniqueTrainCodes: 1, // G3
          totalNum: 110,
        },
        {
          trainNo: '',
          fieldValue: 'D1',
          count: 2,
          percentage: 28.571428571428573, // 2/7
          uniqueTrainCodes: 1, // D1
          totalNum: 173,
        },
      ]);
    });
  });
});
