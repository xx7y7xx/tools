import { TrainPosition, Pocsag1234002Data, Pocsag1234000Data } from './types';

export class TrainDataService {
  private trainPositions: Map<string, TrainPosition> = new Map();
  private pending1234000Data: Map<string, Pocsag1234000Data> = new Map(); // Store 1234000 data by timestamp
  private updateCallbacks: ((train: TrainPosition) => void)[] = [];

  // Convert POCSAG 1234002 data to train position
  convertPocsag1234002ToTrainPosition(
    pocsagData: Pocsag1234002Data
  ): TrainPosition {
    // Generate a unique train ID based on timestamp and coordinates
    const trainId = `train-${Date.now()}-${pocsagData.gcj02_latitude.toFixed(
      6
    )}-${pocsagData.gcj02_longitude.toFixed(6)}`;

    // Check if we have corresponding 1234000 data
    const related1234000Data = this.pending1234000Data.get(pocsagData.DateTime);

    const trainPosition: TrainPosition = {
      id: trainId,
      trainNumber: related1234000Data?.trainNumber,
      // Store all coordinate data in pocsag1234002Data
      pocsag1234002Data: {
        pocsagMsgTimestamp: pocsagData.DateTime,
        wgs84_latitude: pocsagData.wgs84_latitude,
        wgs84_longitude: pocsagData.wgs84_longitude,
        gcj02_latitude: pocsagData.gcj02_latitude,
        gcj02_longitude: pocsagData.gcj02_longitude,
        rawMessage: pocsagData.pocsag1234002Msg,
      },
      // Include 1234000 data if available
      pocsag1234000Data: related1234000Data
        ? {
            pocsagMsgTimestamp: related1234000Data.DateTime,
            trainNumber: related1234000Data.trainNumber,
            speed: related1234000Data.speed,
            mileage: related1234000Data.mileage,
            rawMessage: related1234000Data.pocsag1234000Msg,
          }
        : undefined,
    };

    // Clean up the used 1234000 data
    if (related1234000Data) {
      this.pending1234000Data.delete(pocsagData.DateTime);
    }

    return trainPosition;
  }

  // Store 1234000 data for correlation with 1234002
  storePocsag1234000Data(pocsagData: Pocsag1234000Data): void {
    this.pending1234000Data.set(pocsagData.DateTime, pocsagData);

    // Clean up old data (older than 5 seconds)
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    for (const [timestamp] of this.pending1234000Data) {
      if (timestamp < fiveSecondsAgo) {
        this.pending1234000Data.delete(timestamp);
      }
    }
  }

  // Update train position from POCSAG 1234002 data
  updateTrainPositionFromPocsag1234002(pocsagData: Pocsag1234002Data): void {
    const trainPosition = this.convertPocsag1234002ToTrainPosition(pocsagData);
    this.updateTrainPosition(trainPosition);
  }

  // Update train position
  updateTrainPosition(train: TrainPosition): void {
    this.trainPositions.set(train.id, train);

    // Notify all callbacks
    this.updateCallbacks.forEach((callback) => callback(train));
  }

  // Get all train positions
  getAllTrainPositions(): TrainPosition[] {
    return Array.from(this.trainPositions.values());
  }

  // Get specific train position
  getTrainPosition(trainId: string): TrainPosition | undefined {
    return this.trainPositions.get(trainId);
  }

  // Remove train position
  removeTrainPosition(trainId: string): boolean {
    return this.trainPositions.delete(trainId);
  }

  // Subscribe to train position updates
  onTrainUpdate(callback: (train: TrainPosition) => void): () => void {
    this.updateCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  // Generate mock train data for testing
  generateMockTrainData(): TrainPosition[] {
    const mockTrains: TrainPosition[] = [
      {
        id: 'train-1',
        trainNumber: 33044,
        pocsag1234002Data: {
          pocsagMsgTimestamp: new Date().toISOString(),
          gcj02_latitude: 39.9042 + (Math.random() - 0.5) * 0.01,
          gcj02_longitude: 116.4074 + (Math.random() - 0.5) * 0.01,
        },
        pocsag1234000Data: {
          pocsagMsgTimestamp: new Date().toISOString(),
          trainNumber: 33044,
          speed: 13,
          mileage: 3.3,
        },
      },
      {
        id: 'train-2',
        trainNumber: 27030,
        pocsag1234002Data: {
          pocsagMsgTimestamp: new Date().toISOString(),
          gcj02_latitude: 39.9142 + (Math.random() - 0.5) * 0.01,
          gcj02_longitude: 116.4174 + (Math.random() - 0.5) * 0.01,
        },
        pocsag1234000Data: {
          pocsagMsgTimestamp: new Date().toISOString(),
          trainNumber: 27030,
          speed: 18,
          mileage: 3.0,
        },
      },
      {
        id: 'train-3',
        trainNumber: 35702,
        pocsag1234002Data: {
          pocsagMsgTimestamp: new Date().toISOString(),
          gcj02_latitude: 39.8942 + (Math.random() - 0.5) * 0.01,
          gcj02_longitude: 116.3974 + (Math.random() - 0.5) * 0.01,
        },
        pocsag1234000Data: {
          pocsagMsgTimestamp: new Date().toISOString(),
          trainNumber: 35702,
          speed: 19,
          mileage: 5.4,
        },
      },
    ];

    return mockTrains;
  }

  // Clear all train data
  clearAllTrains(): void {
    this.trainPositions.clear();
    this.pending1234000Data.clear();
  }

  // Get train count
  getTrainCount(): number {
    return this.trainPositions.size;
  }
}

export const trainDataService = new TrainDataService();
