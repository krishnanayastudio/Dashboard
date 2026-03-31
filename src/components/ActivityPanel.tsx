import { useState } from 'react';
import { X, Plus, Trash2, Edit3, Shield, ShieldOff, CheckCircle2, RotateCcw, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import type { ActivityEntry, ActivityAction } from '../types';

interface ActivityPanelProps {
  entries: ActivityEntry[];
  onClose: () => void;
}

type ActivityFilter = 'all' | 'toll-gates' | 'approvals';

const actionConfig: Record<ActivityAction, { icon: React.ReactNode; color: string; bg: string; category: 'toll-gates' | 'approvals' }> = {
  gate_added:        { icon: <Shield size={14} />,        color: 'text-purple-600',  bg: 'bg-purple-50',  category: 'toll-gates' },
  gate_removed:      { icon: <ShieldOff size={14} />,     color: 'text-red-700',     bg: 'bg-red-50',     category: 'toll-gates' },
  gate_renamed:      { icon: <Edit3 size={14} />,         color: 'text-purple-700',  bg: 'bg-purple-50',  category: 'toll-gates' },
  criterion_added:   { icon: <Plus size={14} />,          color: 'text-cyan-500',    bg: 'bg-cyan-50',    category: 'toll-gates' },
  criterion_removed: { icon: <Trash2 size={14} />,        color: 'text-red-700',     bg: 'bg-red-50',     category: 'toll-gates' },
  criterion_checked: { icon: <CheckCircle2 size={14} />,  color: 'text-green-500', bg: 'bg-green-50', category: 'approvals' },
  criterion_revoked: { icon: <RotateCcw size={14} />,     color: 'text-orange-300',   bg: 'bg-orange-50',   category: 'approvals' },
  gate_go:           { icon: <ThumbsUp size={14} />,      color: 'text-green-500', bg: 'bg-green-50', category: 'approvals' },
  gate_no_go:        { icon: <ThumbsDown size={14} />,    color: 'text-red-700',     bg: 'bg-red-50',     category: 'approvals' },
};

const actionLabels: Record<ActivityAction, string> = {
  gate_added: 'Added gate',
  gate_removed: 'Removed gate',
  gate_renamed: 'Renamed gate',
  criterion_added: 'Added criterion',
  criterion_removed: 'Removed criterion',
  criterion_checked: 'Approved criterion',
  criterion_revoked: 'Revoked approval',
  gate_go: 'Go — Passed gate',
  gate_no_go: 'No-Go — Blocked gate',
};

const FILTER_TABS: { key: ActivityFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'toll-gates', label: 'Toll Gates' },
  { key: 'approvals', label: 'Approvals' },
];

export function ActivityPanel({ entries, onClose }: ActivityPanelProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const filtered = filter === 'all'
    ? entries
    : entries.filter(a => actionConfig[a.action].category === filter);

  const sorted = [...filtered].reverse();

  // Gate-level summary stats
  const gateStats = entries.reduce<Record<string, { approvals: number; decisions: number }>>((acc, a) => {
    const gate = a.gateName || 'Unknown';
    if (!acc[gate]) acc[gate] = { approvals: 0, decisions: 0 };
    if (a.action === 'criterion_checked') acc[gate].approvals++;
    if (a.action === 'gate_go' || a.action === 'gate_no_go') acc[gate].decisions++;
    return acc;
  }, {});

  // Counts for filter badges
  const tollGateCount = entries.filter(a => actionConfig[a.action].category === 'toll-gates').length;
  const approvalCount = entries.filter(a => actionConfig[a.action].category === 'approvals').length;
  const badgeCounts: Record<ActivityFilter, number> = {
    all: entries.length,
    'toll-gates': tollGateCount,
    approvals: approvalCount,
  };

  return (
    <div className="w-[400px] max-w-[90vw] max-h-[calc(100vh-48px)] bg-white border border-gray-100 rounded-2xl flex flex-col shrink-0 shadow-xl shadow-black/8 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-150 flex items-center justify-center">
              <Shield size={16} className="text-purple-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Activity</h2>
              <p className="text-[11px] text-gray-600">{entries.length} total events</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`h-7 px-3 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                filter === tab.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-px rounded-full ${
                filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-150 text-gray-600'
              }`}>
                {badgeCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Gate summary strip */}
      {Object.keys(gateStats).length > 0 && (
        <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1.5 mb-2">
            <Filter size={11} className="text-gray-600" />
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Per Gate</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {Object.entries(gateStats).map(([gate, stats]) => (
              <div key={gate} className="shrink-0 bg-white rounded-lg px-3 py-1.5 border border-gray-100 min-w-[110px]">
                <div className="text-[11px] font-semibold text-gray-900 truncate">{gate}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-green-500">{stats.approvals} approved</span>
                  {stats.decisions > 0 && (
                    <span className="text-[10px] text-purple-700">{stats.decisions} decision{stats.decisions !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity timeline */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
            No activity yet
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[29px] top-6 bottom-6 w-px bg-gray-100" />

            {sorted.map((entry) => {
              const cfg = actionConfig[entry.action];
              return (
                <div key={entry.id} className="relative flex gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${cfg.bg}`}>
                    <span className={cfg.color}>{cfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900">{entry.actor}</span>
                      <span className="text-[11px] text-gray-400">{entry.timestamp}</span>
                    </div>
                    <p className={`text-xs font-medium mt-0.5 ${cfg.color}`}>
                      {actionLabels[entry.action]}
                    </p>
                    {entry.detail && (
                      <p className="text-xs text-gray-700 mt-0.5">{entry.detail}</p>
                    )}
                    {entry.gateName && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-purple-700 bg-purple-150 px-1.5 py-0.5 rounded font-medium">{entry.gateName}</span>
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
