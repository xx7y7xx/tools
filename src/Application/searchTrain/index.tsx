import { useEffect, useState } from 'react';
import { message, Tabs, TabsProps } from 'antd';

import {
  MetaData,
  StationToTrainMapType,
  TrainFullInfoType,
  TrainsFullInfoMapType,
} from './types';
import {
  getAllChecisAsync,
  getAllTrainsAsync,
  getTrainsMetaDataAsync,
} from '../helpers/trainHelpers';
import SearchByCode from './SearchByCode';
import SearchByStation from './SearchByStation';
import SystemInfo from './SystemInfo';
import SearchByCheci from './SearchByCheci';
import { TrainsProvider } from '../context/TrainsContext';

const SearchTrain = () => {
  const [rawTrains, setRawTrains] = useState<TrainFullInfoType[]>([]);
  const [trainsFullInfoMap, setTrainsFullInfoMap] =
    useState<TrainsFullInfoMapType>({});
  const [stationMap, setStationMap] = useState<StationToTrainMapType>({});
  const [checis, setChecis] = useState<string[]>([]);
  const [metaData, setMetaData] = useState<MetaData>({
    trainsDownloadedDate: '',
  });

  // Get initial active tab from URL or default to 'search-by-code'
  const urlParams = new URLSearchParams(window.location.search);
  const defaultTab = urlParams.get('tab') || 'search-by-code';

  const handleTabChange = (activeKey: string) => {
    // Update URL when tab changes
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', activeKey);
    window.history.pushState({}, '', newUrl);
  };

  useEffect(() => {
    const loadTrains = async () => {
      try {
        // get all trains from indexedDB
        const trains = await getAllTrainsAsync();
        setRawTrains(trains);

        const checis = await getAllChecisAsync();
        setChecis(checis);

        // get meta data from indexedDB
        const metaData = await getTrainsMetaDataAsync();
        if (Array.isArray(metaData) && metaData.length > 0) {
          setMetaData(metaData[0]);
        } else {
          message.error('Failed to load meta data');
          setMetaData({
            trainsDownloadedDate: '',
          });
        }

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
      children: <SearchByCode />,
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
    {
      key: 'search-by-checi',
      label: 'Search by Checi',
      children: <SearchByCheci />,
    },
  ];

  return (
    <TrainsProvider
      trainsFullInfoMap={trainsFullInfoMap}
      checis={checis}
      date={metaData.trainsDownloadedDate}
    >
      <div className="xxtools-search-train" style={{ marginTop: 10 }}>
        <Tabs
          defaultActiveKey={defaultTab}
          items={items}
          onChange={handleTabChange}
        />
      </div>
    </TrainsProvider>
  );
};

export default SearchTrain;
