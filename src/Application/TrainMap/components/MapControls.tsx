import React from 'react';
import { Card, Button, Switch, Space, Tag, Typography, Row, Col } from 'antd';
import { CarOutlined, ReloadOutlined, WifiOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface MapControlsProps {
  isConnected: boolean;
  trainsCount: number;
  isLoading: boolean;
  showRailwayLines: boolean;
  autoRefresh: boolean;
  onShowRailwayLinesChange: (checked: boolean) => void;
  onAutoRefreshChange: (checked: boolean) => void;
  onRefresh: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onDebug: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  isConnected,
  trainsCount,
  isLoading,
  showRailwayLines,
  autoRefresh,
  onShowRailwayLinesChange,
  onAutoRefreshChange,
  onRefresh,
  onConnect,
  onDisconnect,
  onDebug,
}) => {
  return (
    <Card>
      <Row gutter={16} align="middle">
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            <CarOutlined /> Train Map
          </Title>
        </Col>
        <Col>
          <Space>
            <Tag color={isConnected ? 'green' : 'red'} icon={<WifiOutlined />}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Tag>
            <Text type="secondary">{trainsCount} trains active</Text>
          </Space>
        </Col>
        <Col flex="auto" />
        <Col>
          <Space>
            <Switch
              checked={showRailwayLines}
              onChange={onShowRailwayLinesChange}
              checkedChildren="Railway Lines"
              unCheckedChildren="Hide Lines"
            />
            <Switch
              checked={autoRefresh}
              onChange={onAutoRefreshChange}
              checkedChildren="Auto Refresh"
              unCheckedChildren="Manual"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
            <Button onClick={onDebug} size="small">
              Debug
            </Button>
            {isConnected ? (
              <Button onClick={onDisconnect} danger>
                Disconnect
              </Button>
            ) : (
              <Button onClick={onConnect} type="primary">
                Connect
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default MapControls;
