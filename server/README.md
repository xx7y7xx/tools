# Train Position WebSocket Server

A WebSocket server that provides real-time train position updates from POCSAG 1234002 data.

## Features

- **Real-time WebSocket connections** for train position updates
- **UDP Bridge** to receive POCSAG 1234002 messages from SDR-Angel
- **Mock Data Mode** for development and testing
- **Automatic reconnection** and connection health monitoring
- **Graceful shutdown** handling

## Installation

```bash
npm install
npm run build
```

## Configuration

Copy `.env.example` to `.env` and configure the following variables:

```bash
# WebSocket Server Configuration
WS_PORT=8080
NODE_ENV=development

# UDP Bridge Configuration
UDP_PORT=9999

# Mock Data Configuration (for development)
# Set to 'true' to use mock data instead of real UDP data
USE_MOCK_DATA=false
# Interval in milliseconds for mock data generation (default: 5000ms)
MOCK_DATA_INTERVAL=5000
```

## Usage

### Development with Mock Data

When developing and you don't have real POCSAG data from SDR-Angel, you can enable mock data:

```bash
# Enable mock data
USE_MOCK_DATA=true npm start

# Or with custom interval (every 3 seconds)
USE_MOCK_DATA=true MOCK_DATA_INTERVAL=3000 npm start
```

### Production with Real POCSAG Data

For production use with real SDR-Angel data:

```bash
# Use real UDP data (default)
npm start

# Or explicitly disable mock data
USE_MOCK_DATA=false npm start
```

### Switching Between Modes

You can easily switch between mock and real data by changing the environment variable:

```bash
# Switch to mock data
export USE_MOCK_DATA=true
npm start

# Switch back to real data
export USE_MOCK_DATA=false
npm start
```

## Data Flow

### Real Data Mode

```
SDR-Angel → UDP Bridge (port 9999) → WebSocket Server (port 8080) → Frontend
```

### Mock Data Mode

```
Mock Data Service → WebSocket Server (port 8080) → Frontend
```

## API

### WebSocket Messages

The server sends the following message types:

- `train_position`: Individual train position update
- `train_positions`: All current train positions
- `railway_lines`: Railway line data (if available)
- `pong`: Response to ping messages

### Train Position Data Structure

```typescript
interface TrainPosition {
  id: string;
  trainNumber: string;
  timestamp: string;
  pocsagData?: {
    wgs84_latitude?: number;
    wgs84_longitude?: number;
    gcj02_latitude?: number;
    gcj02_longitude?: number;
    rawMessage?: string;
  };
}
```

## Development

### Building

```bash
npm run build
```

### Running in Development

```bash
# With mock data (recommended for development)
USE_MOCK_DATA=true npm start

# With real UDP data
npm start
```

### Testing

The mock data service generates realistic POCSAG 1234002 data around Beijing coordinates, making it perfect for testing the frontend without needing real SDR equipment.

## Troubleshooting

### No Data Received

- Check if `USE_MOCK_DATA` is set correctly
- Verify UDP port configuration
- Ensure SDR-Angel is sending data to the correct port

### Mock Data Not Working

- Verify `USE_MOCK_DATA=true` is set
- Check console logs for mock data generation messages
- Adjust `MOCK_DATA_INTERVAL` if needed

### WebSocket Connection Issues

- Verify WebSocket port is not blocked
- Check firewall settings
- Ensure frontend is connecting to the correct WebSocket URL
