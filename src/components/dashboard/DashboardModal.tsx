import { Modal, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api/dashboardApi';
import {
  Achievement,
  ActivityData,
  DashboardModalProps,
  DashboardStats,
  HeatmapValue,
  ProgressData,
} from '../../types/dashboardModal';
import StreakCards from './StreakCards';
import ProgressChart from './ProgressChart';
import HeatmapChart from './HeatmapChart';
import DifficultyPieChart from './DifficultyPieChart';
import DailyCountChart from './DailyCountChart';
import AchievementGrid from './AchievementGrid';

const DashboardModal = ({ open, onClose }: DashboardModalProps) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedRange, setSelectedRange] = useState<'7days' | '30days' | '90days'>('30days');
  const [difficultyStats, setDifficultyStats] = useState<DashboardStats['difficultyStats']>({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [dailyCounts, setDailyCounts] = useState<DashboardStats['dailyCounts']>([]);

  useEffect(() => {
    if (open) {
      fetchDashboardData(selectedRange);
    }
  }, [open, selectedRange]);

  const fetchDashboardData = async (range: '7days' | '30days' | '90days') => {
    setLoading(true);
    try {
      const data = await getDashboardStats(range);
      setProgress(data.progress || []);
      setActivity(data.activity || null);
      setAchievements(data.achievements || []);
      setDifficultyStats(data.difficultyStats || { easy: 0, medium: 0, hard: 0 });
      setDailyCounts(data.dailyCounts || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const heatmapValues: HeatmapValue[] = activity
    ? Object.entries(activity.heatmapData).map(([date, count]) => ({ date, count }))
    : [];

  return (
    <Modal
      title="Bảng điều khiển học tập"
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
      bodyStyle={{ background: '#f0f2f5', padding: '24px' }}
    >
      <Spin spinning={loading}>
        <div style={{ display: 'grid', gap: 24 }}>
          <StreakCards activity={activity} />
          <ProgressChart
            progress={progress}
            selectedRange={selectedRange}
            onChangeRange={setSelectedRange}
          />
          <HeatmapChart values={heatmapValues} />
          <DifficultyPieChart data={difficultyStats} />
          <DailyCountChart data={dailyCounts} />
          <AchievementGrid achievements={achievements} />
        </div>
      </Spin>
    </Modal>
  );
};

export default DashboardModal;
