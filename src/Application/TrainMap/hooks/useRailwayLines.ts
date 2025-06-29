import { useEffect } from 'react';

interface RailwayLine {
  id: string;
  name: string;
  coordinates: [number, number][];
  color: string;
}

interface UseRailwayLinesProps {
  mapInstance: React.MutableRefObject<any>;
  isMapInitialized: React.MutableRefObject<boolean>;
  showRailwayLines: boolean;
  railwayLines: RailwayLine[];
}

export const useRailwayLines = ({
  mapInstance,
  isMapInitialized,
  showRailwayLines,
  railwayLines,
}: UseRailwayLinesProps) => {
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
  }, [showRailwayLines, railwayLines, mapInstance, isMapInitialized]);
};
