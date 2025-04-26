import { Button, Table } from 'antd';

import { useTimeRange } from './TimeRangeContext';

import { generateExpandColumns, ExtendedTableColumnsType } from './CheciTable';
import { GpsPoint, ParsedPocsagPayload1234002 } from './types';
import {
  convertGpsListToKeplerGlCsv,
  convertGpsListToWkt,
  convertGpsListToWktPoint,
  downloadFile,
} from './utils';

const CodeSpeedMileageTable = () => {
  const { filteredTrainSignalRecords, parsedPocsagRows } = useTimeRange();

  const trainSignalRecordsWithKey: ExtendedTableColumnsType[] =
    filteredTrainSignalRecords.map((record, idx: number) => {
      return {
        key: idx.toString(),
        timestamp: record.timestamp,
        trainNumber: record.payload.trainNumber,
        speed: record.payload.speed,
        mileage: record.payload.mileage,
        _related1234002RowIdx: record._related1234002RowIdx,
      };
    });

  // get gcj02 by default, can pass "wgs84" to get wgs84
  // no idea why but wgs84 works on Kepler.gl's satelite map
  const getGpsList = (type: 'gcj02' | 'wgs84' = 'gcj02'): GpsPoint[] => {
    const gpsList = trainSignalRecordsWithKey
      .filter(
        (record): record is typeof record & { _related1234002RowIdx: number } =>
          !!record._related1234002RowIdx
      )
      .map((record) => {
        const payload = parsedPocsagRows[record._related1234002RowIdx]
          ?.messagePayload as ParsedPocsagPayload1234002;
        return {
          latitude: payload?.[type] ? payload?.[type]?.latitude : 0,
          longitude: payload?.[type] ? payload?.[type]?.longitude : 0,
          rawMessage:
            parsedPocsagRows[record._related1234002RowIdx]?.rawSignal[
              'message_content(string)'
            ],
        } as GpsPoint;
      });
    return gpsList;
  };

  const handleExportToGoogleMapKML = () => {
    const gpsList = getGpsList();
    const wkt = convertGpsListToWkt(gpsList);
    downloadFile(wkt, 'train_route.csv');
  };

  const handleExportToGoogleMapKMLPoint = () => {
    const gpsList = getGpsList();
    const wkt = convertGpsListToWktPoint(gpsList);
    downloadFile(wkt, 'train_route.kml');
  };

  const handleExportToKeplerGl = () => {
    const gpsList = getGpsList('wgs84');
    const csv = convertGpsListToKeplerGlCsv(gpsList);
    downloadFile(csv, 'train_route.csv');
  };

  return (
    <div>
      <Table<ExtendedTableColumnsType>
        columns={generateExpandColumns(parsedPocsagRows)}
        dataSource={trainSignalRecordsWithKey}
        pagination={false}
        title={() => (
          <div>
            <Button type="primary" onClick={handleExportToGoogleMapKML}>
              Export to Google Map KML Line
            </Button>{' '}
            <Button type="primary" onClick={handleExportToGoogleMapKMLPoint}>
              Export to Google Map KML Point
            </Button>{' '}
            <Button type="primary" onClick={handleExportToKeplerGl}>
              Export to Kepler.gl CSV
            </Button>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.google.com/mymaps"
            >
              https://www.google.com/mymaps
            </a>
          </div>
        )}
      />
    </div>
  );
};

export default CodeSpeedMileageTable;
