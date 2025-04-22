import { filterPocsagData } from './filter';
import { MessageType } from '../PocsagViewer/types';

const mockData = [
  {
    globalIndex: 0,
    timestamp: '2024-01-01 12:00:00',
    address: 1234000,
    functionBits: 1,
    messageFormat: MessageType.Numeric,
    messagePayload: {
      trainNumber: 123,
      speed: 45,
      mileage: 12.5,
    },
    rawSignal: {
      'global_index(number)': '0',
      'timestamp(string)': '2024-01-01 12:00:00',
      'address(string)': '1234000',
      'function_bits(string)': '1',
      'message_format(string)': MessageType.Numeric,
      'message_content(string)': 'Train 123 speed 45 mileage 12.5',
      'parsed_error_message(null|string)': null,
      'message_payload(json|null)': null,
      'related_1234002_row_idx(number|null)': null,
    },
    parsedErrorMessage: null,
    _related1234002RowIdx: null,
  },
  {
    globalIndex: 1,
    timestamp: '2024-01-02 13:00:00',
    address: 1234001,
    functionBits: 2,
    messageFormat: MessageType.Alpha,
    messagePayload: {
      trainNumber: 123,
      speed: 45,
      mileage: 12.5,
    },
    rawSignal: {
      'global_index(number)': '1',
      'timestamp(string)': '2024-01-02 13:00:00',
      'address(string)': '1234001',
      'function_bits(string)': '2',
      'message_format(string)': MessageType.Alpha,
      'message_content(string)': 'Alpha message test',
      'parsed_error_message(null|string)': null,
      'message_payload(json|null)': null,
      'related_1234002_row_idx(number|null)': null,
    },
    parsedErrorMessage: null,
    _related1234002RowIdx: null,
  },
  {
    globalIndex: 2,
    timestamp: '2024-01-03 14:00:00',
    address: 1234002,
    functionBits: 3,
    messageFormat: MessageType.Skyper,
    messagePayload: {
      wgs84Str: "31°20.1079' 120°37.6039'",
      gcj02: {
        latitude: 39.85489,
        longitude: 116.22072,
      },
    },
    rawSignal: {
      'global_index(number)': '2',
      'timestamp(string)': '2024-01-03 14:00:00',
      'address(string)': '1234002',
      'function_bits(string)': '3',
      'message_format(string)': MessageType.Skyper,
      'message_content(string)':
        '<SOH><ETX>G<DLE><SI>K`<BS>z;o[B>><NUL><SOH>!W<SI>61K+!i<NUL><DEL>',
      'parsed_error_message(null|string)': null,
      'message_payload(json|null)': null,
      'related_1234002_row_idx(number|null)': null,
    },
    parsedErrorMessage: null,
    _related1234002RowIdx: null,
  },
  {
    globalIndex: 3,
    timestamp: '2025-04-11 19:39:09',
    address: 1234002,
    functionBits: 3,
    messageFormat: MessageType.Skyper,
    messagePayload: {
      wgs84Str: "31°20.1079' 120°37.6039'",
      gcj02: {
        latitude: 39.85489,
        longitude: 116.22072,
      },
    },
    rawSignal: {
      'global_index(number)': '3',
      'timestamp(string)': '2025-04-11 19:39:09',
      'address(string)': '1234002',
      'function_bits(string)': '3',
      'message_format(string)': MessageType.Skyper,
      'message_content(string)':
        '<SOH><ETX>G<DLE><SI>K`<BS>z;o[B>><NUL><SOH>!W<SI>61K+!i<NUL><DEL>',
      'parsed_error_message(null|string)': null,
      'message_payload(json|null)': null,
      'related_1234002_row_idx(number|null)': null,
    },
    parsedErrorMessage: null,
    _related1234002RowIdx: null,
  },
];

describe('filterPocsagData', () => {
  it('should return all data when no filters are applied', () => {
    const result = filterPocsagData(mockData, {});
    expect(result).toHaveLength(4);
    expect(result).toEqual(mockData);
  });

  it('should filter by content (case insensitive)', () => {
    const result = filterPocsagData(mockData, { content: 'train' });
    expect(result).toHaveLength(1);
    expect(result[0].rawSignal['message_content(string)']).toBe(
      'Train 123 speed 45 mileage 12.5'
    );
  });

  it('should filter by address', () => {
    const result = filterPocsagData(mockData, { address: '1234001' });
    expect(result).toHaveLength(1);
    expect(result[0].address).toBe(1234001);
  });

  it('should filter by message type', () => {
    const result = filterPocsagData(mockData, { type: MessageType.Numeric });
    expect(result).toHaveLength(1);
    expect(result[0].messageFormat).toBe(MessageType.Numeric);
  });

  it('should filter by timestamp', () => {
    const result = filterPocsagData(mockData, { timestamp: '2024-01-02' });
    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe('2024-01-02 13:00:00');
  });

  it('should handle multiple filters', () => {
    const result = filterPocsagData(mockData, {
      content: 'test',
      type: MessageType.Alpha,
    });
    expect(result).toHaveLength(1);
    expect(result[0].messageFormat).toBe(MessageType.Alpha);
    expect(result[0].rawSignal['message_content(string)']).toBe(
      'Alpha message test'
    );
  });

  it('should handle empty filters', () => {
    const result = filterPocsagData(mockData, {
      content: '',
      address: '',
      type: null,
      timestamp: '',
    });
    expect(result).toHaveLength(4);
  });

  it('should handle non-matching filters', () => {
    const result = filterPocsagData(mockData, {
      content: 'nonexistent',
      address: '9999999',
      type: MessageType.Numeric,
      timestamp: '2020-01-01',
    });
    expect(result).toHaveLength(0);
  });

  it('should handle partial matches in timestamp', () => {
    const result = filterPocsagData(mockData, { timestamp: '2024-01' });
    expect(result).toHaveLength(3);
  });

  it('should handle partial matches in address', () => {
    const result = filterPocsagData(mockData, { address: '1234' });
    expect(result).toHaveLength(4);
  });
});
