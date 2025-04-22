import { parsePocsagData } from './pocsagParser';
import { MessageType, ParsedPocsagRow, RawPocsagRow } from './types';

describe('parsePocsagData', () => {
  it('should parse the pocsag data', () => {
    const rawPocsagRows: RawPocsagRow[] = [
      {
        'global_index(number)': '0',
        'timestamp(string)': '2025-04-09 23:42:20',
        'address(string)': '1234000',
        'function_bits(string)': '3',
        'message_format(string)': MessageType.Numeric,
        'message_content(string)': '69012  19    33',
        'parsed_error_message(null|string)': null,
        'message_payload(json|null)': JSON.stringify({
          trainNumber: 69012,
          speed: 19,
          mileage: 3.3,
        }),
        'related_1234002_row_idx(number|null)': null,
      },
      {
        'global_index(number)': '1',
        'timestamp(string)': '2025-04-09 23:42:20',
        'address(string)': '1234002',
        'function_bits(string)': '3',
        'message_format(string)': MessageType.Numeric,
        'message_content(string)':
          '20202310190532U7]1 9U3 [-[202011614023139505802000',
        'parsed_error_message(null|string)': null,
        'message_payload(json|null)': JSON.stringify({
          wgs84Str: "39°50.5802' 116°14.0231'",
          wgs84: {
            latitude: 39.843,
            longitude: 116.23372,
          },
          gcj02: {
            latitude: 39.84421697498666,
            longitude: 116.23975257786913,
          },
        }),
        'related_1234002_row_idx(number|null)': null,
      },
    ];
    const parsedPocsagRows: ParsedPocsagRow[] = [
      {
        globalIndex: 0,
        timestamp: '2025-04-09 23:42:20',
        address: 1234000,
        functionBits: 3,
        messageFormat: MessageType.Numeric,
        parsedErrorMessage: null,
        messagePayload: {
          trainNumber: 69012,
          speed: 19,
          mileage: 3.3,
        },
        rawSignal: {
          'global_index(number)': '0',
          'timestamp(string)': '2025-04-09 23:42:20',
          'address(string)': '1234000',
          'function_bits(string)': '3',
          'message_format(string)': MessageType.Numeric,
          'message_content(string)': '69012  19    33',
          'parsed_error_message(null|string)': null,
          'message_payload(json|null)': JSON.stringify({
            trainNumber: 69012,
            speed: 19,
            mileage: 3.3,
          }),
          'related_1234002_row_idx(number|null)': null,
        },
        _related1234002RowIdx: null,
      },
      {
        globalIndex: 1,
        timestamp: '2025-04-09 23:42:20',
        address: 1234002,
        functionBits: 3,
        messageFormat: MessageType.Numeric,
        parsedErrorMessage: null,
        messagePayload: {
          wgs84Str: "39°50.5802' 116°14.0231'",
          wgs84: {
            latitude: 39.843,
            longitude: 116.23372,
          },
          gcj02: {
            latitude: 39.84421697498666,
            longitude: 116.23975257786913,
          },
        },
        rawSignal: {
          'global_index(number)': '1',
          'timestamp(string)': '2025-04-09 23:42:20',
          'address(string)': '1234002',
          'function_bits(string)': '3',
          'message_format(string)': MessageType.Numeric,
          'message_content(string)':
            '20202310190532U7]1 9U3 [-[202011614023139505802000',
          'parsed_error_message(null|string)': null,
          'message_payload(json|null)': JSON.stringify({
            wgs84Str: "39°50.5802' 116°14.0231'",
            wgs84: {
              latitude: 39.843,
              longitude: 116.23372,
            },
            gcj02: {
              latitude: 39.84421697498666,
              longitude: 116.23975257786913,
            },
          }),
          'related_1234002_row_idx(number|null)': null,
        },
        _related1234002RowIdx: null,
      },
    ];
    const parsedPocsagData = parsePocsagData(rawPocsagRows);
    expect(parsedPocsagData).toEqual(parsedPocsagRows);
  });
});
