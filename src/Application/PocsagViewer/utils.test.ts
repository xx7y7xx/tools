import {
  convertGps,
  convertGpsListToWkt,
  convertGpsListToWktPoint,
  getColorForSpeed,
  getNextSecond,
} from './utils';

describe('getColorForSpeed', () => {
  it('should return the correct color for a given speed', () => {
    const color = getColorForSpeed(10, 0, 20); // speed=10km/h, minSpeed=0km/h, maxSpeed=20km/h
    expect(color).toEqual('rgba(127, 0, 127, 0.8)');
  });
});

describe('getNextSecond', () => {
  it('should return the next second', () => {
    const nextSecond = getNextSecond('2025-04-09 23:42:48');
    expect(nextSecond).toEqual('2025-04-09 23:42:49');
  });
});

describe('convertGps', () => {
  it('should convert the gps', () => {
    const gps = convertGps({
      latitude: "39°51.2936'",
      longitude: "116°13.2274'",
    });
    expect(gps).toEqual({ latitude: 39.85489, longitude: 116.22046 });
  });
});

describe('convertGpsListToWkt', () => {
  it('should convert the gps list to WKT', () => {
    const wkt = convertGpsListToWkt([
      { latitude: 39.85489, longitude: 116.22046 },
      { latitude: 39.85489, longitude: 116.22046 },
    ]);
    expect(wkt).toEqual(
      'WKT,name,description\n"LINESTRING (116.22046 39.85489,116.22046 39.85489)",Line 1,'
    );
  });
});

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
});
