export interface GateCriterion {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  requiredApprover?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Block {
  id: string;
  name: string;
  type: 'sketch' | 'board' | 'doc' | 'cad' | 'image';
  thumbnail: string;
  approval?: {
    status: 'needs_approval' | 'approved' | 'none';
    assignees: string[];
    dueDate?: string;
  };
}

export interface BlockGroup {
  id: string;
  name: string;
  blocks: Block[];
  collapsed?: boolean;
}

export type GateItem =
  | { kind: 'block'; block: Block }
  | { kind: 'group'; group: BlockGroup };

export type PhaseItem = GateItem;

export interface Gate {
  id: string;
  name: string;
  description: string;
  criteria: GateCriterion[];
  status: 'locked' | 'active' | 'passed' | 'blocked';
  decision?: 'go' | 'no-go';
  decidedBy?: string;
  decidedAt?: string;
  blockReason?: string;
  enforcement: 'hard' | 'soft';
  items?: GateItem[];
}

export type JourneyItem =
  | { kind: 'block'; block: Block }
  | { kind: 'group'; group: BlockGroup }
  | { kind: 'gate'; gate: Gate };

export interface Phase {
  id: string;
  name: string;
  status: 'locked' | 'active' | 'completed';
  items: PhaseItem[];
  gate?: Gate;
}

export interface WorkArea {
  id: string;
  name: string;
  items: PhaseItem[];
}

export interface Project {
  name: string;
  items: JourneyItem[];
}

// Get all gates from items in order
export function getGates(items: JourneyItem[]): Gate[] {
  return items.filter((it): it is { kind: 'gate'; gate: Gate } => it.kind === 'gate').map(it => it.gate);
}

// Derive gate status based on position among all gates
export function deriveGateStatus(gate: Gate, allGates: Gate[]): 'locked' | 'active' | 'passed' | 'blocked' {
  if (gate.status === 'passed' || gate.status === 'blocked') return gate.status;
  const idx = allGates.indexOf(gate);
  if (idx === 0) return 'active';
  const prev = allGates[idx - 1];
  if (prev.status === 'passed') return 'active';
  return 'locked';
}

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
