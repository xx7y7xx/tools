# Train WebSocket Server

A real-time WebSocket server for streaming train position data to connected clients.

## Features

- 🚂 Real-time train position updates
- 📡 WebSocket communication with automatic reconnection
- 🔄 Mock data simulation for testing
- 📊 Server statistics and monitoring
- 🛡️ Graceful shutdown handling
- 🔌 Client connection management
- 📍 Train subscription system

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy the example environment file and modify as needed:

```bash
cp env.example .env
```

### 3. Build and Start

```bash
# Build TypeScript
npm run build

# Start the server
npm start

# Or run in development mode with auto-reload
npm run dev
```

## API Reference

### WebSocket Connection

Connect to the WebSocket server at: `ws://localhost:8080/trains`

### Message Types

#### Client to Server

- `ping` - Keep connection alive
- `subscribe_train` - Subscribe to specific train updates
- `unsubscribe_train` - Unsubscribe from specific train updates
- `get_all_trains` - Request all current train positions

#### Server to Client

- `pong` - Response to ping
- `train_position` - Single train position update
- `train_positions` - All train positions
- `error` - Error message

### Example Usage

```javascript
const ws = new WebSocket('ws://localhost:8080/trains');

ws.onopen = () => {
  console.log('Connected to train server');

  // Subscribe to specific train
  ws.send(
    JSON.stringify({
      type: 'subscribe_train',
      trainId: 'train-G372',
    })
  );

  // Get all trains
  ws.send(
    JSON.stringify({
      type: 'get_all_trains',
    })
  );
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'train_position':
      console.log('Train update:', message.data);
      break;
    case 'train_positions':
      console.log('All trains:', message.data);
      break;
    case 'pong':
      console.log('Server ping response');
      break;
  }
};
```

## Integration with POCSAG Data

The server can integrate with your existing POCSAG data processing system:

```typescript
import { TrainWebSocketServer } from './websocketServer';

const server = new TrainWebSocketServer(8080);

// Process POCSAG data
server.processPocsagData({
  trainNumber: 'G372',
  speed: 120,
  mileage: 15.3,
  timestamp: new Date().toISOString(),
  address: '123456',
});
```

## Development

### Project Structure

```
server/
├── src/
│   ├── index.ts              # Main entry point
│   ├── websocketServer.ts    # WebSocket server implementation
│   ├── trainDataService.ts   # Train data management
│   └── types.ts              # TypeScript interfaces
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run watch` - Watch mode with nodemon

### Environment Variables

- `WEBSOCKET_PORT` - Port for WebSocket server (default: 8080)
- `NODE_ENV` - Environment (development/production)
- `POCSAG_UDP_PORT` - POCSAG UDP server port (optional)
- `POCSAG_HOST` - POCSAG server host (optional)

## Monitoring

The server provides real-time statistics:

- Connected clients count
- Active trains count
- Server uptime
- Connection logs

## Error Handling

The server includes comprehensive error handling:

- Graceful shutdown on SIGINT/SIGTERM
- Uncaught exception handling
- WebSocket connection error recovery
- Invalid message format handling

## Performance

- Efficient WebSocket message broadcasting
- Client subscription filtering
- Automatic ping/pong for connection health
- Memory-efficient train data storage

## Security

- Input validation for all messages
- Connection rate limiting (can be added)
- Error message sanitization
- Secure WebSocket upgrade handling
