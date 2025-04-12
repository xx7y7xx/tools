import { useEffect, useState } from 'react';

import Papa from 'papaparse';

import { PocsagData } from '../PocsagViewer/types';
import { Table, Input, Select } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { Key } from 'antd/es/table/interface';
import { MessageType } from '../PocsagViewer/types';

/**
 * PocsagViewer is a web application that allows you to view POCSAG data.
 * It reads the POCSAG data from a CSV file and displays it in a table.
 * It also allows you to filter the data by train number.
 */
const PocsagViewer = () => {
  const [data, setData] = useState<PocsagData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [searchText, setSearchText] = useState('');
  const [addressSearchText, setAddressSearchText] = useState('');
  const [messageTypeSearchText, setMessageTypeSearchText] =
    useState<MessageType | null>(null);

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

  const filteredData = data.filter(
    (record) =>
      record.message_content.toLowerCase().includes(searchText.toLowerCase()) &&
      record.address.toLowerCase().includes(addressSearchText.toLowerCase()) &&
      (messageTypeSearchText === null ||
        record.message_format === messageTypeSearchText)
  );

  const columns: ColumnType<PocsagData>[] = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 100,
    },
    {
      title: () => (
        <div>
          Address{' '}
          <Input.Search
            placeholder="Search address"
            allowClear
            onChange={(e) => setAddressSearchText(e.target.value)}
            style={{ width: 100 }}
          />
        </div>
      ),
      dataIndex: 'address',
      key: 'address',
      width: 50,
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
          Message Type{' '}
          <Select
            placeholder="Select type"
            allowClear
            onChange={(value) => setMessageTypeSearchText(value)}
            style={{ width: 120 }}
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
          <Input.Search
            placeholder="Search messages"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
        </div>
      ),
      dataIndex: 'message_content',
      key: 'message_content',
      width: 400,
    },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>POCSAG Signal Viewer</h1>
      <Table
        dataSource={filteredData}
        columns={columns}
        pagination={false}
        scroll={{ y: 600 }}
        virtual
        rowKey={(record) =>
          record.timestamp +
          record.address +
          record.message_format +
          record.message_content
        }
      />
    </div>
  );
};

export default PocsagViewer;
