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
  Alert,
} from 'antd';
import { CarOutlined, ReloadOutlined, WifiOutlined } from '@ant-design/icons';
import { trainDataService } from './services/trainDataService';
import { TrainPosition } from './services/types';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const { Title, Text } = Typography;

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
  const [isLoading, setIsLoading] = useState(true);
  const [showRailwayLines, setShowRailwayLines] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<TrainPosition | null>(
    null
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const isMapInitialized = useRef(false);
  const initialCenterRef = useRef(initialCenter);
  const initialZoomRef = useRef(initialZoom);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectToServer = async () => {
      try {
        setIsLoading(true);
        await trainDataService.connect();
        trainDataService.startAutoPing();
      } catch (error) {
        console.error('Failed to connect to WebSocket server:', error);
      } finally {
        setIsLoading(false);
      }
    };

    connectToServer();

    // Cleanup on unmount
    return () => {
      trainDataService.disconnect();
    };
  }, []);

  // Listen for connection status changes
  useEffect(() => {
    const unsubscribe = trainDataService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    return unsubscribe;
  }, []);

  // Listen for train updates
  useEffect(() => {
    const unsubscribe = trainDataService.onTrainUpdate((train) => {
      setTrains((prevTrains) => {
        const existingIndex = prevTrains.findIndex((t) => t.id === train.id);
        if (existingIndex >= 0) {
          const updatedTrains = [...prevTrains];
          updatedTrains[existingIndex] = train;
          return updatedTrains;
        } else {
          return [...prevTrains, train];
        }
      });
    });

    return unsubscribe;
  }, []);

  // Listen for all trains updates
  useEffect(() => {
    const unsubscribe = trainDataService.onAllTrainsUpdate((trains) => {
      setTrains(trains);
    });

    return unsubscribe;
  }, []);

  // Initialize map - only once
  useEffect(() => {
    if (!mapRef.current || isMapInitialized.current) return;

    // Capture refs at the beginning of the effect
    const currentMarkers = markersRef.current;

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        // Ensure the container exists and is empty
        if (!mapRef.current) return;

        // Clear any existing content
        mapRef.current.innerHTML = '';

        console.log(
          'Initializing map with center:',
          initialCenterRef.current,
          'zoom:',
          initialZoomRef.current
        );

        // Create map instance using ref values
        mapInstance.current = L.map(mapRef.current).setView(
          initialCenterRef.current,
          initialZoomRef.current
        );

        // Add OpenStreetMap tiles with proper configuration
        const tileLayer = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 1,
            subdomains: 'abc',
            tileSize: 256,
            zoomOffset: 0,
            detectRetina: true,
          }
        ).addTo(mapInstance.current);

        // Add fallback tile source in case OpenStreetMap fails
        const fallbackTileLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          {
            attribution: '© CARTO',
            maxZoom: 19,
            minZoom: 1,
            subdomains: 'abcd',
            tileSize: 256,
            zoomOffset: 0,
            detectRetina: true,
          }
        );

        // Handle tile loading errors
        tileLayer.on('tileerror', (e: any) => {
          console.warn('OpenStreetMap tile error, switching to fallback:', e);
          mapInstance.current.removeLayer(tileLayer);
          fallbackTileLayer.addTo(mapInstance.current);
        });

        // Add a scale control
        L.control.scale().addTo(mapInstance.current);

        // Add zoom control
        L.control
          .zoom({
            position: 'topright',
          })
          .addTo(mapInstance.current);

        // Add event listeners for debugging
        mapInstance.current.on('load', () => {
          console.log('Map tiles loaded successfully');
        });

        mapInstance.current.on('tileloadstart', (e: any) => {
          console.log('Tile loading started:', e.coords);
        });

        mapInstance.current.on('tileload', (e: any) => {
          console.log('Tile loaded:', e.coords);
        });

        mapInstance.current.on('tileerror', (e: any) => {
          console.error('Tile loading error:', e.coords, e);
        });

        isMapInitialized.current = true;
        console.log('Map initialized successfully');
        console.log('Initial center:', initialCenterRef.current);
        console.log('Initial zoom:', initialZoomRef.current);
        console.log('Map bounds:', mapInstance.current.getBounds());
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstance.current && isMapInitialized.current) {
        try {
          // Clear all markers first
          currentMarkers.forEach((marker) => {
            if (mapInstance.current && marker) {
              mapInstance.current.removeLayer(marker);
            }
          });
          currentMarkers.clear();

          // Remove the map
          mapInstance.current.remove();
          mapInstance.current = null;
          isMapInitialized.current = false;
          console.log('Map cleaned up successfully');
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, []); // Empty dependency array - only run once

  // Add railway lines separately to avoid re-initializing map
  useEffect(() => {
    if (!mapInstance.current || !isMapInitialized.current) return;

    const addRailwayLines = async () => {
      try {
        const L = await import('leaflet');

        // Clear existing railway lines (if any)
        if (mapInstance.current._railwayLines) {
          mapInstance.current._railwayLines.forEach((line: any) => {
            mapInstance.current.removeLayer(line);
          });
        }
        mapInstance.current._railwayLines = [];

        // Add railway lines if available
        if (showRailwayLines && railwayLines.length > 0) {
          railwayLines.forEach((line: RailwayLine) => {
            const polyline = L.polyline(line.coordinates, {
              color: line.color,
              weight: 3,
              opacity: 0.7,
            }).addTo(mapInstance.current);
            mapInstance.current._railwayLines.push(polyline);
          });
        }
      } catch (error) {
        console.error('Error adding railway lines:', error);
      }
    };

    addRailwayLines();
  }, [showRailwayLines, railwayLines]);

  // Update train markers
  useEffect(() => {
    if (!mapInstance.current || !isMapInitialized.current) return;

    const updateMarkers = async () => {
      try {
        const L = await import('leaflet');

        // Clear existing markers
        markersRef.current.forEach((marker) => {
          if (mapInstance.current && marker) {
            try {
              mapInstance.current.removeLayer(marker);
            } catch (error) {
              console.warn('Error removing marker:', error);
            }
          }
        });
        markersRef.current.clear();

        // Add new markers
        trains.forEach((train) => {
          if (!mapInstance.current) return;

          try {
            const marker = L.marker([train.latitude, train.longitude], {
              icon: L.divIcon({
                className: 'train-marker',
                html: `
                  <div style="
                    background: ${
                      train.status === 'active' ? '#52c41a' : '#faad14'
                    };
                    border: 2px solid white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  ">
                    🚂
                  </div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              }),
            });

            // Add popup with train info
            const popupContent = `
              <div style="min-width: 200px;">
                <h4>🚂 ${train.trainNumber}</h4>
                <p><strong>Speed:</strong> ${train.speed} km/h</p>
                <p><strong>Mileage:</strong> ${train.mileage} km</p>
                <p><strong>Status:</strong> ${train.status}</p>
                <p><strong>Last Update:</strong> ${new Date(
                  train.timestamp
                ).toLocaleTimeString()}</p>
              </div>
            `;
            marker.bindPopup(popupContent);

            // Add click handler
            marker.on('click', () => {
              setSelectedTrain(train);
            });

            // Add to map
            marker.addTo(mapInstance.current);
            markersRef.current.set(train.id, marker);
          } catch (error) {
            console.error(
              'Error adding marker for train',
              train.id,
              ':',
              error
            );
          }
        });
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    };

    updateMarkers();
  }, [trains]);

  const handleRefresh = useCallback(() => {
    trainDataService.requestAllTrains();
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      setIsLoading(true);
      await trainDataService.connect();
    } catch (error) {
      console.error('Failed to reconnect:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    trainDataService.disconnect();
  }, []);

  // Debug function to check coordinates
  const debugCoordinates = useCallback(() => {
    if (mapInstance.current) {
      const center = mapInstance.current.getCenter();
      const zoom = mapInstance.current.getZoom();
      const bounds = mapInstance.current.getBounds();
      console.log('Current map state:');
      console.log('Center:', center);
      console.log('Zoom:', zoom);
      console.log('Bounds:', bounds);
      console.log(
        'Trains:',
        trains.map((t) => ({
          id: t.id,
          coords: [t.latitude, t.longitude],
          inBounds: bounds.contains([t.latitude, t.longitude]),
        }))
      );
    }
  }, [trains]);

  return (
    <div
      style={{
        padding: '20px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Card>
        <Row gutter={16} align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <CarOutlined /> Train Map
            </Title>
          </Col>
          <Col>
            <Space>
              <Tag
                color={isConnected ? 'green' : 'red'}
                icon={<WifiOutlined />}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </Tag>
              <Text type="secondary">{trains.length} trains active</Text>
            </Space>
          </Col>
          <Col flex="auto" />
          <Col>
            <Space>
              <Switch
                checked={showRailwayLines}
                onChange={setShowRailwayLines}
                checkedChildren="Railway Lines"
                unCheckedChildren="Hide Lines"
              />
              <Switch
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="Auto Refresh"
                unCheckedChildren="Manual"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              >
                Refresh
              </Button>
              <Button onClick={debugCoordinates} size="small">
                Debug
              </Button>
              {isConnected ? (
                <Button onClick={handleDisconnect} danger>
                  Disconnect
                </Button>
              ) : (
                <Button onClick={handleConnect} type="primary">
                  Connect
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {!isConnected && (
        <Alert
          message="WebSocket Connection Required"
          description="Please start the WebSocket server and click Connect to view real-time train data."
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <div style={{ flex: 1, position: 'relative' }}>
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <Spin size="large" />
          </div>
        )}

        <div
          ref={mapRef}
          style={{
            height: '100%',
            width: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        />
      </div>

      {selectedTrain && (
        <Card
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '300px',
            zIndex: 1000,
          }}
          title={`Train ${selectedTrain.trainNumber}`}
          extra={
            <Button size="small" onClick={() => setSelectedTrain(null)}>
              ×
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row>
              <Col span={12}>
                <Text type="secondary">Speed</Text>
                <br />
                <Text strong>{selectedTrain.speed} km/h</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Mileage</Text>
                <br />
                <Text strong>{selectedTrain.mileage} km</Text>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Text type="secondary">Status</Text>
                <br />
                <Tag
                  color={selectedTrain.status === 'active' ? 'green' : 'orange'}
                >
                  {selectedTrain.status}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">Direction</Text>
                <br />
                <Text strong>{selectedTrain.direction?.toFixed(1)}°</Text>
              </Col>
            </Row>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Last update: {new Date(selectedTrain.timestamp).toLocaleString()}
            </Text>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default TrainMap;
