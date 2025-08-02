import { Card } from 'antd';
import { Pie } from '@ant-design/charts';
import { DashboardStats } from '../../types/dashboardModal';

interface Props {
  data: DashboardStats['difficultyStats'];
}

const DifficultyPieChart = ({ data }: Props) => {
  const chartData = [
    { type: 'Dễ', value: data.easy },
    { type: 'Trung bình', value: data.medium },
    { type: 'Khó', value: data.hard },
  ];

  return (
    <Card title="Phân bố độ khó flashcards">
      <Pie
        data={chartData}
        angleField="value"
        colorField="type"
        radius={0.8}
        label={{
          formatter: (datum: any) => `${datum.type}: ${datum.value}`, // ✅ sửa tại đây
          style: {
            fontSize: 14,
          },
        }}
      />
    </Card>
  );
};

export default DifficultyPieChart;
