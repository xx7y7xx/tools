import { useEffect, useRef } from 'react';
import { TrainPosition } from '../services/types';

interface UseMapMarkersProps {
  mapInstance: React.MutableRefObject<any>;
  isMapInitialized: React.MutableRefObject<boolean>;
  trains: TrainPosition[];
  onTrainSelect: (train: TrainPosition) => void;
}

export const useMapMarkers = ({
  mapInstance,
  isMapInitialized,
  trains,
  onTrainSelect,
}: UseMapMarkersProps) => {
  const markersRef = useRef<Map<string, any>>(new Map());

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
            // Use coordinates from pocsagData
            const latitude = train.pocsagData?.gcj02_latitude;
            const longitude = train.pocsagData?.gcj02_longitude;

            if (!latitude || !longitude) {
              console.warn('Train missing coordinates:', train.id);
              return;
            }

            const marker = L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: 'train-marker',
                html: '🚂',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              }),
            });

            // Add popup with train info
            const popupContent = `
              <div style="min-width: 200px;">
                <h4>🚂 ${train.trainNumber}</h4>
                <p><strong>Status:</strong> ${train.status}</p>
                <p><strong>Last Update:</strong> ${new Date(
                  train.timestamp
                ).toLocaleTimeString()}</p>
              </div>
            `;
            marker.bindPopup(popupContent);

            // Add click handler
            marker.on('click', () => {
              onTrainSelect(train);
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
  }, [trains, mapInstance, isMapInitialized, onTrainSelect]);

  return {
    markersRef,
  };
};
