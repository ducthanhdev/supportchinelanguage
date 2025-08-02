export interface DashboardStats {
  progress: { date: string; totalWords: number }[];
  dailyCounts: { date: string; count: number }[]; // 👈 thêm dòng này
  activity: {
    heatmapData: { [date: string]: number };
    currentStreak: number;
    longestStreak: number;
  };
  achievements: Achievement[];
  difficultyStats: {
    easy: number;
    medium: number;
    hard: number;
  };
}


export interface DashboardModalProps {
  open: boolean;
  onClose: () => void;
}


export interface ProgressData {
  date: string;
  totalWords: number;
}

export interface HeatmapValue {
  date: string;
  count: number;
}

export interface ActivityData {
  heatmapData: { [key: string]: number };
  currentStreak: number;
  longestStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}