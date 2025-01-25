import { useEffect, useState } from 'react';

import { message, Tabs, TabsProps } from 'antd';

import { StationToTrainMapType, TrainsFullInfoMapType } from './types';
import { getAllTrainsAsync } from '../helpers/trainHelpers';
import SearchByCode from './SearchByName';
import SearchByStation from './SearchByStation';

const SearchTrain = ({ date }: { date: string }) => {
  const [trainsFullInfoMap, setTrainsFullInfoMap] =
    useState<TrainsFullInfoMapType>({});
  const [stationMap, setStationMap] = useState<StationToTrainMapType>({});

  useEffect(() => {
    // get all trains from indexedDB
    getAllTrainsAsync().then((trains) => {
      const mmap: TrainsFullInfoMapType = {};
      const _stationMap: StationToTrainMapType = {};
      trains.forEach((train) => {
        mmap[train.trainNumber] = train;
        if (!_stationMap[`from:${train.fromStation}`]) {
          _stationMap[`from:${train.fromStation}`] = [];
        }
        if (!_stationMap[`to:${train.toStation}`]) {
          _stationMap[`to:${train.toStation}`] = [];
        }
        _stationMap[`from:${train.fromStation}`].push(train);
        _stationMap[`to:${train.toStation}`].push(train);
      });
      setTrainsFullInfoMap(mmap);
      setStationMap(_stationMap);
      message.success('Trains loaded, count ' + trains.length);
    });
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
  ];

  return (
    <div style={{ marginTop: 10 }}>
      <Tabs defaultActiveKey='1' items={items} />
    </div>
  );
};

export default SearchTrain;
