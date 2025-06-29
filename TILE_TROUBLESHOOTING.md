# Tile Positioning Troubleshooting Guide

## Common Issues and Solutions

### 1. Tiles Appear in Wrong Position

**Symptoms:**

- Map tiles are visible but positioned incorrectly
- Geographic features don't align with coordinates
- Train markers appear in wrong locations

**Possible Causes:**

- Coordinate system mismatch (WGS84 vs Web Mercator)
- Tile layer configuration issues
- Browser caching of old tile data

**Solutions:**

#### A. Clear Browser Cache

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then refresh the page
```

#### B. Verify Coordinate System

Ensure coordinates are in WGS84 format (latitude, longitude):

```javascript
// Correct format for Beijing
const beijingCoords = [39.9042, 116.4074]; // [lat, lng]

// NOT
const wrongCoords = [116.4074, 39.9042]; // [lng, lat]
```

#### C. Check Tile Layer Configuration

```javascript
// Proper OpenStreetMap configuration
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
  minZoom: 1,
  subdomains: 'abc',
  tileSize: 256,
  zoomOffset: 0,
  detectRetina: true,
}).addTo(map);
```

### 2. Tiles Not Loading

**Symptoms:**

- Blank map with no tiles
- Console errors about tile loading
- Network errors in browser dev tools

**Solutions:**

#### A. Check Network Connectivity

- Verify internet connection
- Check if tile servers are accessible
- Try alternative tile sources

#### B. Use Fallback Tile Source

```javascript
// Primary source
const osmTiles = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '© OpenStreetMap contributors',
  }
);

// Fallback source
const cartoTiles = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '© CARTO',
  }
);

// Handle errors
osmTiles.on('tileerror', () => {
  map.removeLayer(osmTiles);
  cartoTiles.addTo(map);
});
```

#### C. Alternative Tile Sources

```javascript
// CARTO Light
'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

// CARTO Dark
'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// Stamen Terrain
'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png';

// Esri World Imagery
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
```

### 3. Map Container Issues

**Symptoms:**

- "Map container is being reused" errors
- "Map container not found" errors
- Map doesn't render properly

**Solutions:**

#### A. Proper Container Management

```javascript
// Ensure container is empty before initialization
if (mapRef.current) {
  mapRef.current.innerHTML = '';
}

// Initialize map only once
if (!mapInstance.current && !isMapInitialized.current) {
  mapInstance.current = L.map(mapRef.current).setView(center, zoom);
}
```

#### B. Cleanup on Unmount

```javascript
useEffect(() => {
  // Initialize map

  return () => {
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }
  };
}, []);
```

### 4. Coordinate Validation

**Debug Function:**

```javascript
const debugCoordinates = () => {
  if (mapInstance.current) {
    const center = mapInstance.current.getCenter();
    const zoom = mapInstance.current.getZoom();
    const bounds = mapInstance.current.getBounds();

    console.log('Map State:');
    console.log('Center:', center);
    console.log('Zoom:', zoom);
    console.log('Bounds:', bounds);

    // Test known coordinates
    const beijing = [39.9042, 116.4074];
    const shanghai = [31.2304, 121.4737];

    console.log('Beijing in bounds:', bounds.contains(beijing));
    console.log('Shanghai in bounds:', bounds.contains(shanghai));
  }
};
```

### 5. Testing Steps

1. **Open the test page:** `http://localhost:3000/test-map.html`
2. **Check console for errors**
3. **Use the Debug button** in the TrainMap component
4. **Verify coordinates** with known locations
5. **Test different zoom levels**
6. **Try alternative tile sources**

### 6. Browser-Specific Issues

#### Chrome/Edge

- Check for aggressive caching
- Disable hardware acceleration if needed
- Clear site data

#### Firefox

- Check network settings
- Disable tracking protection for localhost
- Clear cache and cookies

#### Safari

- Disable cross-site tracking
- Clear website data
- Check developer settings

### 7. Development Environment

#### Local Development

```bash
# Start the development server
npm start

# Check for any build errors
npm run build

# Test the application
npm test
```

#### Production Build

```bash
# Build for production
npm run build

# Serve the build locally
npx serve -s build
```

### 8. Common Debugging Commands

```javascript
// In browser console
// Check map instance
console.log(window.mapInstance);

// Check tile layer
console.log(mapInstance.current._tileLayers);

// Force tile reload
mapInstance.current.invalidateSize();

// Check container dimensions
console.log(mapRef.current.offsetWidth, mapRef.current.offsetHeight);

// Test coordinate conversion
const latLng = mapInstance.current.containerPointToLatLng([100, 100]);
console.log('Container point to latlng:', latLng);
```

### 9. Performance Optimization

#### Tile Loading

```javascript
// Optimize tile loading
const tileLayer = L.tileLayer(url, {
  updateWhenIdle: true,
  updateWhenZooming: false,
  keepBuffer: 2,
});
```

#### Memory Management

```javascript
// Clear unused tiles
mapInstance.current._tileLayers.forEach((layer) => {
  if (layer._tiles) {
    Object.keys(layer._tiles).forEach((key) => {
      if (!layer._tiles[key].active) {
        delete layer._tiles[key];
      }
    });
  }
});
```

## Quick Fix Checklist

- [ ] Clear browser cache and cookies
- [ ] Verify coordinate format (lat, lng)
- [ ] Check network connectivity
- [ ] Try alternative tile source
- [ ] Restart development server
- [ ] Check console for errors
- [ ] Verify map container dimensions
- [ ] Test with known coordinates
- [ ] Check browser compatibility
- [ ] Verify Leaflet CSS is loaded

## Support

If issues persist:

1. Check the browser console for specific error messages
2. Use the debug functions provided
3. Test with the standalone test page
4. Verify all dependencies are properly installed
5. Check for any network restrictions or firewall issues
