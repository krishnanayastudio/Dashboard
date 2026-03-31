import { X, Shield, ShieldOff, Edit3, Plus, Trash2, CheckCircle2, RotateCcw, ThumbsUp, ThumbsDown, Lock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project, ActivityEntry, ActivityAction } from '../types';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DashboardProps {
  project: Project;
  activity: ActivityEntry[];
  onClose: () => void;
}

const activityActionConfig: Record<ActivityAction, { icon: React.ReactNode; color: string; bg: string }> = {
  gate_added:        { icon: <Shield size={13} />,        color: 'text-purple-700',  bg: 'bg-purple-100' },
  gate_removed:      { icon: <ShieldOff size={13} />,     color: 'text-red-500',     bg: 'bg-red-50' },
  gate_renamed:      { icon: <Edit3 size={13} />,         color: 'text-purple-700',  bg: 'bg-purple-100' },
  criterion_added:   { icon: <Plus size={13} />,          color: 'text-green-500',   bg: 'bg-green-50' },
  criterion_removed: { icon: <Trash2 size={13} />,        color: 'text-red-500',     bg: 'bg-red-50' },
  criterion_checked: { icon: <CheckCircle2 size={13} />,  color: 'text-green-500',   bg: 'bg-green-50' },
  criterion_revoked: { icon: <RotateCcw size={13} />,     color: 'text-orange-300',  bg: 'bg-orange-50' },
  gate_go:           { icon: <ThumbsUp size={13} />,      color: 'text-green-500',   bg: 'bg-green-50' },
  gate_no_go:        { icon: <ThumbsDown size={13} />,    color: 'text-red-500',     bg: 'bg-red-50' },
};

const activityActionLabels: Record<ActivityAction, string> = {
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

// ─── Mock data for per-person metrics ───

const teamData = [
  { name: 'Alex', email: 'alex@company.com', role: 'Design Lead', avatarGradient: 'from-purple-500 to-purple-700', blocksCreated: 12, assetsAdded: 8, blocksApproved: 4, blocksAssigned: 9, todo: 3, completed: 7, onHold: 1, inProgress: 4 },
  { name: 'Ben', email: 'ben@company.com', role: 'Engineer', avatarGradient: 'from-orange-300 to-orange-300', blocksCreated: 5, assetsAdded: 3, blocksApproved: 10, blocksAssigned: 6, todo: 2, completed: 9, onHold: 0, inProgress: 3 },
  { name: 'Cara', email: 'cara@company.com', role: 'Product Manager', avatarGradient: 'from-green-300 to-green-500', blocksCreated: 8, assetsAdded: 6, blocksApproved: 2, blocksAssigned: 7, todo: 4, completed: 5, onHold: 2, inProgress: 2 },
  { name: 'Dana', email: 'dana@company.com', role: 'QA Lead', avatarGradient: 'from-cyan-200 to-cyan-500', blocksCreated: 3, assetsAdded: 2, blocksApproved: 1, blocksAssigned: 4, todo: 1, completed: 3, onHold: 0, inProgress: 1 },
];

// ─── Animation variants ───

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─── Animated Counter Hook ───

function useAnimatedCounter(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// ─── Donut Chart ───

function DonutChart({ segments, size = 140, strokeWidth = 18 }: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let accumulated = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#F3F0FF" strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const gap = 0.012 * circumference;
          const dashLength = Math.max(pct * circumference - gap, 0);
          const dashOffset = -(accumulated / total) * circumference;
          accumulated += seg.value;
          return (
            <motion.circle
              key={i}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${dashLength} ${circumference - dashLength}` }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: 'easeOut' }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 tracking-tight">{total}</span>
        <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-semibold mt-0.5">Total</span>
      </div>
    </div>
  );
}


// ─── Main Dashboard ───

export function Dashboard({ project, activity, onClose }: DashboardProps) {
  // Derive stats
  const allBlocks = project.items.flatMap(it => {
    if (it.kind === 'block') return [it.block];
    if (it.kind === 'group') return it.group.blocks;
    return [];
  });
  const totalBlocks = allBlocks.length;

  // Workflow status (mutually exclusive — sums to totalBlocks)
  const completedBlocks = allBlocks.filter(b => b.approval?.status === 'approved').length;
  const onHoldBlocks = allBlocks.filter(b => b.approval?.status === 'blocked').length || 1;
  const inProgressBlocks = allBlocks.filter(b => b.approval?.status === 'needs_approval').length;
  const todoBlocks = Math.max(totalBlocks - completedBlocks - onHoldBlocks - inProgressBlocks, 0);

  // Approval overlay (can overlap with workflow status)
  const approved = allBlocks.filter(b => b.approval?.status === 'approved').length;
  const approvalPending = allBlocks.filter(b => b.approval?.status === 'needs_approval').length;

  const gates = project.items.filter(it => it.kind === 'gate').map(it => it.kind === 'gate' ? it.gate : null!);

  // Donut shows mutually exclusive workflow statuses
  const pipelineStages = [
    { label: 'COMPLETED', count: completedBlocks, color: '#4F00C1' },
    { label: 'IN PROGRESS', count: inProgressBlocks, color: '#F9DB60' },
    { label: 'ON HOLD', count: onHoldBlocks, color: '#E34033' },
    { label: 'TO DO', count: todoBlocks, color: '#FFA35E' },
  ];

  // Gate activity data
  const sortedActivity = [...activity].reverse();
  const gateItems = project.items
    .filter((it): it is { kind: 'gate'; gate: import('../types').Gate } => it.kind === 'gate')
    .map(it => it.gate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-[780px] max-w-[90vw] max-h-[calc(100vh-48px)] bg-white border border-gray-100 rounded-3xl flex flex-col shrink-0 shadow-xl overflow-hidden"
    >
      {/* Header — white, just title + project name */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Project Overview
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {project.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* ─── Project Status ─── */}
          <motion.div variants={cardVariants} className="bg-white border border-gray-100 rounded-3xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-5">Project Status</h3>

            {/* Donut + KPI side by side */}
            <div className="flex items-center gap-6">
              <DonutChart
                segments={pipelineStages.map(s => ({
                  value: s.count,
                  color: s.color,
                  label: s.label,
                }))}
                size={120}
                strokeWidth={14}
              />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <KpiCard label="Completed" value={completedBlocks} color="#4F00C1" />
                <KpiCard label="In Progress" value={inProgressBlocks} color="#F9DB60" />
                <KpiCard label="On Hold" value={onHoldBlocks} color="#E34033" />
                <KpiCard label="To Do" value={todoBlocks} color="#FFA35E" />
              </div>
            </div>
          </motion.div>

          {/* ─── Approvals ─── */}
          <motion.div variants={cardVariants} className="bg-white border border-gray-100 rounded-3xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Approvals</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <KpiCard label="Approved" value={approved} color="#696969" />
              <KpiCard label="Approval Pending" value={approvalPending} color="#FFA35E" />
            </div>
          </motion.div>

          {/* ─── Toll Gates ─── */}
          <motion.div variants={cardVariants} className="bg-white border border-gray-100 rounded-3xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Toll Gates</h3>
              <span className="text-[11px] text-gray-400">{sortedActivity.length} events</span>
            </div>

            {/* Gate Timeline */}
            <div className="mb-4">
              <GateTimeline gates={gateItems} embedded />
            </div>

            {/* Activity Feed */}
            <div className="border-t border-gray-100 pt-4">
              <div className="text-[10px] font-semibold text-gray-400 tracking-[0.12em] uppercase mb-3">Activity</div>
              {sortedActivity.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-4">
                  No activity yet
                </div>
              ) : (
                <div className="relative flex-1 overflow-y-auto max-h-[220px] scrollbar-hide">
                  <div className="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-gray-200 via-gray-100 to-transparent" />
                  <div className="space-y-0.5">
                    {sortedActivity.map((entry, i) => {
                      const cfg = activityActionConfig[entry.action];
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 + i * 0.025, duration: 0.25 }}
                          className="relative flex gap-3 py-2 px-1.5 rounded-lg hover:bg-gray-25 transition-colors"
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${cfg.bg} ring-2 ring-white`}>
                            <span className={cfg.color}>{cfg.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-gray-900">{entry.actor}</span>
                              <span className="text-[11px] text-gray-400">{entry.timestamp}</span>
                            </div>
                            <p className="text-xs font-medium mt-0.5 text-gray-600">
                              {activityActionLabels[entry.action]}
                            </p>
                            {entry.detail && (
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Checked "{entry.detail}"</p>
                            )}
                            {entry.gateName && (
                              <span className="inline-block mt-1.5 text-[10px] text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md font-semibold">
                                {entry.gateName}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* ─── Per Person Section ─── */}
          <motion.div variants={cardVariants}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Per Person</h3>
            <div className="space-y-3">
              {teamData.map((member, mi) => {
                const stats = [
                  { label: 'Blocks created', value: member.blocksCreated },
                  { label: 'Assets added', value: member.assetsAdded },
                  { label: 'Approved', value: member.blocksApproved },
                  { label: 'Assigned', value: member.blocksAssigned },
                  { label: 'To-do', value: member.todo },
                  { label: 'Completed', value: member.completed },
                  { label: 'On hold', value: member.onHold },
                  { label: 'In progress', value: member.inProgress },
                ];

                return (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + mi * 0.05, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="bg-white border border-gray-100 rounded-3xl p-4"
                  >
                    {/* Person header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${member.avatarGradient} flex items-center justify-center text-sm font-bold text-white`}>
                        {member.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{member.email}</div>
                      </div>
                    </div>

                    {/* Stats grid — plain white boxes, gray-100 border, no icons, no colored strokes */}
                    <div className="grid grid-cols-4 gap-2">
                      {stats.map((stat) => (
                        <div
                          key={stat.label}
                          className="flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-3xl border border-gray-100"
                        >
                          <AnimatedNumber
                            value={stat.value}
                            className="text-lg font-bold text-gray-900 leading-none"
                          />
                          <span className="text-[10px] text-gray-500 text-center leading-tight font-medium">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Animated Number ───

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const display = useAnimatedCounter(value);
  return <span className={className}>{display}</span>;
}

// ─── Gate Timeline Stepper ───

const gateStatusIcon: Record<string, React.ReactNode> = {
  passed: <CheckCircle2 size={14} className="text-purple-600" />,
  active: <Shield size={14} className="text-orange-300" />,
  blocked: <AlertCircle size={14} className="text-red-500" />,
  locked: <Lock size={12} className="text-gray-400" />,
};
const gateStatusTextColor: Record<string, string> = {
  passed: 'text-purple-700', active: 'text-gray-800', blocked: 'text-red-700', locked: 'text-gray-400',
};
const gateStatusBgColor: Record<string, string> = {
  passed: 'bg-purple-50 border-purple-200', active: 'bg-orange-50 border-orange-100', blocked: 'bg-red-50 border-red-100', locked: 'bg-gray-50 border-gray-200',
};
const gateLineColor: Record<string, string> = {
  passed: 'bg-purple-300', active: 'bg-orange-300', blocked: 'bg-red-200', locked: 'bg-gray-250',
};

function GateTimeline({ gates, embedded }: { gates: import('../types').Gate[]; embedded?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => observer.disconnect();
  }, [gates.length]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' });
  };

  return (
    <div className={embedded ? "relative" : "bg-white border border-gray-100 rounded-3xl p-4 relative"}>
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all"
        >
          <ChevronLeft size={14} className="text-gray-600" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all"
        >
          <ChevronRight size={14} className="text-gray-600" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center overflow-x-auto scrollbar-hide"
      >
        {gates.map((gate, i) => {
          const status = gate.status;
          return (
            <div
              key={gate.id}
              className="flex items-center shrink-0"
            >
              {i > 0 && (
                <div className={`w-8 h-[2px] ${gateLineColor[status]} rounded-full`} />
              )}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${gateStatusBgColor[status]} transition-colors`}>
                {gateStatusIcon[status]}
                <span className={`text-xs font-semibold whitespace-nowrap ${gateStatusTextColor[status]}`}>
                  {gate.name}
                </span>
                {status === 'active' && gate.criteria.length > 0 && (
                  <span className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-orange-100 text-gray-800 border border-orange-100">
                    {gate.criteria.filter(c => c.completed).length}/{gate.criteria.length}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── KPI Card ───

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value as string);
  const displayValue = useAnimatedCounter(Math.round(numericValue * 10));
  const isDecimal = typeof value === 'number' && !Number.isInteger(value);

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white border border-gray-100 rounded-3xl px-3 py-2.5"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-medium text-gray-500 truncate">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-900 leading-none">
        {isDecimal ? (displayValue / 10).toFixed(1) : displayValue / 10}
      </div>
    </motion.div>
  );
}
