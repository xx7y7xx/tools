import { useEffect, useState } from 'react';

import { Github } from '@db-man/github';
import { Descriptions, DescriptionsProps, message, Spin } from 'antd';

import { checiInfoType } from '../types';
import {
  LS_PERSONAL_ACCESS_TOKEN_KEY,
  LS_GITHUB_OWNER_KEY,
  LS_GITHUB_REPO_KEY,
} from '../constants';

const CheciInfo = ({ checi }: { checi: string }) => {
  const [loading, setLoading] = useState(false);
  const [checiInfo, setCheciInfo] = useState<checiInfoType[]>([]);

  useEffect(() => {
    const github = new Github({
      personalAccessToken: localStorage.getItem(LS_PERSONAL_ACCESS_TOKEN_KEY),
      owner: localStorage.getItem(LS_GITHUB_OWNER_KEY),
      repoName: localStorage.getItem(LS_GITHUB_REPO_KEY),
    });

    setLoading(true);
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
      {loading ? (
        <Spin />
      ) : (
        <Descriptions title="Checi Info" items={checiInfoItems} bordered />
      )}
    </div>
  );
};

export default CheciInfo;
