import { useEffect, useState } from 'react';

import { Table, Input, Select } from 'antd';
import type { ColumnType } from 'antd/es/table';
import Papa from 'papaparse';

import { PocsagData } from '../PocsagViewer/types';
import { MessageType } from '../PocsagViewer/types';
import { convertTrainNumSpeedMileage } from '../PocsagViewer/utils';

/**
 * PocsagSignalViewer is a web application that allows you to view POCSAG data.
 * It reads the POCSAG data from a CSV file and displays it in a table.
 * It also allows you to filter the data by train number.
 */
const PocsagSignalViewer = () => {
  const [data, setData] = useState<PocsagData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
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
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          'http://localhost:3001/data/pocsag_data_v2.csv'
        );
        if (!response) {
          throw new TypeError('Network error - server may be down');
        }
        if (!response.ok) {
          throw new Error('Server not responding');
        }
        const text = await response.text();
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data as unknown as PocsagData[]);
            setLoading(false);
          },
          error: (err: Error) => {
            setError('Error parsing CSV: ' + err.message);
            setLoading(false);
          },
        });
      } catch (err) {
        if (err instanceof TypeError) {
          setError('Start the server: `node server.js`');
        } else {
          setError('Error fetching CSV: ' + (err as Error).message);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      const headerHeight = document.querySelector('h1')?.offsetHeight || 0;
      const tableHeaderHeight = 39; // Antd table header height
      const padding = 32; // 16px margin top and bottom
      const availableHeight =
        window.innerHeight - headerHeight - tableHeaderHeight - padding;
      setTableHeight(availableHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const filteredData = data.filter(
    (record) =>
      record.message_content.toLowerCase().includes(searchText.toLowerCase()) &&
      record.address.toLowerCase().includes(addressSearchText.toLowerCase()) &&
      (messageTypeSearchText === null ||
        record.message_format === messageTypeSearchText) &&
      record.timestamp.toLowerCase().includes(timestampSearchText.toLowerCase())
  );

  const columns: ColumnType<PocsagData>[] = [
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
      dataIndex: 'function_bits',
      key: 'function_bits',
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
      dataIndex: 'message_format',
      key: 'message_format',
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
      dataIndex: 'message_content',
      key: 'message_content',
      width: 400,
      //if  address is 1234000 and message type is numeric, then use convertTrainNumSpeedMileage to parse the message content
      render: (text, record) => {
        if (
          record.address === '1234000' &&
          record.message_format === MessageType.Numeric
        ) {
          const result = convertTrainNumSpeedMileage(text);
          if (result.err || !result.data) {
            return `Raw: "${text}"; Err: ${result.err}`;
          }
          return (
            <div>
              <a
                href={`http://localhost:3000/tools?tool=pocsagViewer&toolParams={"trainNumber":${result.data.trainNumber}}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {`${result.data.trainNumber}`}{' '}
              </a>
              {`${result.data.speed} ${result.data.mileage}`}
            </div>
          );
        }
        return text;
      },
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1 style={{ margin: '16px 0', flexShrink: 0 }}>POCSAG Signal Viewer</h1>
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 16px' }}>
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
            record.message_format +
            record.message_content
          }
        />
      </div>
    </div>
  );
};

export default PocsagSignalViewer;
