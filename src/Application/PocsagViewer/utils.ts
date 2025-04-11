import { TrainInfo } from './types';

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

type ConvertResult = {
  str: { trainNumber: string; speed: string; mileage: string };
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
      trainNumber: trainNumStrPart,
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
    trainNumber: parseInt(trainNumStrPart),
    speed: parseInt(speedStrPart),
    mileage: parseFloat(mileageStrPart) / 10,
  };

  return result;
};
