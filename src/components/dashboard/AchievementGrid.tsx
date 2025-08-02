import { Card, Col, Row, Tooltip } from 'antd';
import { Achievement } from '../../types/dashboardModal';

interface Props {
  achievements: Achievement[];
}

const AchievementGrid = ({ achievements }: Props) => {
  return (
    <Card title="Huy hiệu thành tích">
      <Row gutter={[16, 16]}>
        {achievements.map((ach) => (
          <Col xs={24} sm={12} md={8} key={ach.id}>
            <Tooltip title={ach.description}>
              <Card
                style={{
                  textAlign: 'center',
                  opacity: ach.unlocked ? 1 : 0.4,
                  filter: ach.unlocked ? 'none' : 'grayscale(100%)',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ fontSize: '48px' }}>{ach.icon}</div>
                <h4 style={{ margin: '8px 0 4px 0' }}>{ach.name}</h4>
              </Card>
            </Tooltip>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default AchievementGrid;