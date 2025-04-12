import { convertTrainNumSpeedMileage, getColorForSpeed } from './utils';

/*
test data for 1234000
2025-04-09 23:42:20,1234000,3,Numeric,69012  19    33
2025-04-09 23:45:40,1234000,1,Numeric,23515  41    27
2025-04-10 00:02:54,1234000,1,Numeric,  885  53    28
2025-04-10 11:18:37,1234000,3,Numeric, 8202  39    73
2025-04-10 11:19:45,1234000,1,Numeric,  351 152   156
2025-04-10 11:19:46,1234000,3,Numeric,   10  84   220
2025-04-10 11:21:07,1234000,3,Numeric,24014   0 -----
2025-04-10 11:21:29,1234000,1,Numeric,----- --- -----
2025-04-10 11:25:22,1234000,1,Numeric,  337  74    23
2025-04-10 11:27:38,1234000,3,Numeric,   68 156   126
2025-04-10 11:42:17,1234000,3,Numeric,   28  75    61
2025-04-10 11:47:31,1234000,0,Numeric,-----  19    28
2025-04-10 11:59:56,1234000,1,Numeric,-5-[- --- -----
2025-04-10 12:14:27,1234000,1,Numeric,   69 153   134
 */

describe('convertTrainNumSpeedMileage', () => {
  it('should convert normal train number, speed, and mileage', () => {
    const trainNumSpeedMileage = '69012  19    33';
    const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
    expect(trainInfo).toEqual({
      data: { trainNumber: 69012, speed: 19, mileage: 3.3 },
      str: { trainNumber: '69012', speed: ' 19', mileage: '   33' },
    });
  });

  it('should handle different spacing patterns', () => {
    const trainNumSpeedMileage = '23515  41    27';
    const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
    expect(trainInfo).toEqual({
      data: { trainNumber: 23515, speed: 41, mileage: 2.7 },
      str: { trainNumber: '23515', speed: ' 41', mileage: '   27' },
    });
  });

  it('should handle leading spaces', () => {
    const trainNumSpeedMileage = '  885  53    28';
    const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
    expect(trainInfo).toEqual({
      data: { trainNumber: 885, speed: 53, mileage: 2.8 },
      str: { trainNumber: '  885', speed: ' 53', mileage: '   28' },
    });
  });

  it('should handle leading zeros', () => {
    const trainNumSpeedMileage = ' 8202  39    73';
    const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
    expect(trainInfo).toEqual({
      data: { trainNumber: 8202, speed: 39, mileage: 7.3 },
      str: { trainNumber: ' 8202', speed: ' 39', mileage: '   73' },
    });
  });

  it('should handle small numbers', () => {
    const trainNumSpeedMileage = '  351 152   156';
    const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
    expect(trainInfo).toEqual({
      data: { trainNumber: 351, speed: 152, mileage: 15.6 },
      str: { trainNumber: '  351', speed: '152', mileage: '  156' },
    });
  });

  it('should handle very small numbers', () => {
    const trainNumSpeedMileage = '   10  84   220';
    const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
    expect(trainInfo).toEqual({
      data: { trainNumber: 10, speed: 84, mileage: 22.0 },
      str: { trainNumber: '   10', speed: ' 84', mileage: '  220' },
    });
  });

  it('should handle zero speed', () => {
    const trainNumSpeedMileage = '24014   0 -----';
    const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
    expect(trainInfo).toEqual({
      str: { trainNumber: '24014', speed: '  0', mileage: '-----' },
      err: 'Invalid POCSAG message body',
    });
  });

  it('should handle all dashes', () => {
    const trainNumSpeedMileage = '----- --- -----';
    const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
    expect(trainInfo).toEqual({
      str: { trainNumber: '-----', speed: '---', mileage: '-----' },
      err: 'Invalid POCSAG message body',
    });
  });

  it('should handle mixed numbers and dashes', () => {
    const trainNumSpeedMileage = '  337  74    23';
    const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
    expect(trainInfo).toEqual({
      data: { trainNumber: 337, speed: 74, mileage: 2.3 },
      str: { trainNumber: '  337', speed: ' 74', mileage: '   23' },
    });
  });

  it('should handle special characters in train number', () => {
    const trainNumSpeedMileage = '-5-[- --- -----';
    const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
    expect(trainInfo).toEqual({
      str: { trainNumber: '-5-[-', speed: '---', mileage: '-----' },
      err: 'Invalid POCSAG message body',
    });
  });

  it('should handle missing parts', () => {
    expect(convertTrainNumSpeedMileage('-----  19    28')).toEqual({
      str: { trainNumber: '-----', speed: ' 19', mileage: '   28' },
      err: 'Invalid POCSAG message body',
    });
  });
});

describe('getColorForSpeed', () => {
  it('should return the correct color for a given speed', () => {
    const color = getColorForSpeed(10, 0, 20); // speed=10km/h, minSpeed=0km/h, maxSpeed=20km/h
    expect(color).toEqual('rgba(255, 0, 0, 0.8)');
  });
});
