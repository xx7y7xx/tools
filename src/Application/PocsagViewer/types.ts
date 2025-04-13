// The train number, speed, and mileage. e.g. { trainNumber: "69012", speed: "19", mileage: "3.3" }
export interface TrainInfo {
  trainNumber: number;
  speed: number;
  mileage: number;
}

export type ConvertResult = {
  str: { trainNumber: string; speed: string; mileage: string };
  data?: TrainInfo;
  err?: string;
};

// Raw POCSAG data from csv file
export interface RawPocsagRow {
  timestamp: string; // e.g. '2025-04-09 23:42:20'
  address: string; // e.g. '1234000'
  function_bits: string; // e.g. '3'
  message_format: string; // e.g. 'Numeric'
  message_content: string; // e.g. '69012  19    33'
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
}

export type Pocsag1234002ParseResult = {
  latitude?: string;
  longitude?: string;
  err?: string;
};
