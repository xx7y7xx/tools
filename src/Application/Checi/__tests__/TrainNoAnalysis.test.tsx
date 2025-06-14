import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrainNoAnalysis from '../TrainNoAnalysis';
import { fetchAllHistoricalData } from '../../../services/trainsData';

// Mock fetchAllHistoricalData service
jest.mock('../../../services/trainsData', () => ({
  fetchAllHistoricalData: jest.fn(),
}));

// Mock responsive observer
jest.mock('antd/lib/grid/hooks/useBreakpoint', () => ({
  __esModule: true,
  default: () => ({
    xs: false,
    sm: false,
    md: true,
    lg: true,
    xl: true,
    xxl: true,
  }),
}));

describe('TrainNoAnalysis Component', () => {
  const mockOnError = jest.fn();
  const mockOnLoadingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    const { container } = render(
      <TrainNoAnalysis
        onError={mockOnError}
        onLoadingChange={mockOnLoadingChange}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('loads and analyzes data on mount', async () => {
    const mockData = {
      '2024-03-20': {
        G1: { train_no: '240000G1010C' },
        G2: { train_no: '240000G2010C' },
      },
      '2024-03-21': {
        G1: { train_no: '240000G1010C' },
        G2: { train_no: '240000G2020C' }, // Changed train_no
      },
    };

    (fetchAllHistoricalData as jest.Mock).mockResolvedValue(mockData);

    render(
      <TrainNoAnalysis
        onError={mockOnError}
        onLoadingChange={mockOnLoadingChange}
      />
    );

    // Wait for analysis to complete
    await waitFor(
      () => {
        expect(screen.getByText('1/2')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(screen.getByText('个车次有变化 (50.0%)')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(mockOnLoadingChange).toHaveBeenCalledWith(false);
  });

  it('renders correctly with mock data', async () => {
    const mockData = {
      '2024-03-20': {
        G1: { train_no: '240000G1010C' },
        G2: { train_no: '240000G2010C' },
      },
      '2024-03-21': {
        G1: { train_no: '240000G1010C' },
        G2: { train_no: '240000G2020C' }, // Changed train_no
      },
    };

    (fetchAllHistoricalData as jest.Mock).mockResolvedValue(mockData);

    const { container } = render(
      <TrainNoAnalysis
        onError={mockOnError}
        onLoadingChange={mockOnLoadingChange}
      />
    );

    // Wait for analysis to complete
    await waitFor(
      () => {
        expect(screen.getByText('1/2')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(screen.getByText('个车次有变化 (50.0%)')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(container).toMatchSnapshot();
  });

  it('handles API errors correctly', async () => {
    (fetchAllHistoricalData as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch historical data')
    );

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <TrainNoAnalysis
          onError={mockOnError}
          onLoadingChange={mockOnLoadingChange}
        />
      );
    });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Failed to fetch historical data'
      );
    });

    expect(mockOnLoadingChange).toHaveBeenCalledWith(false);
  });

  it('displays train variations in the table', async () => {
    const mockData = {
      '2024-03-20': {
        G1: { train_no: '240000G1010C' },
        G2: { train_no: '240000G2010C' },
      },
      '2024-03-21': {
        G1: { train_no: '240000G1010C' },
        G2: { train_no: '240000G2020C' }, // Changed train_no
      },
    };

    (fetchAllHistoricalData as jest.Mock).mockResolvedValue(mockData);

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <TrainNoAnalysis
          onError={mockOnError}
          onLoadingChange={mockOnLoadingChange}
        />
      );
    });

    // Wait for analysis to complete
    await waitFor(
      () => {
        expect(screen.getByText('1/2')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(screen.getByText('个车次有变化 (50.0%)')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(screen.getByText('G2')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(screen.getByText('240000G2010C')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(screen.getByText('240000G2020C')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
