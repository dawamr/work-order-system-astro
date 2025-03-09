export interface ReportSummary {
  work_order_number: string;
  product_name: string;
  total_wo: number;
  percentage: number;
  target_qty: number;
  achieved_qty: number;
  achievement: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

export interface OperatorPerformance {
  operator_id: number;
  username: string;
  assigned: number;
  in_progress: number;
  completed: number;
  total_quantity: number;
}
