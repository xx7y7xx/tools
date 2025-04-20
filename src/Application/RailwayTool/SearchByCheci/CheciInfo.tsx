import { useEffect, useState } from 'react';

import { Github } from '@db-man/github';
import { Descriptions, DescriptionsProps, message, Spin } from 'antd';

import { checiInfoType } from '../types';
import {
  LS_PERSONAL_ACCESS_TOKEN_KEY,
  LS_GITHUB_OWNER_KEY,
  LS_GITHUB_REPO_KEY,
} from '../constants';
import { useTrains } from '../../context/TrainsContext';
import CheciInfoDescriptions from './CheciInfoDescriptions';
import Code from '../../PocsagSignalViewer/Code';

const CheciInfo = ({ checi }: { checi: string }) => {
  const { trainsFullInfoMap, date } = useTrains();

  const [loading, setLoading] = useState(false);
  const [checiInfo, setCheciInfo] = useState<checiInfoType[]>([]);

  useEffect(() => {
    const github = new Github({
      personalAccessToken: localStorage.getItem(LS_PERSONAL_ACCESS_TOKEN_KEY),
      owner: localStorage.getItem(LS_GITHUB_OWNER_KEY),
      repoName: localStorage.getItem(LS_GITHUB_REPO_KEY),
    });

    setLoading(true);
    // Get checi info from github
    github
      .getFileContentAndSha(`/wholeTimeRangeCheci/checiDir/${checi}.json`)
      .then(({ content }) => {
        setCheciInfo(content as checiInfoType[]);
      })
      .catch((error) => {
        console.error(`Failed to get checi info for ${checi}`, error);
        message.error(`Failed to get checi info for ${checi}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [checi]);

  const checiInfoItems: DescriptionsProps['items'] = checiInfo.map(
    (checiInfo: checiInfoType) => ({
      key: checiInfo.date,
      label: checiInfo.date,
      children: (
        <div>
          <div>
            {checiInfo.from_station} - {checiInfo.to_station}
          </div>
          <div>total_num: {checiInfo.total_num}</div>
          <div>train_no: {checiInfo.train_no}</div>
        </div>
      ),
    })
  );

  return (
    <div>
      车次 {checi} 的详细数据对应的日期: {date}
      {trainsFullInfoMap[checi] ? (
        <CheciInfoDescriptions trainFullInfo={trainsFullInfoMap[checi]} />
      ) : (
        <div>
          Not found in <Code>trainsFullInfoMap</Code>
        </div>
      )}
      {loading ? (
        <Spin />
      ) : (
        <Descriptions
          title={`车次 ${checi} 的历史数据`}
          items={checiInfoItems}
          bordered
        />
      )}
    </div>
  );
};

export default CheciInfo;
