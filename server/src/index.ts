import { WebSocketServer } from './websocket-server';
import { trainDataService } from './trainDataService';
import { UDPBridge } from './udpBridge';
import { Pocsag1234002Data } from './types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const WS_PORT = parseInt(process.env.WS_PORT || '8080');
const UDP_PORT = parseInt(process.env.UDP_PORT || '9999');

console.log('Starting Train Position WebSocket Server...');
console.log(`WebSocket Port: ${WS_PORT}`);
console.log(`UDP Bridge Port: ${UDP_PORT}`);

// Create WebSocket server
const wsServer = new WebSocketServer(WS_PORT);

// Create UDP bridge
const udpBridge = new UDPBridge(UDP_PORT);

// Connect UDP bridge to WebSocket server
udpBridge.on('pocsag1234002', (pocsagData: Pocsag1234002Data) => {
  console.log('[Main] Received POCSAG 1234002 data:', {
    latitude: pocsagData.gcj02_latitude,
    longitude: pocsagData.gcj02_longitude,
    timestamp: pocsagData.DateTime,
  });

  // Convert POCSAG data to train position and broadcast to WebSocket clients
  const trainPosition =
    trainDataService.convertPocsag1234002ToTrainPosition(pocsagData);
  trainDataService.updateTrainPosition(trainPosition);

  // Broadcast to all WebSocket clients
  wsServer.broadcastTrainPosition(trainPosition);
});

// Start both servers
udpBridge.start();
wsServer.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  udpBridge.stop();
  wsServer.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down servers...');
  udpBridge.stop();
  wsServer.stop();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  udpBridge.stop();
  wsServer.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  udpBridge.stop();
  wsServer.stop();
  process.exit(1);
});

// Log server stats every 30 seconds
setInterval(() => {
  const stats = wsServer.getStats();
  console.log(
    `📊 Server Stats - Clients: ${
      stats.connectedClients
    }, Trains: ${trainDataService.getTrainCount()}`
  );
}, 30000);

console.log('Servers started successfully!');
console.log('Press Ctrl+C to stop the servers.');
