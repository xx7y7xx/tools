import { TrainInfo } from './types';

// import { convertTrainNumSpeedMileage } from './utils';

// /*
// test data for 1234000
// 2025-04-09 23:42:20,1234000,3,Numeric,69012  19    33
// 2025-04-09 23:45:40,1234000,1,Numeric,23515  41    27
// 2025-04-10 00:02:54,1234000,1,Numeric,  885  53    28
// 2025-04-10 11:18:37,1234000,3,Numeric, 8202  39    73
// 2025-04-10 11:19:45,1234000,1,Numeric,  351 152   156
// 2025-04-10 11:19:46,1234000,3,Numeric,   10  84   220
// 2025-04-10 11:21:07,1234000,3,Numeric,24014   0 -----
// 2025-04-10 11:21:29,1234000,1,Numeric,----- --- -----
// 2025-04-10 11:25:22,1234000,1,Numeric,  337  74    23
// 2025-04-10 11:27:38,1234000,3,Numeric,   68 156   126
// 2025-04-10 11:42:17,1234000,3,Numeric,   28  75    61
// 2025-04-10 11:47:31,1234000,0,Numeric,-----  19    28
// 2025-04-10 11:59:56,1234000,1,Numeric,-5-[- --- -----
// 2025-04-10 12:14:27,1234000,1,Numeric,   69 153   134
//  */

// describe('convertTrainNumSpeedMileage', () => {
//   it('should convert normal train number, speed, and mileage', () => {
//     const trainNumSpeedMileage = '69012  19    33';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       data: { trainNum: 69012, speed: 19, mileage: 3.3 },
//       str: { trainNum: '69012', speed: '19', mileage: '33' },
//     });
//   });

//   it('should handle different spacing patterns', () => {
//     const trainNumSpeedMileage = '23515  41    27';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       data: { trainNum: 23515, speed: 41, mileage: 2.7 },
//       str: { trainNum: '23515', speed: '41', mileage: '27' },
//     });
//   });

//   it('should handle leading spaces', () => {
//     const trainNumSpeedMileage = '  885  53    28';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       data: { trainNum: 885, speed: 53, mileage: 2.8 },
//       str: { trainNum: '885', speed: '53', mileage: '28' },
//     });
//   });

//   it('should handle leading zeros', () => {
//     const trainNumSpeedMileage = ' 8202  39    73';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       data: { trainNum: 8202, speed: 39, mileage: 7.3 },
//       str: { trainNum: '8202', speed: '39', mileage: '73' },
//     });
//   });

//   it('should handle small numbers', () => {
//     const trainNumSpeedMileage = '  351 152   156';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       data: { trainNum: 351, speed: 152, mileage: 15.6 },
//       str: { trainNum: '351', speed: '152', mileage: '156' },
//     });
//   });

//   it('should handle very small numbers', () => {
//     const trainNumSpeedMileage = '   10  84   220';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       data: { trainNum: 10, speed: 84, mileage: 22.0 },
//       str: { trainNum: '10', speed: '84', mileage: '220' },
//     });
//   });

//   it('should handle zero speed', () => {
//     const trainNumSpeedMileage = '24014   0 -----';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       str: { trainNum: '24014', speed: '0', mileage: '-----' },
//       err: 'Invalid POCSAG message body',
//     });
//   });

//   it('should handle all dashes', () => {
//     const trainNumSpeedMileage = '----- --- -----';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       str: { trainNum: '-----', speed: '---', mileage: '-----' },
//       err: 'Invalid POCSAG message body',
//     });
//   });

//   it('should handle mixed numbers and dashes', () => {
//     const trainNumSpeedMileage = '  337  74    23';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       data: { trainNum: 337, speed: 74, mileage: 2.3 },
//       str: { trainNum: '337', speed: '74', mileage: '23' },
//     });
//   });

//   it('should handle special characters in train number', () => {
//     const trainNumSpeedMileage = '-5-[- --- -----';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       str: { trainNum: '-5-[-', speed: '---', mileage: '-----' },
//       err: 'Invalid POCSAG message body',
//     });
//   });

//   it('should handle missing parts', () => {
//     const trainNumSpeedMileage = '-----  19    28';
//     const trainInfo = convertTrainNumSpeedMileage(trainNumSpeedMileage);
//     expect(trainInfo).toEqual({
//       str: { trainNum: '-----', speed: '19', mileage: '28' },
//       err: 'Invalid POCSAG message body',
//     });
//   });
// });

// type of({
//       str: { trainNum: '-----', speed: '---', mileage: '-----' },
//       err: 'Invalid POCSAG message body',
//     });
type ConvertResult = {
  str: { trainNum: string; speed: string; mileage: string };
  data?: TrainInfo;
  err?: string;
};

/**
 * Convert the message body which the address is 1234000
 * How to split "69012  19    33"
 * ```
 * ----- --- -----
 * 69012  19    33
 * ```
 * Format: `{5} {2} {5}` (the number is the length of the string)
 * @param trainNumSpeedMileage The train number, speed, and mileage. e.g. "69012  19    33"
 * @returns TrainInfo object with parsed values
 */
export const convertTrainNumSpeedMileage = (
  trainNumSpeedMileage: string
): ConvertResult => {
  // trainNumSpeedMileage="69012  19    33"
  const trainNumStrPart = trainNumSpeedMileage.substring(0, 5); // '69012'
  const speedStrPart = trainNumSpeedMileage.substring(6, 9); // ' 19'
  const mileageStrPart = trainNumSpeedMileage.substring(10, 15); // '   33'

  let isErr = false;

  const result: ConvertResult = {
    str: {
      trainNum: trainNumStrPart,
      speed: speedStrPart,
      mileage: mileageStrPart,
    },
  };

  // '12345' and ' 1234' is valid, '-----' is invalid
  if (!/^\s*\d+$/.test(trainNumStrPart) || trainNumStrPart.length !== 5) {
    isErr = true;
  }
  // '219' and ' 19' is valid, '---' is invalid
  if (!/^\s*\d+$/.test(speedStrPart) || speedStrPart.length !== 3) {
    isErr = true;
  }
  // '44433' and '   33' is valid, '-----' is invalid
  if (!/^\s*\d+$/.test(mileageStrPart) || mileageStrPart.length !== 5) {
    isErr = true;
  }

  if (isErr) {
    result.err = 'Invalid POCSAG message body';
    return result;
  }

  result.data = {
    trainNum: parseInt(trainNumStrPart),
    speed: parseInt(speedStrPart),
    mileage: parseFloat(mileageStrPart) / 10,
  };

  return result;
};
