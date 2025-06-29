import { TrainWebSocketServer } from './websocketServer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.WEBSOCKET_PORT || '8080', 10);

console.log('🚀 Starting Train WebSocket Server...');
console.log(`📡 Port: ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Create and start the WebSocket server
const server = new TrainWebSocketServer(PORT);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  server.shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.shutdown();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  server.shutdown();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  server.shutdown();
  process.exit(1);
});

// Log server stats every 30 seconds
setInterval(() => {
  const stats = server.getStats();
  console.log(
    `📊 Server Stats - Clients: ${stats.connectedClients}, Trains: ${
      stats.activeTrains
    }, Uptime: ${Math.floor(stats.uptime)}s`
  );
}, 30000);

console.log('✅ Train WebSocket Server started successfully!');
console.log('📡 Connect to: ws://localhost:' + PORT + '/trains');
