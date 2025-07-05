import { useState } from 'react';

import { Alert, Button, Form, Input, message, Space } from 'antd';

import {
  LS_PERSONAL_ACCESS_TOKEN_KEY,
  LS_GITHUB_OWNER_KEY,
  LS_GITHUB_REPO_KEY,
} from '../RailwayTool/constants';
import {
  deleteAndCreateDatabaseAsync,
  saveTrainsToIndexedDBAsync,
  // downloadAndSaveWholeTimeRangeCheciListOnlyCheciData,
  downloadTrainsDataFromGithub,
} from './helpers';
import { dbName } from '../trainsDbCfg';

const SetGitHub = ({ date }: { date: string }) => {
  const [personalAccessToken, setPersonalAccessToken] = useState(
    localStorage.getItem(LS_PERSONAL_ACCESS_TOKEN_KEY) || ''
  );
  const [githubOwner, setGithubOwner] = useState(
    localStorage.getItem(LS_GITHUB_OWNER_KEY) || ''
  );
  const [githubRepo, setGithubRepo] = useState(
    localStorage.getItem(LS_GITHUB_REPO_KEY) || ''
  );
  const disabled =
    localStorage.getItem(LS_PERSONAL_ACCESS_TOKEN_KEY) === null ||
    localStorage.getItem(LS_GITHUB_OWNER_KEY) === null ||
    localStorage.getItem(LS_GITHUB_REPO_KEY) === null;

  const handleDownloadAndSaveTrainsData = async () => {
    const trainsData = await downloadTrainsDataFromGithub(date);
    await saveTrainsToIndexedDBAsync(date, trainsData);
  };

  const handleDeleteAndCreateDatabase = async () => {
    await deleteAndCreateDatabaseAsync(dbName);
    message.success('Database deleted and created successfully');
  };

  // const handleDownloadAndSaveWholeTimeRangeCheciListOnlyCheciData = () => {
  //   downloadAndSaveWholeTimeRangeCheciListOnlyCheciData(folderId);
  // };

  return (
    <div>
      Set github access for trains-data repo
      <Form layout="vertical">
        <Form.Item label="Personal Access Token">
          <Input
            placeholder="Personal Access Token"
            value={personalAccessToken}
            onChange={(e) => setPersonalAccessToken(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="GitHub Owner">
          <Input
            placeholder="GitHub Owner"
            value={githubOwner}
            onChange={(e) => setGithubOwner(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="GitHub Repo">
          <Input
            placeholder="GitHub Repo"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            onClick={() => {
              localStorage.setItem(
                LS_PERSONAL_ACCESS_TOKEN_KEY,
                personalAccessToken
              );
              localStorage.setItem(LS_GITHUB_OWNER_KEY, githubOwner);
              localStorage.setItem(LS_GITHUB_REPO_KEY, githubRepo);
              message.success('Settings saved successfully to local storage');
            }}
          >
            Save
          </Button>
        </Form.Item>
      </Form>
      <Space direction="vertical">
        <div>
          After set above GitHub settings, you can click below button to save
          wholeTimeRangeCheciListOnlyCheci.json to IndexedDB:
        </div>

        <Alert
          message="Why we need download data from GitHub instead of Google Drive: This is
          because in the latest version Chrome, I always failed to login with
          Google login button."
          type="warning"
        />
        <Button
          disabled={disabled}
          onClick={handleDeleteAndCreateDatabase}
          type="primary"
        >
          Delete and create database
        </Button>
        <Button
          disabled={disabled}
          onClick={handleDownloadAndSaveTrainsData}
          type="primary"
        >
          Save {date} to IndexedDB
        </Button>
        {/* <Button
        disabled={disabled}
        onClick={handleDownloadAndSaveWholeTimeRangeCheciListOnlyCheciData}
        type="primary"
      >
        Save wholeTimeRangeCheciListOnlyCheci.json to IndexedDB
      </Button> */}
      </Space>
    </div>
  );
};

export default SetGitHub;
