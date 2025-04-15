// @ts-ignore
import * as coordtransform from 'coordtransform';

import {
  Pocsag1234002ParseResult,
  MessageType,
  ParsedPocsagRow,
  RawPocsagRow,
  ConvertResult,
} from './types';
import { convertGps } from './utils';

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
    err: null,
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

  const longitudeDegrees = msg.slice(30, 33); // "120"
  const longitudeMinutes = msg.slice(33, 35); // "37"
  const longitudeMinutesDecimal = msg.slice(35, 39); // "6039"

  const latitudeDegrees = msg.slice(39, 41); // "31"
  const latitudeMinutes = msg.slice(41, 43); // "20"
  const latitudeMinutesDecimal = msg.slice(43, 47); // "1079"

  // sometimes the message may contain not_a_number
  // for example "20202310526732U7]1 9U3 [-[20205.632891339521253000", you can see the longitudeDegrees is "5.6", but `.` is not a number
  if (
    !/^\d+$/.test(longitudeDegrees) ||
    !/^\d+$/.test(longitudeMinutes) ||
    !/^\d+$/.test(longitudeMinutesDecimal) ||
    !/^\d+$/.test(latitudeDegrees) ||
    !/^\d+$/.test(latitudeMinutes) ||
    !/^\d+$/.test(latitudeMinutesDecimal)
  ) {
    return {
      err: 'Invalid POCSAG message body because of not_a_number',
    };
  }

  const wgs84Str = {
    latitude: `${latitudeDegrees}°${latitudeMinutes}.${latitudeMinutesDecimal}'`, // "31°20.1079'"
    longitude: `${longitudeDegrees}°${longitudeMinutes}.${longitudeMinutesDecimal}'`, // "120°37.6039'"
  };

  const wgs84Num = convertGps(wgs84Str);
  const gcj02Num /* [lng, lat] */ = coordtransform.wgs84togcj02(
    wgs84Num.longitude,
    wgs84Num.latitude
  );

  return {
    err: null,
    wgs84Str: `${wgs84Str.latitude} ${wgs84Str.longitude}`,
    wgs84: {
      latitude: wgs84Num.latitude,
      longitude: wgs84Num.longitude,
    },
    gcj02: {
      latitude: gcj02Num[1],
      longitude: gcj02Num[0],
    },
  };
};

const validateRawPocsagRow = (row: RawPocsagRow) => {
  // make sure timestamp is in the format of '2025-04-09 23:42:17'
  if (!row.timestamp.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
    console.error(`Invalid timestamp: ${row.timestamp}`);
  }
  // make sure address is in the format of '1234000'
  if (!row.address.match(/^\d+$/)) {
    console.error(`Invalid address: ${row.address}`);
  }
  // make sure functionBits is one of 1, 2, 3
  if (!['0', '1', '2', '3'].includes(row.function_bits)) {
    console.error(`Invalid functionBits: ${row.function_bits}`);
  }
  // make sure messageFormat is one of the values in MessageType
  if (
    ![MessageType.Numeric, MessageType.Alpha, MessageType.Skyper].includes(
      row.message_format as MessageType
    )
  ) {
    console.error(`Invalid messageFormat: ${row.message_format}`);
  }
};

export const parsePocsagData = (rawData: RawPocsagRow[]): ParsedPocsagRow[] => {
  return rawData.map((row) => {
    validateRawPocsagRow(row);

    // Create base object that's common to all cases
    const baseRow: Omit<ParsedPocsagRow, 'messagePayload'> = {
      timestamp: row.timestamp,
      address: parseInt(row.address),
      functionBits: parseInt(row.function_bits),
      messageFormat: row.message_format as MessageType,
      rawSignal: row,
      parsedErrorMessage: null,
    };

    if (
      row.address === '1234000' &&
      row.message_format === MessageType.Numeric
    ) {
      const result = convertTrainNumSpeedMileage(row.message_content);
      if (result.err || !result.data) {
        return {
          ...baseRow,
          parsedErrorMessage: result.err,
        };
      }
      return {
        ...baseRow,
        messagePayload: result.data,
      } as ParsedPocsagRow;
    }

    if (
      row.address === '1234002' &&
      row.message_format === MessageType.Numeric
    ) {
      const result: Pocsag1234002ParseResult = parsePocsag1234002(
        row.message_content
      );
      if (result.err || !result.gcj02) {
        return {
          ...baseRow,
          parsedErrorMessage: result.err,
        };
      }
      return {
        ...baseRow,
        messagePayload: result,
      } as ParsedPocsagRow;
    }

    return {
      ...baseRow,
      parsedErrorMessage: 'Unknown message format',
    };
  });
};
