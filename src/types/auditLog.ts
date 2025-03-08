export interface AuditLog {
  id: number;
  user_id: number;
  user: {
    id: number;
    username: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
  action: 'update' | 'create' | 'delete' | 'custom';
  entity_id: number;
  entity_type: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  note: string;
  created_at: string;
}
