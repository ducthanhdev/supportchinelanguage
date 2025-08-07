import { Area } from "@ant-design/charts";
import { Card, Select } from "antd";
import { ProgressData } from "../../types/dashboardModal";
import { RANGE_OPTIONS } from "./constants";
import { useState } from "react";

interface Props {
  progress: ProgressData[];
  selectedRange: "7days" | "30days" | "90days";
  onChangeRange: (range: "7days" | "30days" | "90days") => void;
}

const ProgressChart = ({ progress, selectedRange, onChangeRange }: Props) => {
  const [loading, setLoading] = useState(false);
  return (
    <Card title="Tiến độ học từ vựng">
      <div style={{ marginBottom: 16 }}>
        <Select
          value={selectedRange}
          onChange={onChangeRange}
          options={RANGE_OPTIONS}
          style={{ width: 200 }}
        />
      </div>
      {progress?.length > 0 ? (
        <Area
          data={progress}
          xField="date"
          yField="totalWords"
          axis={{ x: { tickCount: 5 } }}
          height={250}
        />
      ) : loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <div className="no-data-message">Chưa có dữ liệu tiến độ.</div>
      )}
    </Card>
  );
};

export default ProgressChart;
