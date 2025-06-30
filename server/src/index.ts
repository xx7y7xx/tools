import dotenv from 'dotenv';

import { WebSocketServer } from './websocket_server';
import { UDPBridge } from './udpBridge';
import { Pocsag1234002Data, Pocsag1234000Data } from './types';
import { trainDataService } from './trainDataService';
import { mockDataService } from './mockDataService';

// Load environment variables
dotenv.config();

const WS_PORT = parseInt(process.env.WS_PORT || '8080');
const UDP_PORT = parseInt(process.env.UDP_PORT || '9999');
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';
const MOCK_DATA_INTERVAL = parseInt(process.env.MOCK_DATA_INTERVAL || '5000');

console.log('Starting Train Position WebSocket Server...');
console.log(`WebSocket Port: ${WS_PORT}`);
console.log(`UDP Bridge Port: ${UDP_PORT}`);
console.log(`Mock Data Mode: ${USE_MOCK_DATA ? 'ENABLED' : 'DISABLED'}`);
if (USE_MOCK_DATA) {
  console.log(`Mock Data Interval: ${MOCK_DATA_INTERVAL}ms`);
}

// Create WebSocket server
const wsServer = new WebSocketServer(WS_PORT);

// Create UDP bridge (only if not using mock data)
let udpBridge: UDPBridge | null = null;

// Function to handle POCSAG 1234000 data (train number, speed, mileage)
const handlePocsag1234000Data = (pocsagData: Pocsag1234000Data) => {
  console.log('[Main] Received POCSAG 1234000 data:', {
    trainNumber: pocsagData.trainNumber,
    speed: pocsagData.speed,
    mileage: pocsagData.mileage,
    timestamp: pocsagData.DateTime,
    source: USE_MOCK_DATA ? 'MOCK' : 'UDP',
  });

  // Store 1234000 data for correlation with 1234002
  trainDataService.storePocsag1234000Data(pocsagData);
};

// Function to handle POCSAG 1234002 data (location)
const handlePocsag1234002Data = (pocsagData: Pocsag1234002Data) => {
  console.log('[Main] Received POCSAG 1234002 data:', {
    latitude: pocsagData.gcj02_latitude,
    longitude: pocsagData.gcj02_longitude,
    timestamp: pocsagData.DateTime,
    source: USE_MOCK_DATA ? 'MOCK' : 'UDP',
  });

  // Convert POCSAG data to train position and broadcast to WebSocket clients
  const trainPosition =
    trainDataService.convertPocsag1234002ToTrainPosition(pocsagData);
  trainDataService.updateTrainPosition(trainPosition);

  // Broadcast to all WebSocket clients
  wsServer.broadcastTrainPosition(trainPosition);
};

if (USE_MOCK_DATA) {
  // Use mock data service
  console.log('[Main] Using mock data service');
  mockDataService.on('pocsag1234000', handlePocsag1234000Data);
  mockDataService.on('pocsag1234002', handlePocsag1234002Data);
  mockDataService.startMockDataGeneration(MOCK_DATA_INTERVAL);
} else {
  // Use real UDP bridge
  console.log('[Main] Using real UDP bridge');
  udpBridge = new UDPBridge(UDP_PORT);
  udpBridge.on('pocsag1234000', handlePocsag1234000Data);
  udpBridge.on('pocsag1234002', handlePocsag1234002Data);
  udpBridge.start();
}

// Start WebSocket server
wsServer.start();

// Handle graceful shutdown
const shutdown = () => {
  console.log('\nShutting down servers...');

  if (USE_MOCK_DATA) {
    mockDataService.stopMockDataGeneration();
    mockDataService.removeAllListeners();
  } else if (udpBridge) {
    udpBridge.stop();
  }

  wsServer.stop();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

// Log server stats every 30 seconds
setInterval(() => {
  const stats = wsServer.getStats();
  const dataSource = USE_MOCK_DATA ? 'MOCK' : 'UDP';
  console.log(
    `📊 Server Stats - Clients: ${
      stats.connectedClients
    }, Trains: ${trainDataService.getTrainCount()}, Data Source: ${dataSource}`
  );
}, 30000);

console.log('Servers started successfully!');
console.log('Press Ctrl+C to stop the servers.');
