import { Pocsag1234002Data, Pocsag1234000Data } from './types';

export class MockDataService {
  private mockDataInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Generate realistic mock POCSAG 1234000 data (train number, speed, mileage)
  generateMockPocsag1234000Data(): Pocsag1234000Data {
    // Realistic train numbers from your CSV data
    const trainNumbers = [
      33044, 27030, 35702, 69012, 23515, 885, 8202, 351, 10, 24014, 337,
    ];
    const randomTrainNumber =
      trainNumbers[Math.floor(Math.random() * trainNumbers.length)];

    // Realistic speed and mileage
    const speed = Math.floor(Math.random() * 200) + 10; // 10-210 km/h
    const mileage = Math.floor(Math.random() * 1000) / 10; // 0.0-100.0 km

    // Generate a realistic POCSAG message format
    const mockMessage = `${randomTrainNumber.toString().padStart(5)}  ${speed
      .toString()
      .padStart(2)}    ${Math.floor(mileage * 10)
      .toString()
      .padStart(2)}`;

    // Create mock data
    const mockData: Pocsag1234000Data = {
      DateTime: new Date().toISOString(),
      pocsag1234000Msg: mockMessage,
      trainNumber: randomTrainNumber,
      speed: speed,
      mileage: mileage,
    };

    return mockData;
  }

  // Generate realistic mock POCSAG 1234002 data
  generateMockPocsag1234002Data(): Pocsag1234002Data {
    // Base coordinates around Beijing
    const baseLat = 39.9042;
    const baseLng = 116.4074;

    // Add some random movement
    const latOffset = (Math.random() - 0.5) * 0.01; // ±0.005 degrees
    const lngOffset = (Math.random() - 0.5) * 0.01; // ±0.005 degrees

    const mockLat = baseLat + latOffset;
    const mockLng = baseLng + lngOffset;

    // Generate a realistic POCSAG message (simplified)
    const mockMessage = `205.2420014430U).9U9)3 (-(202011614264439536971000`;

    // Create mock data
    const mockData: Pocsag1234002Data = {
      DateTime: new Date().toISOString(),
      pocsag1234002Msg: mockMessage,
      wgs84Str: `${mockLat.toFixed(6)},${mockLng.toFixed(6)}`,
      wgs84_latitude: mockLat,
      wgs84_longitude: mockLng,
      gcj02_latitude: mockLat, // For simplicity, using same coordinates
      gcj02_longitude: mockLng,
    };

    return mockData;
  }

  // Start generating mock data
  startMockDataGeneration(intervalMs: number = 5000): void {
    if (this.isRunning) {
      console.log('[MockData] Mock data generation already running');
      return;
    }

    console.log(
      `[MockData] Starting mock data generation every ${intervalMs}ms`
    );
    this.isRunning = true;

    this.mockDataInterval = setInterval(() => {
      // Generate both 1234000 and 1234002 data with the same timestamp
      const timestamp = new Date().toISOString();

      const mock1234000Data = this.generateMockPocsag1234000Data();
      mock1234000Data.DateTime = timestamp;

      const mock1234002Data = this.generateMockPocsag1234002Data();
      mock1234002Data.DateTime = timestamp;

      // Emit both mock data as if they came from UDP
      this.emit('pocsag1234000', mock1234000Data);
      this.emit('pocsag1234002', mock1234002Data);

      console.log('[MockData] Generated mock POCSAG data:', {
        trainNumber: mock1234000Data.trainNumber,
        speed: mock1234000Data.speed,
        mileage: mock1234000Data.mileage,
        latitude: mock1234002Data.gcj02_latitude,
        longitude: mock1234002Data.gcj02_longitude,
        timestamp: timestamp,
      });
    }, intervalMs);
  }

  // Stop generating mock data
  stopMockDataGeneration(): void {
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
      this.mockDataInterval = null;
      this.isRunning = false;
      console.log('[MockData] Stopped mock data generation');
    }
  }

  // Check if mock data generation is running
  isMockDataRunning(): boolean {
    return this.isRunning;
  }

  // Event emitter functionality
  private listeners: { [event: string]: Function[] } = {};

  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  removeAllListeners(): void {
    this.listeners = {};
  }
}

export const mockDataService = new MockDataService();
