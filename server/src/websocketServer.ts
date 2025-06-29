import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';
import { trainDataService } from './trainDataService';
import { TrainPosition, WebSocketMessage, ClientInfo } from './types';

export class TrainWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, ClientInfo> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private mockDataInterval: NodeJS.Timeout | null = null;

  constructor(port: number = 8080) {
    const server = createServer();
    this.wss = new WebSocketServer({ server });

    this.setupWebSocket();
    this.startPingInterval();
    this.startMockDataSimulation();

    server.listen(port, () => {
      console.log(`🚂 Train WebSocket server running on port ${port}`);
      console.log(`📡 WebSocket URL: ws://localhost:${port}/trains`);
    });
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const { pathname } = parse(req.url || '');

      if (pathname === '/trains') {
        this.handleTrainConnection(ws);
      } else {
        ws.close(1008, 'Invalid endpoint');
      }
    });
  }

  private handleTrainConnection(ws: WebSocket) {
    const clientId = this.generateClientId();
    const clientInfo: ClientInfo = {
      id: clientId,
      connectedAt: new Date(),
      lastPing: new Date(),
      subscriptions: [],
    };

    this.clients.set(ws, clientInfo);
    console.log(
      `🔌 Client ${clientId} connected. Total clients: ${this.clients.size}`
    );

    // Send current train positions
    const positions = trainDataService.getAllTrainPositions();
    this.sendMessage(ws, {
      type: 'train_positions',
      data: positions,
      timestamp: new Date().toISOString(),
    });

    // Send welcome message
    this.sendMessage(ws, {
      type: 'pong',
      data: { message: 'Connected to Train WebSocket Server', clientId },
      timestamp: new Date().toISOString(),
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleMessage(data, ws);
      } catch (error) {
        console.error('❌ Error parsing message:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', (code, reason) => {
      console.log(
        `🔌 Client ${clientId} disconnected. Code: ${code}, Reason: ${reason}`
      );
      this.clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for client ${clientId}:`, error);
      this.clients.delete(ws);
    });

    ws.on('pong', () => {
      const client = this.clients.get(ws);
      if (client) {
        client.lastPing = new Date();
      }
    });
  }

  private handleMessage(data: any, ws: WebSocket) {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (data.type) {
      case 'ping':
        this.sendMessage(ws, {
          type: 'pong',
          data: { timestamp: Date.now() },
          timestamp: new Date().toISOString(),
        });
        break;

      case 'subscribe_train':
        if (data.trainId) {
          client.subscriptions.push(data.trainId);
          console.log(
            `📡 Client ${client.id} subscribed to train ${data.trainId}`
          );
        }
        break;

      case 'unsubscribe_train':
        if (data.trainId) {
          const index = client.subscriptions.indexOf(data.trainId);
          if (index > -1) {
            client.subscriptions.splice(index, 1);
            console.log(
              `📡 Client ${client.id} unsubscribed from train ${data.trainId}`
            );
          }
        }
        break;

      case 'get_all_trains':
        const positions = trainDataService.getAllTrainPositions();
        this.sendMessage(ws, {
          type: 'train_positions',
          data: positions,
          timestamp: new Date().toISOString(),
        });
        break;

      default:
        console.log(
          `❓ Unknown message type: ${data.type} from client ${client.id}`
        );
    }
  }

  private sendMessage(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.sendMessage(ws, {
      type: 'error',
      data: { error },
      timestamp: new Date().toISOString(),
    });
  }

  private broadcastTrainPosition(train: TrainPosition) {
    const message: WebSocketMessage = {
      type: 'train_position',
      data: train,
      timestamp: new Date().toISOString(),
    };

    this.clients.forEach((clientInfo, ws) => {
      // Send to all clients or only subscribed clients
      if (
        clientInfo.subscriptions.length === 0 ||
        clientInfo.subscriptions.includes(train.id)
      ) {
        this.sendMessage(ws, message);
      }
    });
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      this.clients.forEach((clientInfo, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, 30000); // Ping every 30 seconds
  }

  private startMockDataSimulation() {
    // Initialize with some mock data
    const mockTrains = trainDataService.generateMockTrainData();
    mockTrains.forEach((train) => {
      trainDataService.updateTrainPosition(train);
    });

    // Subscribe to train updates
    trainDataService.onTrainUpdate((train) => {
      this.broadcastTrainPosition(train);
    });

    // Simulate real-time train data updates
    this.mockDataInterval = setInterval(() => {
      const mockTrains = trainDataService.generateMockTrainData();
      mockTrains.forEach((train) => {
        trainDataService.updateTrainPosition(train);
      });
    }, 3000); // Update every 3 seconds
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public method to broadcast train position from external sources
  public broadcastTrainUpdate(train: TrainPosition) {
    trainDataService.updateTrainPosition(train);
  }

  // Public method to process POCSAG data
  public processPocsagData(pocsagData: any) {
    const trainPosition =
      trainDataService.convertPocsagToTrainPosition(pocsagData);
    if (trainPosition) {
      this.broadcastTrainUpdate(trainPosition);
    }
  }

  // Get server statistics
  public getStats() {
    return {
      connectedClients: this.clients.size,
      activeTrains: trainDataService.getTrainCount(),
      uptime: process.uptime(),
    };
  }

  // Cleanup
  public shutdown() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
    }

    this.clients.forEach((clientInfo, ws) => {
      ws.close(1000, 'Server shutdown');
    });

    this.wss.close();
    console.log('🛑 Train WebSocket server shutdown');
  }
}
