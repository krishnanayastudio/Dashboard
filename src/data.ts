import type { Project, ActivityEntry } from './types';

export const initialProject: Project = {
  name: 'Ceramic Grinder',
  items: [
    {
      kind: 'block',
      block: {
        id: 'b1', name: 'Market Research', type: 'doc', thumbnail: '',
        approval: { status: 'approved', assignees: ['Sarah K.', 'James L.'] },
      },
    },
    {
      kind: 'block',
      block: {
        id: 'b2', name: 'User Interviews', type: 'doc', thumbnail: '',
        approval: { status: 'approved', assignees: ['Sarah K.'] },
      },
    },
    {
      kind: 'gate',
      gate: {
        id: 'gate-1',
        name: 'Problem validation',
        description: 'Confirm the problem space is validated before ideation begins.',
        criteria: [
          { id: 'c1', label: 'User research completed', completed: true, approvedBy: 'Sarah K.', approvedAt: 'Mar 15' },
          { id: 'c2', label: 'Market analysis reviewed', completed: true, approvedBy: 'James L.', approvedAt: 'Mar 16' },
          { id: 'c3', label: 'Stakeholder sign-off', completed: true, approvedBy: 'Maria T.', approvedAt: 'Mar 18' },
        ],
        status: 'passed',
        decision: 'go',
        decidedBy: 'Maria T.',
        decidedAt: 'Mar 18, 2026',
        enforcement: 'hard',
      },
    },
    {
      kind: 'group',
      group: {
        id: 'g1',
        name: 'Cork concepts',
        blocks: [
          { id: 'b3', name: 'Cork sketches', type: 'sketch', thumbnail: '' },
          { id: 'b4', name: 'Sketches R2', type: 'sketch', thumbnail: '' },
        ],
      },
    },
    {
      kind: 'block',
      block: {
        id: 'b5', name: 'Pattern board', type: 'board', thumbnail: '',
        approval: { status: 'needs_approval', assignees: ['Alex M.', 'Priya S.', 'James L.', 'Maria T.', 'Sarah K.', 'Dev R.'], dueDate: 'Aug, 03' },
      },
    },
    {
      kind: 'block',
      block: { id: 'b6', name: 'Material board', type: 'board', thumbnail: '' },
    },
    {
      kind: 'gate',
      gate: {
        id: 'gate-2',
        name: 'Design review',
        description: 'Ensure design direction is viable before prototyping.',
        criteria: [
          { id: 'c4', label: 'Design direction approved by lead', completed: true, approvedBy: 'Alex M.', approvedAt: 'Mar 25' },
          { id: 'c5', label: 'Material feasibility confirmed', completed: true, approvedBy: 'Priya S.', approvedAt: 'Mar 26' },
          { id: 'c6', label: 'Cost estimate within budget', completed: false },
          { id: 'c7', label: 'Manufacturing review complete', completed: false },
        ],
        status: 'active',
        enforcement: 'hard',
      },
    },
    {
      kind: 'gate',
      gate: {
        id: 'gate-3',
        name: 'Prototype sign-off',
        description: 'Validate prototype before production tooling.',
        criteria: [
          { id: 'c8', label: 'Functional prototype tested', completed: false },
          { id: 'c9', label: 'User testing completed', completed: false },
          { id: 'c10', label: 'Engineering approval', completed: false },
          { id: 'c11', label: 'Quality standards met', completed: false },
        ],
        status: 'locked',
        enforcement: 'hard',
      },
    },
    {
      kind: 'gate',
      gate: {
        id: 'gate-4',
        name: 'Production release',
        description: 'Final approval before mass production.',
        criteria: [
          { id: 'c12', label: 'Tooling validated', completed: false },
          { id: 'c13', label: 'Compliance check passed', completed: false },
          { id: 'c14', label: 'Supply chain confirmed', completed: false },
        ],
        status: 'locked',
        enforcement: 'soft',
      },
    },
  ],
};

export const initialActivity: ActivityEntry[] = [
  { id: 'a1', action: 'gate_added', actor: 'Maria T.', timestamp: 'Mar 10', gateName: 'Problem validation', detail: 'Added gate with 3 criteria' },
  { id: 'a2', action: 'criterion_checked', actor: 'Sarah K.', timestamp: 'Mar 15', gateName: 'Problem validation', detail: 'Checked "User research completed"' },
  { id: 'a3', action: 'criterion_checked', actor: 'James L.', timestamp: 'Mar 16', gateName: 'Problem validation', detail: 'Checked "Market analysis reviewed"' },
  { id: 'a4', action: 'criterion_checked', actor: 'Maria T.', timestamp: 'Mar 18', gateName: 'Problem validation', detail: 'Checked "Stakeholder sign-off"' },
  { id: 'a5', action: 'gate_go', actor: 'Maria T.', timestamp: 'Mar 18', gateName: 'Problem validation', detail: 'Passed gate — Go decision' },
  { id: 'a6', action: 'gate_added', actor: 'Alex M.', timestamp: 'Mar 19', gateName: 'Design review', detail: 'Added gate with 4 criteria' },
  { id: 'a7', action: 'criterion_checked', actor: 'Alex M.', timestamp: 'Mar 25', gateName: 'Design review', detail: 'Checked "Design direction approved by lead"' },
  { id: 'a8', action: 'criterion_checked', actor: 'Priya S.', timestamp: 'Mar 26', gateName: 'Design review', detail: 'Checked "Material feasibility confirmed"' },
];
