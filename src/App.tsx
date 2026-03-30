import { useState } from 'react';
import { ActivityPanel } from './components/ActivityPanel';
import type { ActivityEntry } from './types';

const sampleEntries: ActivityEntry[] = [
  {
    id: '1',
    action: 'gate_added',
    actor: 'Krishna',
    timestamp: '2 min ago',
    gateName: 'Design Review',
    detail: 'Added new gate to the journey',
  },
  {
    id: '2',
    action: 'criterion_added',
    actor: 'Krishna',
    timestamp: '5 min ago',
    gateName: 'Design Review',
    detail: 'UI mockups approved by stakeholders',
  },
  {
    id: '3',
    action: 'criterion_checked',
    actor: 'Sarah',
    timestamp: '10 min ago',
    gateName: 'Design Review',
    detail: 'Accessibility audit passed',
  },
  {
    id: '4',
    action: 'gate_go',
    actor: 'Mike',
    timestamp: '15 min ago',
    gateName: 'Technical Feasibility',
    detail: 'All criteria met — gate passed',
  },
  {
    id: '5',
    action: 'criterion_revoked',
    actor: 'Krishna',
    timestamp: '20 min ago',
    gateName: 'Technical Feasibility',
    detail: 'Performance benchmark needs re-run',
  },
  {
    id: '6',
    action: 'gate_renamed',
    actor: 'Sarah',
    timestamp: '30 min ago',
    gateName: 'Technical Feasibility',
    detail: 'Renamed from "Tech Check"',
  },
  {
    id: '7',
    action: 'gate_no_go',
    actor: 'Mike',
    timestamp: '1 hr ago',
    gateName: 'Budget Approval',
    detail: 'Missing cost estimates',
  },
];

export default function App() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      {open ? (
        <div className="h-[600px]">
          <ActivityPanel entries={sampleEntries} onClose={() => setOpen(false)} />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Open Activity Panel
        </button>
      )}
    </div>
  );
}
