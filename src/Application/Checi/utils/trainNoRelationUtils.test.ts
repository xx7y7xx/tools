import {
  calculateStats,
  TrainNoRelation,
  analyzeTrainNoRelations,
  FieldType,
  FullTrainInfoMap,
} from './trainNoRelationUtils';
import { HistoricalTrainsData } from '../../services/trainsData';

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

      // Act
      const result = analyzeTrainNoRelations(
        mockHistoricalData,
        mockFullTrainInfo,
        selectedField
      );

      // Assert
      expect(result).toHaveLength(3); // 3 unique operateGroups: 北京局, 上海局, 广州局

      expect(result).toEqual([
        {
          trainNo: '',
          fieldValue: '北京局',
          count: 2,
          percentage: 50,
          uniqueTrainCodes: 1,
          totalNum: 220,
        },
        {
          trainNo: '',
          fieldValue: '上海局',
          count: 1,
          percentage: 25,
          uniqueTrainCodes: 1,
          totalNum: 80,
        },
        {
          trainNo: '',
          fieldValue: '广州局',
          count: 1,
          percentage: 25,
          uniqueTrainCodes: 1,
          totalNum: 90,
        },
      ]);
    });
  });
});
