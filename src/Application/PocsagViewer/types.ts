// The train number, speed, and mileage. e.g. { trainNumber: "69012", speed: "19", mileage: "3.3" }
export interface TrainInfo {
  trainNumber: number;
  speed: number;
  mileage: number;
}

// Raw POCSAG data from TSV file
// global_index(number)	timestamp(string)	address(string)	function_bits(string)	message_format(string)	message_content(string)	parsed_error_message(null|string)	message_payload(json|null)
export interface RawPocsagRow {
  'global_index(number)': string;
  'timestamp(string)': string; // e.g. '2025-04-09 23:42:20'
  'address(string)': string; // e.g. '1234000'
  'function_bits(string)': string; // e.g. '3'
  'message_format(string)': string; // e.g. 'Numeric'
  'message_content(string)': string; // e.g. '69012  19    33'
  'parsed_error_message(null|string)': string | null; // e.g. null
  'message_payload(json|null)': string | null; // e.g. null
  'related_1234002_row_idx(number|null)': string | null; // e.g. null
}

// Parsed POCSAG data from TSV file

// 1234000 payload
export interface ParsedPocsagPayload1234000 {
  trainNumber: number; // 列车号 21022
  speed: number; // 速度 19 (km/h)
  mileage: number; // 里程 61 (km)
}

// 1234002 payload
export interface ParsedPocsagPayload1234002 {
  wgs84Str?: string; // e.g. "31°20.1079' 120°37.6039'"
  gcj02?: {
    latitude: number; // 纬度 39.85489
    longitude: number; // 经度 116.22072
  };
  wgs84?: {
    latitude: number;
    longitude: number;
  };
}

export interface ParsedPocsagRow {
  globalIndex: number; // e.g. 1
  timestamp: string; // e.g. '2025-04-09 23:42:17'
  address: number; // e.g. 1234000
  functionBits: number; // e.g. 3
  messageFormat: MessageType; // e.g. 'Numeric'
  messagePayload?: ParsedPocsagPayload1234000 | ParsedPocsagPayload1234002;
  parsedErrorMessage: string | null; // e.g. 'Invalid message content'
  rawSignal: RawPocsagRow;
  _related1234002RowIdx: number | null;
}

export enum MessageType {
  Numeric = 'Numeric',
  Alpha = 'Alpha',
  Skyper = 'Skyper',
}

/**
 * How to name the fields?
 *
 * Link: https://www.rtl-sdr.com/rtl-sdr-tutorial-pocsag-pager-decoding/comment-page-201/
 * Bitrate=1200
 * Date       Time     | Address | ? | Type    | Monitored Messages
 * 2025-04-09 23:42:17 | 1234000 | 3 | Numeric | 69012  27    31
 */
export interface TrainSignalRecord {
  timestamp: string; // e.g. '2025-04-09 23:42:17'
  address: string; // 设备地址 "1234000",
  messageType: MessageType; // 枚举值：Numeric/Alpha/Skyper, but deepseek suggests: `signalType: SignalType;`
  functionCode: number; // 功能码 3
  payload: {
    trainNumber: number; // 列车号 21022
    speed: number; // 速度 19 (km/h)
    mileage: number; // 里程 61 (km)
    rawData: string; // 原始数据 "21022  19    61"
  };
  _related1234002RowIdx: number | null;
}

export interface GpsPoint {
  latitude: number;
  longitude: number;
  rawMessage: string;
}
