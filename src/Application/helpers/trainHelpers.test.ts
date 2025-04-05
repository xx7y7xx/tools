import { searchTrainByNum } from './trainHelpers';

describe('searchTrainByNum', () => {
  it('should return true if the train number is exact match', () => {
    expect(searchTrainByNum(true, 'G1234', '1234')).toBe(true);
    expect(searchTrainByNum(true, '1234', '1234')).toBe(true);
  });

  it('should return true if the train number is not exact match', () => {
    expect(searchTrainByNum(false, 'G1234', '1234')).toBe(true);
    expect(searchTrainByNum(false, '1234', '1234')).toBe(true);
  });
});
