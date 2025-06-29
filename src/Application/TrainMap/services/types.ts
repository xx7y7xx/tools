export interface TrainPosition {
  id: string;
  trainNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  mileage: number;
  timestamp: string;
  direction?: number;
  status?: 'active' | 'stopped' | 'maintenance';
}

export interface RailwayLine {
  id: string;
  name: string;
  coordinates: [number, number][];
  color: string;
}

export interface WebSocketMessage {
  type:
    | 'train_position'
    | 'train_positions'
    | 'railway_lines'
    | 'error'
    | 'ping'
    | 'pong';
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

export interface RailwayLinesMessage extends WebSocketMessage {
  type: 'railway_lines';
  data: RailwayLine[];
}
