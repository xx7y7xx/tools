import React from 'react';
import { Card, Button, Space, Tag, Typography, Row, Col } from 'antd';
import { TrainPosition } from '../services/types';

const { Text } = Typography;

interface TrainDetailCardProps {
  train: TrainPosition;
  onClose: () => void;
}

const TrainDetailCard: React.FC<TrainDetailCardProps> = ({
  train,
  onClose,
}) => {
  return (
    <Card
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '300px',
        zIndex: 1000,
      }}
      title={`Train ${train.trainNumber}`}
      extra={
        <Button size="small" onClick={onClose}>
          ×
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row>
          <Col span={12}>
            <Text type="secondary">Status</Text>
            <br />
            <Tag color={train.status === 'active' ? 'green' : 'orange'}>
              {train.status}
            </Tag>
          </Col>
          <Col span={12}>
            <Text type="secondary">Direction</Text>
            <br />
            <Text strong>{train.direction?.toFixed(1)}°</Text>
          </Col>
        </Row>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Last update: {new Date(train.timestamp).toLocaleString()}
        </Text>
      </Space>
    </Card>
  );
};

export default TrainDetailCard;
