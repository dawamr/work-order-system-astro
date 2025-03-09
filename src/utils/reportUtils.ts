import type { ReportSummary } from '../types/report';

// Format number with commas
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Calculate totals from report data
export const calculateTotals = (
  data: ReportSummary[],
): {
  total_wo: number;
  target_qty: number;
  achieved_qty: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
} => {
  return data.reduce(
    (acc, item) => {
      return {
        total_wo: acc.total_wo + item.total_wo,
        target_qty: acc.target_qty + item.target_qty,
        achieved_qty: acc.achieved_qty + item.achieved_qty,
        pending: acc.pending + item.pending,
        in_progress: acc.in_progress + item.in_progress,
        completed: acc.completed + item.completed,
        cancelled: acc.cancelled + item.cancelled,
      };
    },
    {
      total_wo: 0,
      target_qty: 0,
      achieved_qty: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    },
  );
};

// Calculate achievement percentage
export const calculateAchievementPercentage = (achieved: number, target: number): string => {
  if (target <= 0) return '0.00';
  return ((achieved / target) * 100).toFixed(2);
};
