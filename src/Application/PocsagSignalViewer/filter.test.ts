import { filterPocsagData } from './filter';
import { MessageType } from '../PocsagViewer/types';

const mockData = [
  {
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
      timestamp: '2024-01-01 12:00:00',
      address: '1234000',
      function_bits: '1',
      message_format: MessageType.Numeric,
      message_content: 'Train 123 speed 45 mileage 12.5',
    },
    parsedErrorMessage: null,
  },
  {
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
      timestamp: '2024-01-02 13:00:00',
      address: '1234001',
      function_bits: '2',
      message_format: MessageType.Alpha,
      message_content: 'Alpha message test',
    },
    parsedErrorMessage: null,
  },
  {
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
      timestamp: '2024-01-03 14:00:00',
      address: '1234002',
      function_bits: '3',
      message_format: MessageType.Skyper,
      message_content:
        '<SOH><ETX>G<DLE><SI>K`<BS>z;o[B>><NUL><SOH>!W<SI>61K+!i<NUL><DEL>',
    },
    parsedErrorMessage: null,
  },
  {
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
      timestamp: '2025-04-11 19:39:09',
      address: '1234002',
      function_bits: '3',
      message_format: MessageType.Skyper,
      message_content:
        '<SOH><ETX>G<DLE><SI>K`<BS>z;o[B>><NUL><SOH>!W<SI>61K+!i<NUL><DEL>',
    },
    parsedErrorMessage: null,
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
    expect(result[0].rawSignal.message_content).toBe(
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
    expect(result[0].rawSignal.message_content).toBe('Alpha message test');
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
