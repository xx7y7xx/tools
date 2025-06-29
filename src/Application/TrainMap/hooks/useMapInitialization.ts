import { useEffect, useRef } from 'react';

interface UseMapInitializationProps {
  mapRef: React.RefObject<HTMLDivElement>;
  initialCenter: [number, number];
  initialZoom: number;
}

export const useMapInitialization = ({
  mapRef,
  initialCenter,
  initialZoom,
}: UseMapInitializationProps) => {
  const mapInstance = useRef<any>(null);
  const isMapInitialized = useRef(false);
  const initialCenterRef = useRef(initialCenter);
  const initialZoomRef = useRef(initialZoom);

  useEffect(() => {
    if (!mapRef.current || isMapInitialized.current) return;

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
            tileSize: 512,
            zoomOffset: -1,
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
            tileSize: 512,
            zoomOffset: -1,
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
  }, [mapRef]); // Added mapRef to dependency array

  return {
    mapInstance,
    isMapInitialized,
  };
};
