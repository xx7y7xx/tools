import Papa from 'papaparse';

import { RawPocsagRow, TrainSignalRecord } from './types';

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
 * TODO move to sdr_pocsag
 *
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

/**
 * Convert the gps list to Kepler.gl CSV format
 * Output:
 * ```csv
 * latitude,longitude,rawMessage
 * 39.8869744,116.2386613,"20202310190532U7]1 9U3 [-[202011614023139505802000"
 * 39.8749211,116.25454,"20202310190532U7]1 9U3 [-[202011614023139505802000"
 */
export const convertGpsListToKeplerGlCsv = (
  gpsList: { latitude: number; longitude: number; rawMessage: string }[]
) => {
  const header = 'latitude,longitude,rawMessage';
  const csvList = gpsList
    .map((gps) => `${gps.latitude},${gps.longitude},"${gps.rawMessage}"`)
    .join('\n');
  return `${header}\n${csvList}`;
};

export const downloadFile = (content: string, filename: string) => {
  const a = document.createElement('a');
  a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
  a.download = filename;
  a.click();
};

export const fetchTsvData = async () => {
  return new Promise<RawPocsagRow[]>(async (resolve, reject) => {
    // we have problem in the format of CSV file, because the `messageContent` may contain commas and quotes
    // so maybe we need TSV file for other program to process
    const response = await fetch(
      // The data is served by setupProxy.js
      'http://localhost:3000/pocsag-data/pocsag_data_v2.tsv'
    );
    if (!response) {
      throw new TypeError('Network error - server may be down');
    }
    if (!response.ok) {
      throw new Error('Server not responding');
    }
    const text = await response.text();
    // When getting a HTML response, normally means a 404 not found error
    // This is because the backend is webpack dev server, when file not found, the create-react-app will return a HTML page
    if (text.startsWith('<!DOCTYPE html>')) {
      reject(new Error('Response is not a valid TSV file'));
    }
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: '\t',
      complete: (results) => {
        // if the the line count before papaparse is not the same as the line count after papaparse,
        // it means the tsv file is not valid
        if (results.data.length !== text.split('\n').length) {
          console.error(
            `There is something wrong when parsing the TSV file, please check the original file and also the PapaParse error message. The original line count is ${
              text.split('\n').length
            }, but the parsed line count is ${results.data.length}`
          );
          console.error(results.errors);
        }
        resolve(results.data as unknown as RawPocsagRow[]);
      },
      error: (err: Error) => {
        reject(new Error('Error parsing CSV: ' + err.message));
      },
    });
  });
};
