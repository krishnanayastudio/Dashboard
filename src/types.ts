export type ActivityAction =
  | 'gate_added'
  | 'gate_removed'
  | 'gate_renamed'
  | 'criterion_added'
  | 'criterion_removed'
  | 'criterion_checked'
  | 'criterion_revoked'
  | 'gate_go'
  | 'gate_no_go';

export interface ActivityEntry {
  id: string;
  action: ActivityAction;
  actor: string;
  timestamp: string;
  gateName?: string;
  detail?: string;
}
