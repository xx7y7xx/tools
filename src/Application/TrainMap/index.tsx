import React, { useState, useRef, useCallback } from 'react';
import { Alert, Spin } from 'antd';
import { TrainPosition } from './services/types';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Import components
import MapControls from './components/MapControls';
import TrainDetailCard from './components/TrainDetailCard';

// Import hooks
import { useMapInitialization } from './hooks/useMapInitialization';
import { useWebSocketConnection } from './hooks/useWebSocketConnection';
import { useTrainData } from './hooks/useTrainData';
import { useMapMarkers } from './hooks/useMapMarkers';
import { useRailwayLines } from './hooks/useRailwayLines';

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
  const [showRailwayLines, setShowRailwayLines] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<TrainPosition | null>(
    null
  );

  const mapRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { mapInstance, isMapInitialized } = useMapInitialization({
    mapRef,
    initialCenter,
    initialZoom,
  });

  const { isConnected, isLoading, handleConnect, handleDisconnect } =
    useWebSocketConnection();

  const { trains, handleRefresh } = useTrainData();

  useMapMarkers({
    mapInstance,
    isMapInitialized,
    trains,
    onTrainSelect: setSelectedTrain,
  });

  useRailwayLines({
    mapInstance,
    isMapInitialized,
    showRailwayLines,
    railwayLines,
  });

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
        trains.map((t: TrainPosition) => ({
          id: t.id,
          coords: [t.pocsagData?.gcj02_latitude, t.pocsagData?.gcj02_longitude],
          inBounds: bounds.contains([
            t.pocsagData?.gcj02_latitude || 0,
            t.pocsagData?.gcj02_longitude || 0,
          ]),
        }))
      );
    }
  }, [trains, mapInstance]);

  return (
    <div
      style={{
        padding: '20px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <MapControls
        isConnected={isConnected}
        trainsCount={trains.length}
        isLoading={isLoading}
        showRailwayLines={showRailwayLines}
        autoRefresh={autoRefresh}
        onShowRailwayLinesChange={setShowRailwayLines}
        onAutoRefreshChange={setAutoRefresh}
        onRefresh={handleRefresh}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onDebug={debugCoordinates}
      />

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
        <TrainDetailCard
          train={selectedTrain}
          onClose={() => setSelectedTrain(null)}
        />
      )}
    </div>
  );
};

export default TrainMap;
