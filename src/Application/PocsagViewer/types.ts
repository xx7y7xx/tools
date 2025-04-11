// The train number, speed, and mileage. e.g. { trainNum: "69012", speed: "19", mileage: "3.3" }
export interface TrainInfo {
  trainNum: number;
  speed: number;
  mileage: number;
}

// POCSAG data from csv file
export interface PocsagData {
  timestamp: string; // e.g. '2025-04-09 23:42:20'
  address: string; // e.g. '1234000'
  function_bits: string; // e.g. '3'
  message_format: string; // e.g. 'Numeric'
  message_content: string; // e.g. '69012  19    33'
}
