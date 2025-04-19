import { useEffect, useState } from 'react';

import { Table, Input, Select, Button } from 'antd';
import type { ColumnType } from 'antd/es/table';

import {
  ParsedPocsagRow,
  ParsedPocsagPayload1234000,
  ParsedPocsagPayload1234002,
} from '../PocsagViewer/types';
import { MessageType } from '../PocsagViewer/types';
import { filterPocsagData } from './filter';
import GoogleMapLink from '../PocsagViewer/GoogleMapLink';
import {
  convertGpsListToKeplerGlCsv,
  convertGpsListToWkt,
  convertGpsListToWktPoint,
  downloadFile,
} from '../PocsagViewer/utils';

const SignalTable = ({
  parsedSignalRows,
}: {
  parsedSignalRows: ParsedPocsagRow[];
}) => {
  const [tableHeight, setTableHeight] = useState(600);

  // Initialize state from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const toolParams = urlParams.get('toolParams')
    ? JSON.parse(urlParams.get('toolParams') || '{}')
    : {};

  const [searchText, setSearchText] = useState(toolParams.content || '');
  const [addressSearchText, setAddressSearchText] = useState(
    toolParams.address || ''
  );
  const [messageTypeSearchText, setMessageTypeSearchText] =
    useState<MessageType | null>(toolParams.type || null);
  const [timestampSearchText, setTimestampSearchText] = useState(
    toolParams.timestamp || ''
  );

  // Update URL params when search values change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newToolParams = {
      ...(searchText && { content: searchText }),
      ...(addressSearchText && { address: addressSearchText }),
      ...(messageTypeSearchText && { type: messageTypeSearchText }),
      ...(timestampSearchText && { timestamp: timestampSearchText }),
    };

    if (Object.keys(newToolParams).length > 0) {
      params.set('toolParams', JSON.stringify(newToolParams));
    } else {
      params.delete('toolParams');
    }

    // Update URL without page reload
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params.toString()}`
    );
  }, [
    searchText,
    addressSearchText,
    messageTypeSearchText,
    timestampSearchText,
  ]);

  useEffect(() => {
    const updateHeight = () => {
      const headerElement = document.querySelector('h1');
      const tableTitleElement: HTMLElement | null =
        document.querySelector('.ant-table-title');
      const tableHeaderElement: HTMLElement | null =
        document.querySelector('.ant-table-header');
      const tableFooterElement: HTMLElement | null =
        document.querySelector('.ant-table-footer');
      const headerHeight = headerElement
        ? headerElement.offsetHeight +
          parseInt(window.getComputedStyle(headerElement).marginTop) +
          parseInt(window.getComputedStyle(headerElement).marginBottom)
        : 0;
      const tableTitleHeight = tableTitleElement
        ? tableTitleElement.offsetHeight
        : 0;
      const tableHeaderHeight = tableHeaderElement
        ? tableHeaderElement.offsetHeight
        : 0;
      const tableFooterHeight = tableFooterElement
        ? tableFooterElement.offsetHeight
        : 0;
      const availableHeight =
        window.innerHeight -
        headerHeight -
        tableTitleHeight -
        tableHeaderHeight -
        tableFooterHeight;
      setTableHeight(availableHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const filteredData: ParsedPocsagRow[] = filterPocsagData(parsedSignalRows, {
    content: searchText,
    address: addressSearchText,
    type: messageTypeSearchText,
    timestamp: timestampSearchText,
  });

  const columns: ColumnType<ParsedPocsagRow>[] = [
    {
      title: () => (
        <div>
          Timestamp{' '}
          <Input
            placeholder="Search timestamp"
            allowClear
            value={timestampSearchText}
            onChange={(e) => setTimestampSearchText(e.target.value)}
            style={{ width: 120 }}
            size="small"
          />
        </div>
      ),
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 100,
    },
    {
      title: () => (
        <div>
          Address{' '}
          <Input
            placeholder="Search address"
            allowClear
            value={addressSearchText}
            onChange={(e) => setAddressSearchText(e.target.value)}
            style={{ width: 120 }}
            size="small"
          />
        </div>
      ),
      dataIndex: 'address',
      key: 'address',
      width: 100,
    },
    {
      title: 'Function Code',
      dataIndex: 'functionBits',
      key: 'functionBits',
      width: 80,
    },
    {
      title: () => (
        <div>
          <Select
            placeholder="Msg Type"
            allowClear
            value={messageTypeSearchText}
            onChange={(value) => setMessageTypeSearchText(value)}
            style={{ width: 120 }}
            size="small"
            options={[
              { value: MessageType.Numeric, label: 'Numeric' },
              { value: MessageType.Alpha, label: 'Alpha' },
              { value: MessageType.Skyper, label: 'Skyper' },
            ]}
          />
        </div>
      ),
      dataIndex: 'messageFormat',
      key: 'messageFormat',
      width: 80,
    },
    {
      title: () => (
        <div>
          Message Content{' '}
          <Input
            placeholder="Search messages"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            size="small"
          />
        </div>
      ),
      dataIndex: 'messagePayload',
      key: 'messagePayload',
      width: 400,
      //if  address is 1234000 and message type is numeric, then use convertTrainNumSpeedMileage to parse the message content
      render: (_, record: ParsedPocsagRow) => {
        if (
          record.address === 1234000 &&
          record.messageFormat === MessageType.Numeric
        ) {
          const payload = record.messagePayload as ParsedPocsagPayload1234000;
          if (record.parsedErrorMessage) {
            return `Raw: "${record.rawSignal['message_content(string)']}"; Err: ${record.parsedErrorMessage}`;
          }
          return (
            <div>
              <a
                href={`http://localhost:3000/tools?tool=pocsagViewer&toolParams={"trainNumber":${payload.trainNumber}}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {`${payload.trainNumber}`}{' '}
              </a>
              {`${payload.speed} ${payload.mileage}`}
            </div>
          );
        }
        if (
          record.address === 1234002 &&
          record.messageFormat === MessageType.Numeric
        ) {
          const payload = record.messagePayload as ParsedPocsagPayload1234002;
          if (record.parsedErrorMessage) {
            return `Raw: "${record.rawSignal['message_content(string)']}"; Err: ${record.parsedErrorMessage}`;
          }
          return (
            <div>
              <GoogleMapLink wgs84Str={payload.wgs84Str || ''} /> Raw:{' '}
              <code>{record.rawSignal['message_content(string)']}</code>
            </div>
          );
        }
        return <code>{record.rawSignal['message_content(string)']}</code>;
      },
    },
  ];

  const handleExportToGoogleMapKML = () => {
    const gpsList = filteredData
      .filter(
        (row: ParsedPocsagRow) =>
          row.address === 1234002 &&
          row.messageFormat === MessageType.Numeric &&
          row.messagePayload
      )
      .map((row: ParsedPocsagRow) => {
        const payload = row.messagePayload as ParsedPocsagPayload1234002;
        return {
          latitude: payload.gcj02 ? payload.gcj02.latitude : 0,
          longitude: payload.gcj02 ? payload.gcj02.longitude : 0,
        };
      });
    const wkt = convertGpsListToWkt(gpsList);
    downloadFile(wkt, 'train_route.csv');
  };

  const handleExportToGoogleMapKMLPoint = () => {
    const gpsList = filteredData
      .filter(
        (row: ParsedPocsagRow) =>
          row.address === 1234002 &&
          row.messageFormat === MessageType.Numeric &&
          row.messagePayload
      )
      .map((row: ParsedPocsagRow) => {
        const payload = row.messagePayload as ParsedPocsagPayload1234002;
        return {
          latitude: payload.gcj02 ? payload.gcj02.latitude : 0,
          longitude: payload.gcj02 ? payload.gcj02.longitude : 0,
        };
      });
    const wkt = convertGpsListToWktPoint(gpsList);
    downloadFile(wkt, 'train_route.csv');
  };

  const handleExportToKeplerGl = () => {
    const gpsList = filteredData
      .filter(
        (row: ParsedPocsagRow) =>
          row.address === 1234002 &&
          row.messageFormat === MessageType.Numeric &&
          row.messagePayload
      )
      .map((row: ParsedPocsagRow) => {
        const payload = row.messagePayload as ParsedPocsagPayload1234002;
        return {
          // no idea why but wgs84 works on Kepler.gl's satelite map
          latitude: payload.wgs84 ? payload.wgs84.latitude : 0,
          longitude: payload.wgs84 ? payload.wgs84.longitude : 0,
          rawMessage: row.rawSignal['message_content(string)'],
        };
      });
    const csv = convertGpsListToKeplerGlCsv(gpsList);
    downloadFile(csv, 'train_route.csv');
  };

  return (
    <Table
      dataSource={filteredData}
      columns={columns}
      pagination={false}
      scroll={{ y: tableHeight }}
      virtual
      size="small"
      rowKey={(record) =>
        record.timestamp +
        record.address +
        record.messageFormat +
        record.rawSignal
      }
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
        </div>
      )}
      footer={() => (
        <div>
          Filtered {filteredData.length} of {parsedSignalRows.length} | Full
          data time range: {parsedSignalRows[0]?.timestamp} ~{' '}
          {parsedSignalRows[parsedSignalRows.length - 1]?.timestamp}
        </div>
      )}
    />
  );
};

export default SignalTable;
