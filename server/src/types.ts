export interface TrainPosition {
  id: string;
  trainNumber: string;
  timestamp: string;
  direction?: number;
  status?: 'active' | 'stopped' | 'maintenance';
  pocsag1234002Data: {
    wgs84_latitude?: number;
    wgs84_longitude?: number;
    gcj02_latitude?: number;
    gcj02_longitude?: number;
    rawMessage?: string;
  };
}

export interface WebSocketMessage {
  type: 'train_position' | 'train_positions' | 'error' | 'ping' | 'pong';
  data?: any;
  timestamp: string;
}

export interface TrainPositionMessage extends WebSocketMessage {
  type: 'train_position';
  data: TrainPosition;
}

export interface TrainPositionsMessage extends WebSocketMessage {
  type: 'train_positions';
  data: TrainPosition[];
}

export interface ClientInfo {
  id: string;
  connectedAt: Date;
  lastPing: Date;
  subscriptions: string[];
}

export interface Pocsag1234002Data {
  DateTime: string;
  pocsag1234002Msg: string;
  wgs84Str: string;
  wgs84_latitude: number;
  wgs84_longitude: number;
  gcj02_latitude: number;
  gcj02_longitude: number;
}
