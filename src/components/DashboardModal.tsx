import { Area } from '@ant-design/charts';
import { Card, Col, Modal, Row, Spin, Statistic, Tooltip, message } from 'antd';
import { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import './DashboardModal.css';

interface DashboardModalProps {
    open: boolean;
    onClose: () => void;
}

interface ProgressData {
    date: string;
    totalWords: number;
}

interface HeatmapValue {
    date: string;
    count: number;
}

interface ActivityData {
    heatmapData: { [key: string]: number };
    currentStreak: number;
    longestStreak: number;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    icon: string;
}

const getStartDateForHeatmap = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
};

const DashboardModal = ({ open, onClose }: DashboardModalProps) => {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<ProgressData[]>([]);
    const [activity, setActivity] = useState<ActivityData | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    useEffect(() => {
        if (open) {
            fetchDashboardData();
        }
    }, [open]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stats/dashboard', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu dashboard');
            const data = await res.json();
            setProgress(data.progress || []);
            setActivity(data.activity || null);
            setAchievements(data.achievements || []);
        } catch (error) {
            message.error('Không thể tải dữ liệu thống kê!');
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
            bodyStyle={{ background: '#f0f2f5', padding: '24px' }}
        >
            <Spin spinning={loading}>
                <Row gutter={[24, 24]}>
                    {/* Learning Streaks */}
                    <Col xs={24} sm={12}>
                        <Card>
                            <Statistic title="Chuỗi ngày học hiện tại" value={activity?.currentStreak || 0} suffix="ngày 🔥" />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Card>
                            <Statistic title="Chuỗi ngày học dài nhất" value={activity?.longestStreak || 0} suffix="ngày 🏆" />
                        </Card>
                    </Col>

                    {/* Progress Chart */}
                    <Col span={24}>
                        <Card title="Tiến độ học từ vựng">
                            {progress && progress.length > 0 ? (
                                <Area
                                    data={progress}
                                    xField="date"
                                    yField="totalWords"
                                    axis={{ x: { tickCount: 5 } }}
                                    height={250}
                                />
                            ) : (
                                <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
                                    Chưa có dữ liệu tiến độ.
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Heatmap */}
                    <Col span={24}>
                        <Card title="Lịch sử ôn tập (1 năm qua)">
                            <CalendarHeatmap
                                startDate={getStartDateForHeatmap()}
                                endDate={new Date()}
                                values={heatmapValues}
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
                            <ReactTooltip id="heatmap-tooltip" />
                        </Card>
                    </Col>

                    {/* Achievements */}
                    <Col span={24}>
                        <Card title="Huy hiệu thành tích">
                            <Row gutter={[16, 16]}>
                                {achievements.map(ach => (
                                    <Col xs={24} sm={12} md={8} key={ach.id}>
                                        <Tooltip title={ach.description}>
                                            <Card
                                                style={
                                                    {
                                                        textAlign: 'center',
                                                        opacity: ach.unlocked ? 1 : 0.4,
                                                        filter: ach.unlocked ? 'none' : 'grayscale(100%)',
                                                        transition: 'all 0.3s'
                                                    }
                                                }
                                            >
                                                <div style={{ fontSize: '48px' }}>{ach.icon}</div>
                                                <h4 style={{ margin: '8px 0 4px 0' }}>{ach.name}</h4>
                                            </Card>
                                        </Tooltip>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </Modal>
    );
};

export default DashboardModal;