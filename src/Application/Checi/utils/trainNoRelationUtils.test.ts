import { calculateStats, TrainNoRelation } from './trainNoRelationUtils';

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
});
