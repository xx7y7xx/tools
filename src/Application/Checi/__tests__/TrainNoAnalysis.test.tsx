// All tests for TrainNoAnalysis have been temporarily removed for step-by-step error fixing.

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainNoAnalysis from '../TrainNoAnalysis';
import { fetchAllHistoricalData } from '../../../services/trainsData';

// Mock Ant Design's responsive observer to prevent addListener error
jest.mock('antd/lib/_util/responsiveObserver', () => ({
  __esModule: true,
  default: () => ({
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  }),
}));

jest.mock('../../../services/trainsData', () => ({
  fetchAllHistoricalData: jest.fn(),
}));

describe('TrainNoAnalysis (happy path)', () => {
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
          total_num: '1',
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
          total_num: '1',
        },
      },
    });
    const onError = jest.fn();
    const onLoadingChange = jest.fn();
    render(
      <TrainNoAnalysis onError={onError} onLoadingChange={onLoadingChange} />
    );
    // Check for statistic titles
    expect(await screen.findByText('总车次数')).toBeInTheDocument();
    expect(await screen.findByText('有变化车次')).toBeInTheDocument();
    expect(await screen.findByText('无变化车次')).toBeInTheDocument();
    expect(await screen.findByText('变化率')).toBeInTheDocument();
    // Check for the numbers (should be at least two '2's and two '0's)
    expect((await screen.findAllByText('2')).length).toBeGreaterThanOrEqual(2);
    expect((await screen.findAllByText('0')).length).toBeGreaterThanOrEqual(2);
  });
});

describe('TrainNoAnalysis (snapshot)', () => {
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
          total_num: '1',
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
          total_num: '1',
        },
      },
    });
    const onError = jest.fn();
    const onLoadingChange = jest.fn();
    const { container } = render(
      <TrainNoAnalysis onError={onError} onLoadingChange={onLoadingChange} />
    );

    // Wait for the component to finish loading
    await screen.findByText('总车次数');

    // Create snapshot
    expect(container).toMatchSnapshot();
  });
});
