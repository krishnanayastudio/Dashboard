import { X, Plus, Trash2, Edit3, Shield, ShieldOff, CheckCircle2, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { ActivityEntry, ActivityAction } from '../types';

interface ActivityPanelProps {
  entries: ActivityEntry[];
  onClose: () => void;
}

const actionConfig: Record<ActivityAction, { icon: React.ReactNode; color: string; bg: string }> = {
  gate_added: { icon: <Shield size={14} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  gate_removed: { icon: <ShieldOff size={14} />, color: 'text-red-600', bg: 'bg-red-50' },
  gate_renamed: { icon: <Edit3 size={14} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  criterion_added: { icon: <Plus size={14} />, color: 'text-teal-600', bg: 'bg-teal-50' },
  criterion_removed: { icon: <Trash2 size={14} />, color: 'text-red-600', bg: 'bg-red-50' },
  criterion_checked: { icon: <CheckCircle2 size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  criterion_revoked: { icon: <RotateCcw size={14} />, color: 'text-amber-600', bg: 'bg-amber-50' },
  gate_go: { icon: <ThumbsUp size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  gate_no_go: { icon: <ThumbsDown size={14} />, color: 'text-red-600', bg: 'bg-red-50' },
};

const actionLabels: Record<ActivityAction, string> = {
  gate_added: 'Added gate',
  gate_removed: 'Removed gate',
  gate_renamed: 'Renamed gate',
  criterion_added: 'Added criterion',
  criterion_removed: 'Removed criterion',
  criterion_checked: 'Checked criterion',
  criterion_revoked: 'Revoked criterion',
  gate_go: 'Go — Passed gate',
  gate_no_go: 'No-Go — Blocked gate',
};

export function ActivityPanel({ entries, onClose }: ActivityPanelProps) {
  const sorted = [...entries].reverse();

  return (
    <div className="w-[380px] bg-white border border-grey-080 rounded-2xl flex flex-col h-full shrink-0 shadow-xl shadow-black/8 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-grey-080">
        <h2 className="text-base font-semibold text-grey-700">Activity</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-grey-050 transition-colors"
        >
          <X size={18} className="text-grey-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-grey-300 text-sm">
            No activity yet
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[29px] top-6 bottom-6 w-px bg-grey-080" />

            {sorted.map((entry) => {
              const cfg = actionConfig[entry.action];
              return (
                <div key={entry.id} className="relative flex gap-3 px-5 py-3 hover:bg-grey-050/50 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${cfg.bg}`}>
                    <span className={cfg.color}>{cfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-grey-700">{entry.actor}</span>
                      <span className="text-xs text-grey-300">{entry.timestamp}</span>
                    </div>
                    <p className={`text-xs font-medium mt-0.5 ${cfg.color}`}>
                      {actionLabels[entry.action]}
                    </p>
                    {entry.detail && (
                      <p className="text-xs text-grey-500 mt-0.5">{entry.detail}</p>
                    )}
                    {entry.gateName && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-primary-500 bg-primary-100 px-1.5 py-0.5 rounded">{entry.gateName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
