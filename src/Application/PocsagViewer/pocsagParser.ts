import { MessageType, ParsedPocsagRow, RawPocsagRow } from './types';

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
  const parsed1TimeRows = rawData.map((rawRow) => {
    let messagePayload = null;
    if (rawRow['message_payload(json|null)']) {
      messagePayload = JSON.parse(rawRow['message_payload(json|null)']);
    }

    let parsedErrorMessage = null;
    if (rawRow['parsed_error_message(null|string)'] !== 'null') {
      parsedErrorMessage = rawRow['parsed_error_message(null|string)'];
    }

    let _related1234002RowIdx = null;
    if (
      rawRow['related_1234002_row_idx(number|null)'] &&
      rawRow['related_1234002_row_idx(number|null)'] !== 'null'
    ) {
      _related1234002RowIdx = parseInt(
        rawRow['related_1234002_row_idx(number|null)']
      );
    }

    const baseRow: ParsedPocsagRow = {
      timestamp: rawRow['timestamp(string)'],
      address: parseInt(rawRow['address(string)']),
      functionBits: parseInt(rawRow['function_bits(string)']),
      messageFormat: rawRow['message_format(string)'] as MessageType,
      rawSignal: rawRow,
      parsedErrorMessage,
      messagePayload,
      _related1234002RowIdx,
    };
    return baseRow;
  });
  return parsed1TimeRows;
};
