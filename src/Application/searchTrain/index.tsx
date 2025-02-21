import { useEffect, useState } from 'react';
import { message, Tabs, TabsProps } from 'antd';
import {
  StationToTrainMapType,
  TrainFullInfoType,
  TrainsFullInfoMapType,
} from './types';
import { getAllTrainsAsync } from '../helpers/trainHelpers';
import SearchByCode from './SearchByName';
import SearchByStation from './SearchByStation';
import SystemInfo from './SystemInfo';

interface SearchTrainProps {
  date: string;
}

const SearchTrain = ({ date }: SearchTrainProps) => {
  const [rawTrains, setRawTrains] = useState<TrainFullInfoType[]>([]);
  const [trainsFullInfoMap, setTrainsFullInfoMap] =
    useState<TrainsFullInfoMapType>({});
  const [stationMap, setStationMap] = useState<StationToTrainMapType>({});

  useEffect(() => {
    const loadTrains = async () => {
      try {
        // get all trains from indexedDB
        const trains = await getAllTrainsAsync();
        setRawTrains(trains);

        const mmap: TrainsFullInfoMapType = {};
        const _stationMap: StationToTrainMapType = {};

        trains.forEach((train) => {
          // Add train to trains map
          mmap[train.trainNumber] = train;

          // Add train to station maps
          const fromKey = `from:${train.fromStation}`;
          const toKey = `to:${train.toStation}`;

          _stationMap[fromKey] = _stationMap[fromKey] || [];
          _stationMap[toKey] = _stationMap[toKey] || [];

          _stationMap[fromKey].push(train);
          _stationMap[toKey].push(train);
        });

        setTrainsFullInfoMap(mmap);
        setStationMap(_stationMap);
        message.success(
          `Trains loaded successfully. Total count: ${trains.length}`
        );
      } catch (error) {
        console.error('Failed to load trains:', error);
        message.error('Failed to load trains data');
      }
    };

    loadTrains();
  }, []);

  const items: TabsProps['items'] = [
    {
      key: 'search-by-code',
      label: 'Search by Code',
      children: <SearchByCode trainsFullInfoMap={trainsFullInfoMap} />,
    },
    {
      key: 'search-by-station',
      label: 'Search by Station',
      children: <SearchByStation stationMap={stationMap} />,
    },
    {
      key: 'system-info',
      label: 'System Info',
      children: <SystemInfo rawTrains={rawTrains} />,
    },
  ];

  return (
    <div style={{ marginTop: 10 }}>
      <Tabs defaultActiveKey="search-by-code" items={items} />
    </div>
  );
};

export default SearchTrain;
