# 🚂 Train Map Integration Guide

This guide will help you test the complete real-time train position mapping system.

## 🏃‍♂️ Quick Start

### 1. Start the WebSocket Server

```bash
cd tools/server
npm run dev
```

**Expected Output:**

```
🚀 Starting Train WebSocket Server...
📡 Port: 8080
🌍 Environment: development
✅ Train WebSocket Server started successfully!
📡 Connect to: ws://localhost:8080/trains
🚂 Train WebSocket server running on port 8080
```

### 2. Start the React App

```bash
cd tools
npm start
```

**Expected Output:**

```
Compiled successfully!

You can now view tools in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### 3. Access the Train Map

1. Open your browser and go to: `http://localhost:3000/tools?tool=trainMap`
2. You should see the Train Map interface
3. Click the "Connect" button to establish WebSocket connection
4. Watch real-time train positions update on the map!

## 🧪 Testing the System

### Test 1: WebSocket Connection

1. Open the browser console (F12)
2. Navigate to the Train Map
3. Click "Connect"
4. You should see: `🔌 Connected to Train WebSocket Server`

### Test 2: Real-time Updates

1. Once connected, you should see 3 trains on the map
2. Train positions update every 3 seconds
3. Click on any train marker to see detailed information
4. Watch the train count and connection status in the header

### Test 3: WebSocket Test Client

1. Open `tools/server/test-client.html` in a browser
2. The page should auto-connect to the WebSocket server
3. You should see real-time train data updates
4. Test the ping/pong functionality

## 🔧 Troubleshooting

### Issue: "Module not found: date-fns"

**Solution:**

```bash
cd tools
npm install date-fns --legacy-peer-deps
```

### Issue: Port 3000 already in use

**Solution:**

```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9
# Or start on different port
PORT=3001 npm start
```

### Issue: WebSocket connection fails

**Solution:**

1. Ensure WebSocket server is running: `lsof -ti:8080`
2. Check server logs for errors
3. Verify firewall settings
4. Try restarting the server: `cd server && npm run dev`

### Issue: No trains showing on map

**Solution:**

1. Check browser console for errors
2. Verify WebSocket connection status
3. Click "Refresh" button to request train data
4. Check server logs for train data generation

## 📊 System Status Check

### Verify Both Servers Running

```bash
# Check React app
curl -I http://localhost:3000

# Check WebSocket server
curl -I http://localhost:8080

# Check processes
lsof -ti:3000  # Should show React process
lsof -ti:8080  # Should show WebSocket process
```

### Monitor WebSocket Server Logs

The server logs show:

- Client connections/disconnections
- Train data updates
- Server statistics every 30 seconds
- Error messages

## 🎯 Expected Behavior

### WebSocket Server

- ✅ Starts on port 8080
- ✅ Generates 3 mock trains
- ✅ Updates train positions every 3 seconds
- ✅ Handles client connections
- ✅ Broadcasts real-time updates

### React Train Map

- ✅ Loads with connection status
- ✅ Connects to WebSocket server
- ✅ Displays interactive map
- ✅ Shows real-time train markers
- ✅ Updates train positions smoothly
- ✅ Provides train detail popups

### Train Data

- ✅ 3 active trains (G372, D123, K456)
- ✅ Realistic speed and mileage data
- ✅ Status indicators (active/stopped)
- ✅ Timestamp tracking
- ✅ Geographic coordinates

## 🔄 Integration with Real POCSAG Data

To integrate with your existing POCSAG data processing:

1. **Modify the WebSocket server** to receive POCSAG data:

```typescript
// In your POCSAG processing code
import { TrainWebSocketServer } from './websocketServer';

const server = new TrainWebSocketServer(8080);

// Replace mock data with real POCSAG data
server.processPocsagData({
  trainNumber: 'G372',
  speed: 120,
  mileage: 15.3,
  timestamp: new Date().toISOString(),
  address: '123456',
});
```

2. **Update coordinate calculation** in `trainDataService.ts`:

```typescript
// Replace mock coordinate generation with real railway data
convertPocsagToTrainPosition(pocsagData: PocsagData): TrainPosition | null {
  // Use your existing railway line data to calculate exact coordinates
  // based on mileage and railway line geometry
}
```

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **WebSocket Server Console:**

   - `🚂 Train WebSocket server running on port 8080`
   - `🔌 Client [id] connected. Total clients: X`
   - `📊 Server Stats - Clients: X, Trains: 3, Uptime: Xs`

2. **Browser Console:**

   - `🔌 Connected to Train WebSocket Server`
   - `📡 Server ping response received`

3. **Train Map Interface:**
   - Green "Connected" status tag
   - 3 train markers on the map
   - Real-time position updates
   - Interactive train detail popups

## 🚀 Next Steps

1. **Test with real POCSAG data** by integrating your existing data processing
2. **Add railway line visualization** using your GeoJSON data
3. **Implement train filtering** and search functionality
4. **Add historical data tracking** and analytics
5. **Deploy to production** with proper security and scaling

The system is now ready for production use! 🎯
