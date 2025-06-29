import { TrainPosition, PocsagData } from './types';

export class TrainDataService {
  private trainPositions: Map<string, TrainPosition> = new Map();
  private railwayLines: Map<string, any> = new Map();
  private updateCallbacks: ((train: TrainPosition) => void)[] = [];

  // Convert POCSAG data to train position
  convertPocsagToTrainPosition(pocsagData: PocsagData): TrainPosition | null {
    if (!pocsagData.trainNumber || !pocsagData.speed || !pocsagData.mileage) {
      return null;
    }

    // Generate coordinates based on mileage (this is a simplified approach)
    // In a real implementation, you would use railway line data to calculate exact coordinates
    const baseLat = 39.9042; // Beijing latitude
    const baseLng = 116.4074; // Beijing longitude

    // Simple coordinate calculation based on mileage
    const latOffset =
      pocsagData.mileage * 0.001 * Math.sin(pocsagData.mileage * 0.1);
    const lngOffset =
      pocsagData.mileage * 0.001 * Math.cos(pocsagData.mileage * 0.1);

    const trainPosition: TrainPosition = {
      id: `train-${pocsagData.trainNumber}`,
      trainNumber: pocsagData.trainNumber,
      latitude: baseLat + latOffset,
      longitude: baseLng + lngOffset,
      speed: pocsagData.speed,
      mileage: pocsagData.mileage,
      timestamp: pocsagData.timestamp,
      direction: Math.random() * 360, // Random direction for demo
      status: pocsagData.speed > 0 ? 'active' : 'stopped',
    };

    return trainPosition;
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
        latitude: 39.9042 + (Math.random() - 0.5) * 0.01,
        longitude: 116.4074 + (Math.random() - 0.5) * 0.01,
        speed: 70 + Math.random() * 30,
        mileage: 12.3 + Math.random() * 0.1,
        timestamp: new Date().toISOString(),
        direction: Math.random() * 360,
        status: 'active',
      },
      {
        id: 'train-D123',
        trainNumber: 'D123',
        latitude: 39.9142 + (Math.random() - 0.5) * 0.01,
        longitude: 116.4174 + (Math.random() - 0.5) * 0.01,
        speed: 60 + Math.random() * 20,
        mileage: 8.7 + Math.random() * 0.1,
        timestamp: new Date().toISOString(),
        direction: Math.random() * 360,
        status: 'active',
      },
      {
        id: 'train-K456',
        trainNumber: 'K456',
        latitude: 39.8942 + (Math.random() - 0.5) * 0.01,
        longitude: 116.3974 + (Math.random() - 0.5) * 0.01,
        speed: 45 + Math.random() * 15,
        mileage: 15.2 + Math.random() * 0.1,
        timestamp: new Date().toISOString(),
        direction: Math.random() * 360,
        status: 'active',
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
