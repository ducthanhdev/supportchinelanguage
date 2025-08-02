import { Card, Col, Row, Statistic } from 'antd';
import { ActivityData } from '../../types/dashboardModal';

interface Props {
  activity: ActivityData | null;
}

const StreakCards = ({ activity }: Props) => {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12}>
        <Card bordered style={{ textAlign: 'center' }}>
          <Statistic
            title="Chuỗi ngày học hiện tại"
            value={activity?.currentStreak || 0}
            suffix={<span>ngày 🔥</span>}
            valueStyle={{ fontSize: 24 }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12}>
        <Card bordered style={{ textAlign: 'center' }}>
          <Statistic
            title="Chuỗi ngày học dài nhất"
            value={activity?.longestStreak || 0}
            suffix={<span>ngày 🏆</span>}
            valueStyle={{ fontSize: 24 }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StreakCards;
