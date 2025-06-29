import { TrainPosition, WebSocketMessage } from './types';

export class TrainDataService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private updateCallbacks: ((train: TrainPosition) => void)[] = [];
  private allTrainsCallbacks: ((trains: TrainPosition[]) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];
  private isConnected = false;

  constructor(private serverUrl: string = 'ws://localhost:8080/trains') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = () => {
          console.log('🔌 Connected to Train WebSocket Server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.notifyConnectionStatus(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log(
            '🔌 WebSocket connection closed:',
            event.code,
            event.reason
          );
          this.isConnected = false;
          this.notifyConnectionStatus(false);

          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        console.error('❌ Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'train_position':
        if (message.data) {
          this.notifyTrainUpdate(message.data);
        }
        break;

      case 'train_positions':
        if (message.data) {
          this.notifyAllTrainsUpdate(message.data);
        }
        break;

      case 'pong':
        console.log('📡 Server ping response received');
        break;

      case 'error':
        console.error('❌ Server error:', message.data);
        break;

      default:
        console.log('❓ Unknown message type:', message.type);
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch((error) => {
          console.error('❌ Reconnection failed:', error);
        });
      }
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.notifyConnectionStatus(false);
  }

  // Subscribe to specific train updates
  subscribeToTrain(trainId: string) {
    if (this.ws && this.isConnected) {
      this.ws.send(
        JSON.stringify({
          type: 'subscribe_train',
          trainId,
        })
      );
    }
  }

  // Unsubscribe from specific train updates
  unsubscribeFromTrain(trainId: string) {
    if (this.ws && this.isConnected) {
      this.ws.send(
        JSON.stringify({
          type: 'unsubscribe_train',
          trainId,
        })
      );
    }
  }

  // Request all train positions
  requestAllTrains() {
    if (this.ws && this.isConnected) {
      this.ws.send(
        JSON.stringify({
          type: 'get_all_trains',
        })
      );
    }
  }

  // Send ping to keep connection alive
  ping() {
    if (this.ws && this.isConnected) {
      this.ws.send(
        JSON.stringify({
          type: 'ping',
          timestamp: Date.now(),
        })
      );
    }
  }

  // Event listeners
  onTrainUpdate(callback: (train: TrainPosition) => void): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  onAllTrainsUpdate(callback: (trains: TrainPosition[]) => void): () => void {
    this.allTrainsCallbacks.push(callback);
    return () => {
      const index = this.allTrainsCallbacks.indexOf(callback);
      if (index > -1) {
        this.allTrainsCallbacks.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  private notifyTrainUpdate(train: TrainPosition) {
    this.updateCallbacks.forEach((callback) => callback(train));
  }

  private notifyAllTrainsUpdate(trains: TrainPosition[]) {
    this.allTrainsCallbacks.forEach((callback) => callback(trains));
  }

  private notifyConnectionStatus(connected: boolean) {
    this.connectionCallbacks.forEach((callback) => callback(connected));
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Start automatic ping
  startAutoPing(interval: number = 30000) {
    setInterval(() => {
      this.ping();
    }, interval);
  }
}

// Export singleton instance
export const trainDataService = new TrainDataService();
