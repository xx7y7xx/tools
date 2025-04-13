import {
  ConvertResult,
  Pocsag1234002ParseResult,
  TrainSignalRecord,
} from './types';

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

/**
 * Parse 1234002:Numberic
 * ```
 * 20202350006330U].9UU.6 [-[202012037603931201079000
 * 202012037603931201079000
 * ││││││││││││││││││││││││
 * └─┬─┘└─┬─┘└───┬────┘
 *   31°  120°   小数部分
 *   20.1079'    37.6039'
 * ```
 * The parsed result is "31°20.1079' 120°37.6039'"
 */
export const parsePocsag1234002 = (msg: string): Pocsag1234002ParseResult => {
  // e.g. msg="20202350006330U].9UU.6 [-[202012037603931201079000"
  if (msg.length !== 50) {
    return {
      err: 'Invalid POCSAG message body length',
    };
  }

  const longitude: string = msg.slice(30, 33); // "120"
  const longitudeDecimal: string =
    msg.slice(33, 35) /* 37 */ + '.' + msg.slice(35, 39); /* 6039 */
  const latitude: string = msg.slice(39, 41); // "31"
  const latitudeDecimal: string =
    msg.slice(41, 43) /* 20 */ + '.' + msg.slice(43, 47); /* 1079 */
  return {
    latitude: `${latitude}°${latitudeDecimal}'`, // "31°20.1079'"
    longitude: `${longitude}°${longitudeDecimal}'`, // "120°37.6039'"
  };
};

/**
 * Function to get color based on speed
 * The highest speed is red, the lowest speed is blue
 * @param speed
 * @returns color, e.g. rgba(255, 0, 0, 0.8)
 */
export const getColorForSpeed = (
  speed: number,
  minSpeed: number,
  maxSpeed: number
) => {
  const ratio = (speed - minSpeed) / (maxSpeed - minSpeed);
  const r = Math.floor(255 * ratio);
  const b = Math.floor(255 * (1 - ratio));
  return `rgba(${r}, 0, ${b}, 0.8)`;
};

export const getMinMaxSpeed = (trainSignalRecords: TrainSignalRecord[]) => {
  const speeds = trainSignalRecords.map((record) => record.payload.speed);
  return {
    minSpeed: Math.min(...speeds),
    maxSpeed: Math.max(...speeds),
  };
};

/**
 * Get next second from timestamp, need to keep the same timezone
 * @param timestamp e.g. "2025-04-09 23:42:48"
 * @returns string, e.g. "2025-04-09 23:42:49"
 */
export const getNextSecond = (timestamp: string) => {
  const date = new Date(timestamp.replace(' ', 'T')); // Convert to ISO format for parsing
  date.setSeconds(date.getSeconds() + 1);

  // Format using local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
