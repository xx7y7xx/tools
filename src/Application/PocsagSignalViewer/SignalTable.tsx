import { useEffect, useState } from 'react';

import { Table, Input, Select } from 'antd';
import type { ColumnType } from 'antd/es/table';

import { PocsagData } from '../PocsagViewer/types';
import { MessageType } from '../PocsagViewer/types';
import {
  convertTrainNumSpeedMileage,
  parsePocsag1234002,
} from '../PocsagViewer/utils';
import { filterPocsagData } from './filter';

const SignalTable = ({ allSignalRows }: { allSignalRows: PocsagData[] }) => {
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
      const tableHeaderElement: HTMLElement | null =
        document.querySelector('.ant-table-header');
      const tableFooterElement: HTMLElement | null =
        document.querySelector('.ant-table-footer');
      const headerHeight = headerElement
        ? headerElement.offsetHeight +
          parseInt(window.getComputedStyle(headerElement).marginTop) +
          parseInt(window.getComputedStyle(headerElement).marginBottom)
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
        tableHeaderHeight -
        tableFooterHeight;
      setTableHeight(availableHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const filteredData = filterPocsagData(allSignalRows, {
    content: searchText,
    address: addressSearchText,
    type: messageTypeSearchText,
    timestamp: timestampSearchText,
  });

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
        if (
          record.address === '1234002' &&
          record.message_format === MessageType.Numeric
        ) {
          const result = parsePocsag1234002(text);
          if (result.err || !result.latitude || !result.longitude) {
            return `Raw: "${text}"; Err: ${result.err}`;
          }
          return (
            <div>
              <a
                href={`https://www.google.com/maps/search/${result.latitude}+${result.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <code>
                  {result.latitude} {result.longitude}
                </code>
              </a>{' '}
              Raw: <code>{text}</code>
            </div>
          );
        }
        return <code>{text}</code>;
      },
    },
  ];

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
        record.message_format +
        record.message_content
      }
      footer={() => (
        <div>
          Filtered {filteredData.length} of {allSignalRows.length} | Full data
          time range: {allSignalRows[0]?.timestamp} ~{' '}
          {allSignalRows[allSignalRows.length - 1]?.timestamp}
        </div>
      )}
    />
  );
};

export default SignalTable;
