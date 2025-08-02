import { Card } from 'antd';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { HeatmapValue } from '../../types/dashboardModal';

const getStartDateForHeatmap = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date;
};

interface Props {
  values: HeatmapValue[];
}

const HeatmapChart = ({ values }: Props) => {
  return (
    <Card title="Lịch sử ôn tập (1 năm qua)">
      <CalendarHeatmap
        startDate={getStartDateForHeatmap()}
        endDate={new Date()}
        values={values}
        classForValue={(value) => {
          if (!value) return 'color-empty';
          return `color-scale-${Math.min(value.count, 4)}`;
        }}
        titleForValue={(value) =>
          value && value.date
            ? `${value.date}: ${value.count} lần ôn tập`
            : 'Không có dữ liệu'
        }
      />
    </Card>
  );
};

export default HeatmapChart;
