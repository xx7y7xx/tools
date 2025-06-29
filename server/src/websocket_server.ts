import WebSocket from 'ws';
import {
  WebSocketMessage,
  TrainPositionMessage,
  TrainPositionsMessage,
  RailwayLinesMessage,
  TrainPosition,
} from './types';
import { trainDataService } from './trainDataService';

export class WebSocketServer {
  private wss: WebSocket.Server;
  private port: number;
  private clients: Map<WebSocket, any> = new Map();

  constructor(port: number = 8080) {
    this.port = port;
    this.wss = new WebSocket.Server({ port: this.port });
  }

  start(): void {
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const clientId = this.generateClientId();
      const clientInfo = {
        id: clientId,
        connectedAt: new Date(),
        lastPing: new Date(),
        subscriptions: [],
      };

      this.clients.set(ws, clientInfo);

      console.log(
        `[WebSocket] Client ${clientId} connected from ${req.socket.remoteAddress}`
      );

      // Send initial data
      this.sendInitialData(ws);

      // Handle incoming messages
      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle ping/pong for connection health
      ws.on('ping', () => {
        clientInfo.lastPing = new Date();
        ws.pong();
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log(`[WebSocket] Client ${clientId} disconnected`);
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`[WebSocket] Client ${clientId} error:`, error);
        this.clients.delete(ws);
      });
    });

    // Subscribe to train data updates
    trainDataService.onTrainUpdate((train) => {
      this.broadcastTrainPosition(train);
    });

    console.log(`[WebSocket] Server started on port ${this.port}`);
  }

  // Broadcast train position to all connected clients
  broadcastTrainPosition(trainPosition: TrainPosition): void {
    const message: TrainPositionMessage = {
      type: 'train_position',
      data: trainPosition,
      timestamp: new Date().toISOString(),
    };

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private sendInitialData(ws: WebSocket): void {
    // Send current train positions
    const trainPositions = trainDataService.getAllTrainPositions();
    const trainPositionsMessage: TrainPositionsMessage = {
      type: 'train_positions',
      data: trainPositions,
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(trainPositionsMessage));

    // Send railway lines (if available)
    // This would be populated from your railway data
    const railwayLinesMessage: RailwayLinesMessage = {
      type: 'railway_lines',
      data: [],
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(railwayLinesMessage));
  }

  private handleMessage(ws: WebSocket, message: any): void {
    const clientInfo = this.clients.get(ws);
    if (!clientInfo) return;

    switch (message.type) {
      case 'ping':
        clientInfo.lastPing = new Date();
        this.sendPong(ws);
        break;

      case 'subscribe':
        if (message.channel) {
          clientInfo.subscriptions.push(message.channel);
        }
        break;

      case 'unsubscribe':
        if (message.channel) {
          const index = clientInfo.subscriptions.indexOf(message.channel);
          if (index > -1) {
            clientInfo.subscriptions.splice(index, 1);
          }
        }
        break;

      default:
        console.log(`[WebSocket] Unknown message type: ${message.type}`);
    }
  }

  private sendPong(ws: WebSocket): void {
    const message: WebSocketMessage = {
      type: 'pong',
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(message));
  }

  private sendError(ws: WebSocket, error: string): void {
    const message: WebSocketMessage = {
      type: 'error',
      data: { message: error },
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(message));
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  stop(): void {
    this.wss.close();
    console.log('[WebSocket] Server stopped');
  }

  // Get connection statistics
  getStats(): { connectedClients: number; totalClients: number } {
    let connectedClients = 0;
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        connectedClients++;
      }
    });

    return {
      connectedClients,
      totalClients: this.clients.size,
    };
  }
}
