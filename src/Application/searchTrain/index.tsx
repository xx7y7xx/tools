import { message, Tabs, TabsProps } from 'antd';
import { useEffect, useState } from 'react';
import { TrainsFullInfoMapType } from './types';
import { getAllTrainsAsync } from '../helpers/trainHelpers';
import SearchByCode from './SearchByName';

const SearchTrain = ({ date }: { date: string }) => {
  const [trainsFullInfoMap, setTrainsFullInfoMap] =
    useState<TrainsFullInfoMapType>({});

  useEffect(() => {
    // get all trains from indexedDB
    getAllTrainsAsync().then((trains) => {
      const mmap: TrainsFullInfoMapType = {};
      trains.forEach((train) => {
        mmap[train.trainNumber] = train;
      });
      setTrainsFullInfoMap(mmap);
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
      children: 'Content of Tab Pane 2',
    },
  ];

  return (
    <div style={{ marginTop: 10 }}>
      <Tabs defaultActiveKey='1' items={items} />
    </div>
  );
};

export default SearchTrain;
