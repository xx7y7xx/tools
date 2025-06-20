import {
  calculateStats,
  TrainNoRelation,
  analyzeTrainNoRelations,
  FieldType,
} from './trainNoRelationUtils';
import { HistoricalTrainsData, FullTrainInfo } from '../../services/trainsData';

describe('trainNoRelationUtils', () => {
  describe('calculateStats', () => {
    it('should calculate correct statistics for train number relations', () => {
      // Arrange
      const mockTrainNoRelations: TrainNoRelation[] = [
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
      const result = calculateStats(mockTrainNoRelations);

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

  describe('analyzeTrainNoRelations', () => {
    it('should analyze train number relations correctly', () => {
      // Arrange
      const mockHistoricalData: HistoricalTrainsData = {
        '2024-01-01': {
          G1: {
            station_train_code: 'G1',
            total_num: '100',
            from_station: '北京南',
            to_station: '上海虹桥',
            train_no: 'G1',
          },
          G2: {
            station_train_code: 'G2',
            total_num: '80',
            from_station: '上海虹桥',
            to_station: '广州南',
            train_no: 'G2',
          },
        },
        '2024-01-02': {
          G1: {
            station_train_code: 'G1',
            total_num: '120',
            from_station: '北京南',
            to_station: '深圳北',
            train_no: 'G1',
          },
          G3: {
            station_train_code: 'G3',
            total_num: '90',
            from_station: '广州南',
            to_station: '北京南',
            train_no: 'G3',
          },
        },
      };

      const mockFullTrainInfo: Record<string, FullTrainInfo> = {
        G1: {
          operateGroup: '北京局',
          trainNumber: 'G1',
          fromStation: '北京南',
          toStation: '上海虹桥',
          trainType: '高铁',
          train_no: 'G1',
        },
        G2: {
          operateGroup: '上海局',
          trainNumber: 'G2',
          fromStation: '上海虹桥',
          toStation: '广州南',
          trainType: '高铁',
          train_no: 'G2',
        },
        G3: {
          operateGroup: '广州局',
          trainNumber: 'G3',
          fromStation: '广州南',
          toStation: '北京南',
          trainType: '高铁',
          train_no: 'G3',
        },
      };

      const selectedField: FieldType = 'operateGroup';

      // Act
      const result = analyzeTrainNoRelations(
        mockHistoricalData,
        mockFullTrainInfo,
        selectedField
      );

      // Assert
      expect(result).toHaveLength(3); // 3 unique operateGroups: 北京局, 上海局, 广州局

      // Find results by operateGroup
      const beijingResult = result.find((r) => r.fieldValue === '北京局');
      const shanghaiResult = result.find((r) => r.fieldValue === '上海局');
      const guangzhouResult = result.find((r) => r.fieldValue === '广州局');

      // Verify 北京局 results (appears in 2 trains)
      expect(beijingResult).toBeDefined();
      expect(beijingResult!.count).toBe(2);
      expect(beijingResult!.percentage).toBe(50); // 2 out of 4 total = 50%
      expect(beijingResult!.uniqueTrainCodes).toBe(1); // Only G1 train code
      expect(beijingResult!.totalNum).toBe(220); // 100 + 120

      // Verify 上海局 results (appears in 1 train)
      expect(shanghaiResult).toBeDefined();
      expect(shanghaiResult!.count).toBe(1);
      expect(shanghaiResult!.percentage).toBe(25); // 1 out of 4 total = 25%
      expect(shanghaiResult!.uniqueTrainCodes).toBe(1); // Only G2 train code
      expect(shanghaiResult!.totalNum).toBe(80);

      // Verify 广州局 results (appears in 1 train)
      expect(guangzhouResult).toBeDefined();
      expect(guangzhouResult!.count).toBe(1);
      expect(guangzhouResult!.percentage).toBe(25); // 1 out of 4 total = 25%
      expect(guangzhouResult!.uniqueTrainCodes).toBe(1); // Only G3 train code
      expect(guangzhouResult!.totalNum).toBe(90);
    });
  });
});
