import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DateBrowsing from '../DateBrowsing';
import { fetchTrainsData } from '../../../services/trainsData';
import { TrainInfo } from '../../../services/trainsData';
import * as antd from 'antd';

// Mock Ant Design's responsive observer to prevent addListener error
jest.mock('antd/lib/_util/responsiveObserver', () => ({
  __esModule: true,
  default: () => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  }),
}));

// Mock Ant Design components
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    List: Object.assign(
      ({
        dataSource,
        renderItem,
      }: {
        dataSource: TrainInfo[];
        renderItem: (item: TrainInfo) => React.ReactNode;
      }) => (
        <div data-testid="mock-list">
          {dataSource?.map((item: TrainInfo, index: number) => (
            <div key={index} data-testid="mock-list-item">
              {renderItem(item)}
            </div>
          ))}
        </div>
      ),
      {
        Item: ({ children }: { children: React.ReactNode }) => (
          <div data-testid="mock-list-item-component">{children}</div>
        ),
      }
    ),
  };
});

jest.mock('../../../services/trainsData', () => ({
  fetchTrainsData: jest.fn(),
}));

// Replace the class-based MockInputSearch with a function component using hooks and forwardRef
const MockInputSearch = React.forwardRef<any, any>(
  (
    {
      placeholder,
      style,
      enterButton,
      onSearch,
      onChange,
      value = '',
      ...rest
    },
    ref
  ) => {
    return (
      <div>
        <input
          ref={ref}
          placeholder={placeholder}
          style={style}
          data-testid={placeholder}
          value={value}
          onChange={onChange}
          {...rest}
        />
        <button onClick={() => onSearch && onSearch(value)}>
          {enterButton}
        </button>
      </div>
    );
  }
);
antd.Input.Search = MockInputSearch;

describe('DateBrowsing (snapshot)', () => {
  it('matches snapshot', async () => {
    // Mock data for trains
    const mockTrainsData = {
      G1: {
        train_no: 'T100',
        from_station: '北京',
        to_station: '上海',
        station_train_code: 'G1',
        total_num: '1',
      },
      G2: {
        train_no: 'T200',
        from_station: '上海',
        to_station: '广州',
        station_train_code: 'G2',
        total_num: '1',
      },
    };

    (fetchTrainsData as jest.Mock).mockResolvedValue(mockTrainsData);

    const onError = jest.fn();
    const onLoadingChange = jest.fn();
    const { container } = render(
      <DateBrowsing onError={onError} onLoadingChange={onLoadingChange} />
    );

    // Enter date and fetch data
    const dateInput = screen.getByPlaceholderText('输入日期 (如: 20250609)');
    const searchButton = screen.getByText('下载数据');
    fireEvent.change(dateInput, { target: { value: '20241120' } });
    fireEvent.click(searchButton);

    // Wait for data to load
    await waitFor(() => {
      expect(
        screen.getByText('已加载 20241120 的数据 (2 趟列车)')
      ).toBeInTheDocument();
    });

    // Create snapshot
    expect(container).toMatchSnapshot();
  });
});
