import { Card } from 'antd';
import { Column } from '@ant-design/charts';
import { DashboardStats } from '../../types/dashboardModal';

interface Props {
  data: DashboardStats['dailyCounts'];
}

const DailyCountChart = ({ data }: Props) => {
  return (
    <Card title="Từ vựng học mỗi ngày">
      {data.length > 0 ? (
        <Column
          data={data}
          xField="date"
          yField="count"
          height={300}
          axis={{
            x: { label: { autoHide: true, autoRotate: false } },
            y: { title: { text: 'Số từ học' } },
          }}
          tooltip={{
            formatter: (datum : any) => ({
              name: 'Số từ học',
              value: datum.count,
            }),
          }}
        />
      ) : (
        <div className="no-data-message">Chưa có dữ liệu từ vựng hàng ngày.</div>
      )}
    </Card>
  );
};

export default DailyCountChart;
