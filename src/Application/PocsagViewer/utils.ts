import { ConvertResult } from './types';

/**
 * Convert the message body which the address is 1234000
 * How to split "69012  19    33"
 * ```
 * ----- --- -----
 * 69012  19    33
 * ```
 * Format: `{5} {2} {5}` (the number is the length of the string)
 * @param trainNumSpeedMileage The train number, speed, and mileage. e.g. "69012  19    33"
 * @returns ConvertResult object with parsed values
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
