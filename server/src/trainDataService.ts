import { TrainPosition, Pocsag1234002Data } from './types';

export class TrainDataService {
  private trainPositions: Map<string, TrainPosition> = new Map();
  private railwayLines: Map<string, any> = new Map();
  private updateCallbacks: ((train: TrainPosition) => void)[] = [];

  // Convert POCSAG 1234002 data to train position
  convertPocsag1234002ToTrainPosition(
    pocsagData: Pocsag1234002Data
  ): TrainPosition {
    // Generate a unique train ID based on timestamp and coordinates
    const trainId = `train-${Date.now()}-${pocsagData.gcj02_latitude.toFixed(
      6
    )}-${pocsagData.gcj02_longitude.toFixed(6)}`;

    const trainPosition: TrainPosition = {
      id: trainId,
      trainNumber: 'Unknown', // POCSAG 1234002 doesn't contain train number
      direction: 0, // Unknown direction
      status: 'active',
      // Store all coordinate data in pocsag1234002Data
      pocsag1234002Data: {
        pocsagMsgTimestamp: pocsagData.DateTime,
        wgs84_latitude: pocsagData.wgs84_latitude,
        wgs84_longitude: pocsagData.wgs84_longitude,
        gcj02_latitude: pocsagData.gcj02_latitude,
        gcj02_longitude: pocsagData.gcj02_longitude,
        rawMessage: pocsagData.pocsag1234002Msg,
      },
    };

    return trainPosition;
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
        id: 'train-G372',
        trainNumber: 'G372',
        direction: Math.random() * 360,
        status: 'active',
        pocsag1234002Data: {
          pocsagMsgTimestamp: new Date().toISOString(),
          gcj02_latitude: 39.9042 + (Math.random() - 0.5) * 0.01,
          gcj02_longitude: 116.4074 + (Math.random() - 0.5) * 0.01,
        },
      },
      {
        id: 'train-D123',
        trainNumber: 'D123',
        direction: Math.random() * 360,
        status: 'active',
        pocsag1234002Data: {
          pocsagMsgTimestamp: new Date().toISOString(),
          gcj02_latitude: 39.9142 + (Math.random() - 0.5) * 0.01,
          gcj02_longitude: 116.4174 + (Math.random() - 0.5) * 0.01,
        },
      },
      {
        id: 'train-K456',
        trainNumber: 'K456',
        direction: Math.random() * 360,
        status: 'active',
        pocsag1234002Data: {
          pocsagMsgTimestamp: new Date().toISOString(),
          gcj02_latitude: 39.8942 + (Math.random() - 0.5) * 0.01,
          gcj02_longitude: 116.3974 + (Math.random() - 0.5) * 0.01,
        },
      },
    ];

    return mockTrains;
  }

  // Clear all train data
  clearAllTrains(): void {
    this.trainPositions.clear();
  }

  // Get train count
  getTrainCount(): number {
    return this.trainPositions.size;
  }
}

export const trainDataService = new TrainDataService();
