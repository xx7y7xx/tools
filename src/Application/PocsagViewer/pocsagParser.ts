// @ts-ignore
import * as coordtransform from 'coordtransform';

import {
  Pocsag1234002ParseResult,
  MessageType,
  ParsedPocsagRow,
  RawPocsagRow,
  ConvertResult,
  ParsedPocsagPayload1234000,
} from './types';
import { convertGps, getNextSecond } from './utils';

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
      data: null,
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
      data: null,
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
    data: {
      wgs84Str: `${wgs84Str.latitude} ${wgs84Str.longitude}`,
      wgs84: {
        latitude: wgs84Num.latitude,
        longitude: wgs84Num.longitude,
      },
      gcj02: {
        latitude: gcj02Num[1],
        longitude: gcj02Num[0],
      },
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

/**
 * 1st time parse:
 * - validate the raw data
 * - convert 1234000 to trainNumber, speed, mileage
 * - convert 1234002 to latitude, longitude
 *
 * 2nd time parse:
 * - find the related 1234002 row for each 1234000 row
 */
export const parsePocsagData = (rawData: RawPocsagRow[]): ParsedPocsagRow[] => {
  console.time('parsed1TimeRows');
  const parsed1TimeRows = rawData.map((row) => {
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
      if (result.err || !result.data || !result.data.gcj02) {
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

    return {
      ...baseRow,
      parsedErrorMessage: 'Unknown message format',
    };
  });
  console.timeEnd('parsed1TimeRows');

  console.time('parsed2TimeRows');
  const parsed2TimeRows = parsed1TimeRows.map((parsedRow, idx) => {
    // print every 10000 rows
    if (idx % 10000 === 0) {
      console.log(`parsed2TimeRows index: ${idx}`);
    }

    // only parse 1234000
    if (
      parsedRow.address !== 1234000 ||
      parsedRow.messageFormat !== MessageType.Numeric
    ) {
      return parsedRow;
    }

    // when this 1234000 row failed to parse (in last round), means we dont know the train number, just ignore it
    if (parsedRow.parsedErrorMessage || !parsedRow.messagePayload) {
      return parsedRow;
    }

    // find related 1234002 row with getRelated1234002Row
    const parsed1234000RowMessagePayload =
      parsedRow.messagePayload as ParsedPocsagPayload1234000;
    const related1234002Row = getRelated1234002Row(
      idx,
      parsedRow,
      parsed1234000RowMessagePayload,
      parsed1TimeRows
    );

    // if we cannot find the related 1234002 row, just ignore it
    if (!related1234002Row) {
      return parsedRow;
    }

    return {
      ...parsedRow,
      _related1234002Row: related1234002Row,
    } as ParsedPocsagRow;
  });
  console.timeEnd('parsed2TimeRows');

  return parsed2TimeRows;
};

/**
 * record is 1234000, from this record's timestamp, we may find the corresponding 1234002 Numberic record which contains the GPS info
 * if cannot find the 1234002 record at the same timestamp, we use the next 1s record
 */
export const getRelated1234002Row = (
  parsed1234000RowIndex: number,
  parsed1234000Row: ParsedPocsagRow,
  parsed1234000RowMessagePayload: ParsedPocsagPayload1234000,
  parsedPocsagRows: ParsedPocsagRow[]
) => {
  const foundRows: ParsedPocsagRow[] = [];

  // from parsed1234000RowIndex, find the related 1234002 row, but we should not find too many rows (100 rows) to avoid the performance issue
  let nextIndex = parsed1234000RowIndex;
  do {
    const nextRow = parsedPocsagRows[nextIndex];
    nextIndex++;

    if (!nextRow) {
      break;
    }

    if (
      nextRow.address !== 1234002 ||
      nextRow.messageFormat !== MessageType.Numeric ||
      (nextRow.timestamp !== parsed1234000Row.timestamp &&
        nextRow.timestamp !== getNextSecond(parsed1234000Row.timestamp))
    ) {
      continue;
    }

    // TODO 当找到了，但是解析失败，是否还被认为是没有找到？
    if (nextRow.parsedErrorMessage) {
      // console.error(
      //   `Found 1234002 row for ${parsed1234000RowMessagePayload.trainNumber} at ${nextIndex}:${nextRow.timestamp} but parse error: ${nextRow.parsedErrorMessage}`
      // );
      continue;
    }
    foundRows.push(nextRow);
  } while (foundRows.length === 0 || nextIndex - parsed1234000RowIndex < 100);

  if (foundRows.length > 1) {
    console.warn(
      `Found ${foundRows.length} related 1234002 rows for ${parsed1234000RowMessagePayload.trainNumber} at ${parsed1234000Row.timestamp}:`,
      foundRows
    );
  }
  if (foundRows.length === 0) {
    return null;
  }
  return foundRows[0];
};
