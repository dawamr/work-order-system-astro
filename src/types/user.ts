export interface Operator {
  id: number;
  username: string;
  role: 'operator';
}

export interface ProductionManager {
  id: number;
  username: string;
  role: 'production_manager';
}

export type User = Operator | ProductionManager;
