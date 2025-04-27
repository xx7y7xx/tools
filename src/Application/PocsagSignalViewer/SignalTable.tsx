import { useEffect, useState } from 'react';

import { Table, Input, Select, Button } from 'antd';
import type { ColumnType } from 'antd/es/table';

import {
  ParsedPocsagRow,
  ParsedPocsagPayload1234000,
  ParsedPocsagPayload1234002,
  GpsPoint,
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
import Code from './Code';

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

  const [searchText, setSearchText] = useState<string>(
    toolParams.content || ''
  );
  const [addressSearchText, setAddressSearchText] = useState<string>(
    toolParams.address || ''
  );
  const [selectedMessageTypes, setSelectedMessageTypes] = useState<
    MessageType[]
  >(toolParams.types ? JSON.parse(toolParams.types) : [MessageType.Numeric]);
  const [timestampSearchText, setTimestampSearchText] = useState<string>(
    toolParams.timestamp || ''
  );

  // Update URL params when search values change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newToolParams = {
      ...(searchText && { content: searchText }),
      ...(addressSearchText && { address: addressSearchText }),
      ...(selectedMessageTypes.length > 0 && {
        types: JSON.stringify(selectedMessageTypes),
      }),
      ...(timestampSearchText && { timestamp: timestampSearchText }),
    };

    if (Object.keys(newToolParams).length > 0) {
      params.set('toolParams', JSON.stringify(newToolParams));
    } else {
      console.warn('delete toolParams');
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
    selectedMessageTypes,
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
    types: selectedMessageTypes.length > 0 ? selectedMessageTypes : null,
    timestamp: timestampSearchText,
  });

  const columns: ColumnType<ParsedPocsagRow>[] = [
    {
      title: 'Global Index',
      dataIndex: 'globalIndex',
      key: 'globalIndex',
      width: 60,
    },
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
            mode="multiple"
            placeholder="Message Type"
            value={selectedMessageTypes}
            onChange={(values) =>
              setSelectedMessageTypes(values as MessageType[])
            }
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
      title: 'Message Content',
      dataIndex: 'rawSignal',
      key: 'rawSignal',
      width: 300,
      render: (_, record: ParsedPocsagRow) => {
        return <Code>{record.rawSignal['message_content(string)']}</Code>;
      },
    },
    {
      title: () => (
        <div>
          Message Payload{' '}
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
            return `Err: ${record.parsedErrorMessage}`;
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
            return `Err: ${record.parsedErrorMessage}`;
          }
          return (
            <div>
              <GoogleMapLink wgs84Str={payload.wgs84Str || ''} />
            </div>
          );
        }

        return <div>-</div>;
      },
    },
  ];

  // get gcj02 by default, can pass "wgs84" to get wgs84
  // no idea why but wgs84 works on Kepler.gl's satelite map
  const getGpsList = (type: 'gcj02' | 'wgs84' = 'gcj02'): GpsPoint[] => {
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
          latitude: payload[type] ? payload[type]?.latitude : 0,
          longitude: payload[type] ? payload[type]?.longitude : 0,
          rawMessage: row.rawSignal['message_content(string)'],
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
    downloadFile(wkt, 'train_route.csv');
  };

  const handleExportToKeplerGl = () => {
    const gpsList = getGpsList('wgs84');
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
          Filtered {filteredData.length} of {parsedSignalRows.length} |{' '}
          {`Full data time range: `}
          {parsedSignalRows[0]?.timestamp} ~{' '}
          {parsedSignalRows[parsedSignalRows.length - 1]?.timestamp}
        </div>
      )}
    />
  );
};

export default SignalTable;
