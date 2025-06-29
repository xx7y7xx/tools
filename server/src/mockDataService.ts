import { Pocsag1234002Data } from './types';

export class MockDataService {
  private mockDataInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

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

    console.log(`[MockData] Starting mock data generation every ${intervalMs}ms`);
    this.isRunning = true;

    this.mockDataInterval = setInterval(() => {
      const mockData = this.generateMockPocsag1234002Data();
      
      // Emit the mock data as if it came from UDP
      this.emit('pocsag1234002', mockData);
      
      console.log('[MockData] Generated mock POCSAG 1234002 data:', {
        latitude: mockData.gcj02_latitude,
        longitude: mockData.gcj02_longitude,
        timestamp: mockData.DateTime,
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
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  removeAllListeners(): void {
    this.listeners = {};
  }
}

export const mockDataService = new MockDataService();
