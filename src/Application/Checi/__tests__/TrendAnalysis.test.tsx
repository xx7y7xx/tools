import React from 'react';
import { render, waitFor } from '@testing-library/react';
import TrendAnalysis from '../TrendAnalysis';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

jest.mock('../../../services/trainsData', () => ({
  ...jest.requireActual('../../../services/trainsData'),
  fetchAllHistoricalData: jest.fn(() =>
    Promise.resolve({
      '20241120': {
        '1461': {
          from_station: 'A',
          to_station: 'B',
          station_train_code: '1461',
          total_num: '5',
          train_no: 'T100',
        },
      },
    })
  ),
  extractTrainTrendsFromHistoricalData: jest.fn(() => [
    {
      date: '20241120',
      total_num: 5,
      trainInfo: {
        from_station: 'A',
        to_station: 'B',
        station_train_code: '1461',
        total_num: '5',
        train_no: 'T100',
      },
    },
  ]),
}));

jest.mock('../config', () => ({
  recentDates: ['20241120'],
}));

describe('TrendAnalysis', () => {
  it('matches snapshot', async () => {
    const onError = jest.fn();
    const onLoadingChange = jest.fn();
    const { container } = render(
      <TrendAnalysis onError={onError} onLoadingChange={onLoadingChange} />
    );
    // Wait for useEffect to finish
    await waitFor(() => expect(onLoadingChange).toHaveBeenCalled());
    expect(container).toMatchSnapshot();
  });
});
