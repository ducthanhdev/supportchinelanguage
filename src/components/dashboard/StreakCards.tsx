import { Card, Col, Row, Statistic } from 'antd';
import { FireOutlined, TrophyOutlined } from '@ant-design/icons';
import { User } from '../../types/user';

interface StreakCardsProps {
  currentUser: User | null;
}

const StreakCards = ({ currentUser }: StreakCardsProps) => {
  const currentStreak = currentUser?.streak?.current || 0;
  const longestStreak = currentUser?.streak?.longest || 0;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      <Col xs={24} sm={12}>
        <Card style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: 'white', borderRadius: 16 }}>
          <Statistic
            title={<span style={{ color: 'white' }}>Chuỗi ngày học hiện tại</span>}
            value={currentStreak}
            prefix={<FireOutlined />}
            valueStyle={{ color: 'white', fontWeight: 'bold' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12}>
        <Card style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: 16 }}>
          <Statistic
            title={<span style={{ color: 'white' }}>Chuỗi dài nhất</span>}
            value={longestStreak}
            prefix={<TrophyOutlined />}
            valueStyle={{ color: 'white', fontWeight: 'bold' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StreakCards;
