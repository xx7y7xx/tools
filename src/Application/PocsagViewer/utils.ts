import { TrainSignalRecord } from './types';

/**
 * Function to get color based on speed
 * The highest speed is red, the lowest speed is blue
 * @param speed
 * @returns color, e.g. rgba(255, 0, 0, 0.8)
 */
export const getColorForSpeed = (
  speed: number,
  minSpeed: number,
  maxSpeed: number
) => {
  const ratio = (speed - minSpeed) / (maxSpeed - minSpeed);
  const r = Math.floor(255 * ratio);
  const b = Math.floor(255 * (1 - ratio));
  return `rgba(${r}, 0, ${b}, 0.8)`;
};

export const getMinMaxSpeed = (trainSignalRecords: TrainSignalRecord[]) => {
  const speeds = trainSignalRecords.map((record) => record.payload.speed);
  return {
    minSpeed: Math.min(...speeds),
    maxSpeed: Math.max(...speeds),
  };
};

/**
 * Get next second from timestamp, need to keep the same timezone
 * @param timestamp e.g. "2025-04-09 23:42:48"
 * @returns string, e.g. "2025-04-09 23:42:49"
 */
export const getNextSecond = (timestamp: string) => {
  const date = new Date(timestamp.replace(' ', 'T')); // Convert to ISO format for parsing
  date.setSeconds(date.getSeconds() + 1);

  // Format using local timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// convert {latitude: "39°51.2936'", longitude: "116°13.2274'"} to {latitude: 39.85489, longitude: 116.22072}
export const convertGps = (gps: { latitude: string; longitude: string }) => {
  const convertCoordinate = (coord: string) => {
    const match = coord.match(/(\d+)°(\d+\.\d+)'/);
    if (!match) return 0;
    const degrees = parseFloat(match[1]);
    const minutes = parseFloat(match[2]);
    return Number((degrees + minutes / 60).toFixed(5));
  };

  return {
    latitude: convertCoordinate(gps.latitude),
    longitude: convertCoordinate(gps.longitude),
  };
};

/**
 * Convert the gps list to WKT format (with header)
 * Output:
 * ```csv
 * WKT,name,description
 * "LINESTRING (116.3785477 39.9068214, 116.3493653 39.8591369, 116.4108201 39.8493851, 116.4506455 39.8688872, 116.455452 39.8973398)",Line 1,
 * ```
 */
export const convertGpsListToWkt = (
  gpsList: { latitude: number; longitude: number }[]
) => {
  const wkt = `LINESTRING (${gpsList
    .map((gps) => `${gps.longitude} ${gps.latitude}`)
    .join(',')})`;
  return `WKT,name,description\n"${wkt}",Line 1,`;
};

/*
describe('convertGpsListToWktPoint', () => {
  it('should convert the gps list to WKT point', () => {
    const wkt = convertGpsListToWktPoint([
      { latitude: 39.8869744, longitude: 116.2386613 },
      { latitude: 39.8749211, longitude: 116.25454 },
    ]);
    expect(wkt).toEqual(
      'WKT,name,description\n"POINT (116.2386613 39.8869744)",Point 1,\n"POINT (116.25454 39.8749211)",Point 2,'
    );
  });
});*/

/**
 * Convert the gps list to WKT format (with header)
 * Output:
 * ```csv
 * WKT,name,description
 * "POINT (116.2386613 39.8869744)",Point 1,
 * "POINT (116.25454 39.8749211)",Point 2,
 * ```
 */
export const convertGpsListToWktPoint = (
  gpsList: { latitude: number; longitude: number }[]
) => {
  const header = 'WKT,name,description';
  const wktList = gpsList
    .map(
      (gps, idx) =>
        `"POINT (${gps.longitude} ${gps.latitude})",Point ${idx + 1},`
    )
    .join('\n');
  return `${header}\n${wktList}`;
};

export const downloadFile = (content: string, filename: string) => {
  const a = document.createElement('a');
  a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
  a.download = filename;
  a.click();
};
