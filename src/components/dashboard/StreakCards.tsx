import { Card, Col, Row, Statistic } from 'antd';
import { FireOutlined, TrophyOutlined } from '@ant-design/icons';
import { User } from '../../types/user';

// Sửa Props: Nhận vào currentUser thay vì activity
interface StreakCardsProps {
  currentUser: User | null;
}

const StreakCards = ({ currentUser }: StreakCardsProps) => {
  // Lấy dữ liệu streak từ currentUser
  const currentStreak = currentUser?.streak?.current || 0;
  const longestStreak = currentUser?.streak?.longest || 0;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
      <Col xs={24} sm={12}>
        <Card style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: 'white', borderRadius: 16, boxShadow: '0 10px 20px -5px rgba(253, 160, 133, 0.5)' }}>
          <Statistic
            title={<span style={{ color: 'white', opacity: 0.9 }}>Chuỗi ngày học hiện tại</span>}
            value={currentStreak}
            prefix={<FireOutlined />}
            valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: 36 }}
            suffix={<span style={{ color: 'white', opacity: 0.9, marginLeft: 8 }}>ngày</span>}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12}>
        <Card style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: 16, boxShadow: '0 10px 20px -5px rgba(245, 87, 108, 0.5)' }}>
          <Statistic
            title={<span style={{ color: 'white', opacity: 0.9 }}>Chuỗi dài nhất</span>}
            value={longestStreak}
            prefix={<TrophyOutlined />}
            valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: 36 }}
            suffix={<span style={{ color: 'white', opacity: 0.9, marginLeft: 8 }}>ngày</span>}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StreakCards;
