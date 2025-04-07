import { Button, Form, Input, message } from 'antd';
import { useState } from 'react';

import {
  LS_PERSONAL_ACCESS_TOKEN_KEY,
  LS_GITHUB_OWNER_KEY,
  LS_GITHUB_REPO_KEY,
} from '../searchTrain/constants';

const SetGitHub = () => {
  const [personalAccessToken, setPersonalAccessToken] = useState(
    localStorage.getItem(LS_PERSONAL_ACCESS_TOKEN_KEY) || ''
  );
  const [githubOwner, setGithubOwner] = useState(
    localStorage.getItem(LS_GITHUB_OWNER_KEY) || ''
  );
  const [githubRepo, setGithubRepo] = useState(
    localStorage.getItem(LS_GITHUB_REPO_KEY) || ''
  );
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
    </div>
  );
};

export default SetGitHub;
