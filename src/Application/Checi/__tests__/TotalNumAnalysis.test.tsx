import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TotalNumAnalysis from '../TotalNumAnalysis';
import { fetchAllHistoricalData } from '../../services/trainsData';

// Mock Chart.js with Chart as an object with register function
jest.mock('chart.js', () => ({
  Chart: { register: jest.fn() },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="mock-bar-chart" />,
}));

// Mock Ant Design's responsive observer to prevent addListener error
jest.mock('antd/lib/_util/responsiveObserver', () => ({
  __esModule: true,
  default: () => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  }),
}));

jest.mock('../../services/trainsData', () => ({
  fetchAllHistoricalData: jest.fn(),
}));

describe('TotalNumAnalysis (happy path)', () => {
  it('renders statistics when data loads', async () => {
    // Mock data for two dates and two trains
    (fetchAllHistoricalData as jest.Mock).mockResolvedValue({
      '20241120': {
        G1: {
          train_no: 'T100',
          from_station: '',
          to_station: '',
          station_train_code: '',
          total_num: '1',
        },
        G2: {
          train_no: 'T200',
          from_station: '',
          to_station: '',
          station_train_code: '',
          total_num: '2',
        },
      },
      '20241121': {
        G1: {
          train_no: 'T100',
          from_station: '',
          to_station: '',
          station_train_code: '',
          total_num: '1',
        },
        G2: {
          train_no: 'T200',
          from_station: '',
          to_station: '',
          station_train_code: '',
          total_num: '3',
        },
      },
    });
    const onError = jest.fn();
    const onLoadingChange = jest.fn();
    render(
      <TotalNumAnalysis onError={onError} onLoadingChange={onLoadingChange} />
    );
    // Check for statistic titles
    expect(await screen.findByText('总车次数')).toBeInTheDocument();
    expect(await screen.findByText('有变化车次')).toBeInTheDocument();
    expect(await screen.findByText('无变化车次')).toBeInTheDocument();
    expect(await screen.findByText('变化率')).toBeInTheDocument();
    // Check for the numbers (should be at least two '2's and one '1')
    expect((await screen.findAllByText('2')).length).toBeGreaterThanOrEqual(2);
    expect((await screen.findAllByText('1')).length).toBeGreaterThanOrEqual(1);
  });
});

describe('TotalNumAnalysis (snapshot)', () => {
  it('matches snapshot', async () => {
    // Mock data for two dates and two trains
    (fetchAllHistoricalData as jest.Mock).mockResolvedValue({
      '20241120': {
        G1: {
          train_no: 'T100',
          from_station: '',
          to_station: '',
          station_train_code: '',
          total_num: '1',
        },
        G2: {
          train_no: 'T200',
          from_station: '',
          to_station: '',
          station_train_code: '',
          total_num: '2',
        },
      },
      '20241121': {
        G1: {
          train_no: 'T100',
          from_station: '',
          to_station: '',
          station_train_code: '',
          total_num: '1',
        },
        G2: {
          train_no: 'T200',
          from_station: '',
          to_station: '',
          station_train_code: '',
          total_num: '3',
        },
      },
    });
    const onError = jest.fn();
    const onLoadingChange = jest.fn();
    const { container } = render(
      <TotalNumAnalysis onError={onError} onLoadingChange={onLoadingChange} />
    );

    // Wait for the component to finish loading
    await screen.findByText('总车次数');

    // Create snapshot
    expect(container).toMatchSnapshot();
  });
});
