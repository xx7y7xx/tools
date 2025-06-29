import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Card,
  Button,
  Switch,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Spin,
} from 'antd';
import {
  CarOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface TrainPosition {
  id: string;
  trainNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  mileage: number;
  timestamp: string;
  direction?: number;
}

interface RailwayLine {
  id: string;
  name: string;
  coordinates: [number, number][];
  color: string;
}

interface TrainMapProps {
  railwayLines?: RailwayLine[];
  initialCenter?: [number, number];
  initialZoom?: number;
}

const TrainMap: React.FC<TrainMapProps> = ({
  railwayLines = [],
  initialCenter = [39.9042, 116.4074], // Beijing
  initialZoom = 10,
}) => {
  const [trains, setTrains] = useState<TrainPosition[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showRailwayLines, setShowRailwayLines] = useState(true);
  const [autoFollow, setAutoFollow] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Update train position with smooth animation
  const updateTrainPosition = useCallback((trainData: TrainPosition) => {
    setTrains((prevTrains) => {
      const existingIndex = prevTrains.findIndex((t) => t.id === trainData.id);

      if (existingIndex >= 0) {
        // Update existing train
        const updatedTrains = [...prevTrains];
        updatedTrains[existingIndex] = trainData;
        return updatedTrains;
      } else {
        // Add new train
        return [...prevTrains, trainData];
      }
    });
  }, []);

  // WebSocket connection for real-time data
  const connectWebSocket = useCallback(() => {
    const wsUrl =
      process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080/trains';

    try {
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'train_position') {
            updateTrainPosition(data.train);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  }, [updateTrainPosition]);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectWebSocket]);

  // Mock data for demonstration (remove in production)
  useEffect(() => {
    const mockTrains: TrainPosition[] = [
      {
        id: 'train-1',
        trainNumber: 'G372',
        latitude: 39.9042,
        longitude: 116.4074,
        speed: 85,
        mileage: 12.3,
        timestamp: new Date().toISOString(),
        direction: 45,
      },
      {
        id: 'train-2',
        trainNumber: 'D123',
        latitude: 39.9142,
        longitude: 116.4174,
        speed: 65,
        mileage: 8.7,
        timestamp: new Date().toISOString(),
        direction: 135,
      },
    ];

    setTrains(mockTrains);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleClearTrains = () => {
    setTrains([]);
    setSelectedTrain(null);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Control Panel */}
      <Card size="small" style={{ margin: 8 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Space>
              <Tag color={isConnected ? 'green' : 'red'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Tag>
              <Text>Trains: {trains.length}</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Switch
                checked={showRailwayLines}
                onChange={setShowRailwayLines}
                checkedChildren="Railway Lines"
                unCheckedChildren="Hide Lines"
              />
              <Switch
                checked={autoFollow}
                onChange={setAutoFollow}
                checkedChildren="Auto Follow"
                unCheckedChildren="Manual"
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
              <Button icon={<CarOutlined />} onClick={handleClearTrains}>
                Clear Trains
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div
          ref={mapRef}
          style={{
            height: '100%',
            width: '100%',
            background: '#f0f2f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 16 }}>
            Train Map Loading...
          </Title>
          <Text type="secondary">
            Map component will be implemented with Leaflet
          </Text>
        </div>

        {/* Train List Overlay */}
        {trains.length > 0 && (
          <Card
            size="small"
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              width: 300,
              maxHeight: 400,
              overflow: 'auto',
            }}
            title="Active Trains"
          >
            {trains.map((train) => (
              <div
                key={train.id}
                style={{
                  padding: 8,
                  border:
                    selectedTrain === train.id
                      ? '2px solid #1890ff'
                      : '1px solid #d9d9d9',
                  borderRadius: 4,
                  marginBottom: 8,
                  cursor: 'pointer',
                  backgroundColor:
                    selectedTrain === train.id ? '#f0f8ff' : 'white',
                }}
                onClick={() => setSelectedTrain(train.id)}
              >
                <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                  <CarOutlined /> {train.trainNumber}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <ThunderboltOutlined /> {train.speed} km/h
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  <EnvironmentOutlined /> {train.mileage} km
                </div>
                <div style={{ fontSize: 10, color: '#999' }}>
                  {new Date(train.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrainMap;
