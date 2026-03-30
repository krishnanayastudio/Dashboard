import { X, Download, MessageSquare, CheckSquare, UserPlus, AtSign, Pencil, Palette, Image, Paperclip, Shield, ShieldOff, Edit3, Plus, Trash2, CheckCircle2, RotateCcw, ThumbsUp, ThumbsDown, Lock, AlertCircle, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import type { Project, ActivityEntry, ActivityAction } from '../types';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  project: Project;
  activity: ActivityEntry[];
  onClose: () => void;
}

type Tab = 'progress' | 'per-person';

const activityActionConfig: Record<ActivityAction, { icon: React.ReactNode; color: string; bg: string }> = {
  gate_added:        { icon: <Shield size={14} />,        color: 'text-purple-600',  bg: 'bg-purple-50' },
  gate_removed:      { icon: <ShieldOff size={14} />,     color: 'text-red-600',     bg: 'bg-red-50' },
  gate_renamed:      { icon: <Edit3 size={14} />,         color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  criterion_added:   { icon: <Plus size={14} />,          color: 'text-teal-600',    bg: 'bg-teal-50' },
  criterion_removed: { icon: <Trash2 size={14} />,        color: 'text-red-600',     bg: 'bg-red-50' },
  criterion_checked: { icon: <CheckCircle2 size={14} />,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
  criterion_revoked: { icon: <RotateCcw size={14} />,     color: 'text-amber-600',   bg: 'bg-amber-50' },
  gate_go:           { icon: <ThumbsUp size={14} />,      color: 'text-emerald-600', bg: 'bg-emerald-50' },
  gate_no_go:        { icon: <ThumbsDown size={14} />,    color: 'text-red-600',     bg: 'bg-red-50' },
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

// ─── Mock data for engagement & contributions ───

const engagementData = [
  { label: 'Comments', count: 19, icon: <MessageSquare size={16} />, color: '#4F00C1', iconBg: 'bg-purple-50' },
  { label: 'Approvals', count: 12, icon: <CheckSquare size={16} />, color: '#10b981', iconBg: 'bg-emerald-50' },
  { label: 'Assignments', count: 9, icon: <UserPlus size={16} />, color: '#6366f1', iconBg: 'bg-indigo-50' },
  { label: 'Mentions', count: 7, icon: <AtSign size={16} />, color: '#3b82f6', iconBg: 'bg-blue-50' },
  { label: 'Renames', count: 11, icon: <Pencil size={16} />, color: '#8b5cf6', iconBg: 'bg-violet-50' },
  { label: 'Color changed', count: 6, icon: <Palette size={16} />, color: '#ef4444', iconBg: 'bg-red-50' },
  { label: 'Thumbnails', count: 5, icon: <Image size={16} />, color: '#f97316', iconBg: 'bg-orange-50' },
  { label: 'Assets added', count: 8, icon: <Paperclip size={16} />, color: '#14b8a6', iconBg: 'bg-teal-50' },
];

const teamData = [
  { name: 'Alex', role: 'Designer', avatarBg: 'bg-purple-100 text-purple-700', blocksAdded: 12, assetsAdded: 8, commentsAdded: 7, blocksApproved: 4, blocksAssigned: 9 },
  { name: 'Ben', role: 'Reviewer', avatarBg: 'bg-orange-100 text-orange-700', blocksAdded: 5, assetsAdded: 3, commentsAdded: 11, blocksApproved: 10, blocksAssigned: 6 },
  { name: 'Cara', role: 'Designer', avatarBg: 'bg-emerald-100 text-emerald-700', blocksAdded: 8, assetsAdded: 6, commentsAdded: 4, blocksApproved: 2, blocksAssigned: 7 },
  { name: 'Dana', role: 'Designer', avatarBg: 'bg-blue-100 text-blue-700', blocksAdded: 3, assetsAdded: 2, commentsAdded: 5, blocksApproved: 1, blocksAssigned: 4 },
];

const maxEngagement = Math.max(...engagementData.map(e => e.count));

// ─── Animation variants ───

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
};

// ─── Animated Counter Hook ───

function useAnimatedCounter(target: number, duration = 800) {
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

function DonutChart({ segments, size = 120, strokeWidth = 16 }: {
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
          fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const dashLength = pct * circumference;
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
              transition={{ duration: 1, delay: i * 0.15, ease: [0.34, 1.56, 0.64, 1] }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-grey-900">{total}</span>
        <span className="text-[10px] text-grey-400 uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
}


// ─── Main Dashboard ───

export function Dashboard({ project, activity, onClose }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('progress');

  // Derive stats
  const allBlocks = project.items.flatMap(it => {
    if (it.kind === 'block') return [it.block];
    if (it.kind === 'group') return it.group.blocks;
    return [];
  });
  const totalBlocks = allBlocks.length;
  const completedBlocks = allBlocks.filter(b => b.approval?.status === 'approved').length;
  const completionRate = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
  const pendingApprovals = allBlocks.filter(b => b.approval?.status === 'needs_approval').length;

  const gates = project.items.filter(it => it.kind === 'gate').map(it => it.kind === 'gate' ? it.gate : null!);
  const passedGates = gates.filter(g => g.status === 'passed').length;
  const activeGates = gates.filter(g => g.status === 'active').length;
  const lockedGates = gates.filter(g => g.status === 'locked').length;
  const blockedGates = gates.filter(g => g.status === 'blocked').length;

  const pipelineStages = [
    { label: 'TO DO', count: lockedGates, color: '#9ca3af', avgWait: '1.2d' },
    { label: 'IN PROGRESS', count: activeGates, color: '#f97316', avgWait: '3.4d' },
    { label: 'ON HOLD', count: blockedGates || 3, color: '#3b82f6', avgWait: '2.1d' },
    { label: 'COMPLETED', count: passedGates, color: '#4F00C1', avgWait: '6.2d', isTotal: true },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'progress', label: 'Project progress' },
    { key: 'per-person', label: 'Per person' },
  ];

  // Gate activity data
  const sortedActivity = [...activity].reverse();
  const gateItems = project.items
    .filter((it): it is { kind: 'gate'; gate: import('../types').Gate } => it.kind === 'gate')
    .map(it => it.gate);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="w-[780px] max-w-[90vw] max-h-[calc(100vh-48px)] bg-white border border-grey-080 rounded-2xl flex flex-col shrink-0 shadow-xl shadow-black/8 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-grey-080">
        <div className="flex items-start justify-between mb-1">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold text-grey-900"
            >
              Project Dashboard
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-grey-400 mt-0.5"
            >
              {project.name} &middot; Last 30 days
            </motion.p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-9 px-4 border border-grey-200 rounded-lg text-sm text-grey-600 hover:bg-grey-050 transition-colors"
            >
              Last 30 days
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-9 px-4 bg-primary-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-primary-500/90 transition-colors"
            >
              <Download size={14} />
              Export
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-grey-050 transition-colors ml-1"
            >
              <X size={18} className="text-grey-500" />
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-3">
          {tabs.map(tab => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-grey-500 hover:bg-grey-050'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-grey-900 rounded-lg"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-grey-050/40">
        <AnimatePresence mode="wait">

          {/* ─── Project Progress (merged) ─── */}
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-3">
                <KpiCard
                  label="TOTAL BLOCKS"
                  value={totalBlocks}
                  sub="across all columns"
                  color="#4F00C1"
                  icon={<Activity size={16} />}
                />
                <KpiCard
                  label="COMPLETED"
                  value={completedBlocks}
                  sub={`${completionRate}% completion`}
                  color="#10b981"
                  icon={<CheckCircle2 size={16} />}
                  pct={completionRate}
                />
                <KpiCard
                  label="APPROVED"
                  value={completedBlocks}
                  sub="blocks approved"
                  color="#f59e0b"
                  icon={<CheckSquare size={16} />}
                />
                <KpiCard
                  label="APPROVAL PENDING"
                  value={pendingApprovals}
                  sub="awaiting review"
                  color="#ef4444"
                  icon={<AlertCircle size={16} />}
                />
              </div>

              {/* Gate Timeline Stepper */}
              <motion.div variants={cardVariants}>
                <GateTimeline gates={gateItems} />
              </motion.div>

              {/* Pipeline Donut + Activity Timeline side by side */}
              <div className="grid grid-cols-5 gap-3">
                {/* Pipeline Status — compact */}
                <motion.div
                  variants={cardVariants}
                  className="col-span-2 bg-white border border-grey-100 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-grey-700">Pipeline Status</h3>
                    <span className="text-[11px] text-grey-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <DonutChart
                      segments={pipelineStages.map(s => ({
                        value: s.count,
                        color: s.color,
                        label: s.label,
                      }))}
                    />
                    <div className="w-full space-y-2.5">
                      {pipelineStages.map((stage, i) => (
                        <motion.div
                          key={stage.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.08 }}
                          className="flex items-center gap-2.5"
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: stage.color }}
                          />
                          <span className="text-xs text-grey-500 flex-1">{stage.label}</span>
                          <AnimatedNumber value={stage.count} className="text-sm font-bold text-grey-900 tabular-nums" />
                          <span className="text-[10px] text-grey-300 w-10 text-right">
                            {stage.isTotal ? stage.avgWait : stage.avgWait}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Activity Timeline — compact */}
                <motion.div
                  variants={cardVariants}
                  className="col-span-3 bg-white border border-grey-100 rounded-xl p-4 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-grey-700">Recent Activity</h3>
                    <span className="text-[11px] text-grey-400">{sortedActivity.length} events</span>
                  </div>

                  {sortedActivity.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-grey-300 text-sm">
                      No activity yet
                    </div>
                  ) : (
                    <div className="relative flex-1 overflow-y-auto max-h-[280px] scrollbar-hide">
                      <div className="absolute left-[13px] top-3 bottom-3 w-px bg-grey-200" />
                      <div className="space-y-0.5">
                        {sortedActivity.map((entry, i) => {
                          const cfg = activityActionConfig[entry.action];
                          return (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + i * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
                              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.6)' }}
                              className="relative flex gap-3 py-2 px-1 rounded-lg transition-colors"
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.25 + i * 0.04, type: 'spring', stiffness: 500, damping: 25 }}
                                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${cfg.bg}`}
                              >
                                <span className={cfg.color}>{cfg.icon}</span>
                              </motion.div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-semibold text-grey-700">{entry.actor}</span>
                                  <span className="text-[11px] text-grey-300">{entry.timestamp}</span>
                                </div>
                                <p className={`text-xs font-medium mt-0.5 ${cfg.color}`}>
                                  {activityActionLabels[entry.action]}
                                </p>
                                {entry.detail && (
                                  <p className="text-xs text-grey-500 mt-0.5">{entry.detail}</p>
                                )}
                                {entry.gateName && (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.35 + i * 0.04 }}
                                    className="inline-block mt-1 text-[10px] text-primary-500 bg-primary-100 px-1.5 py-0.5 rounded font-medium"
                                  >
                                    {entry.gateName}
                                  </motion.span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Bottom row: Engagement + Team */}
              <div className="grid grid-cols-2 gap-3">
                {/* Block-level engagement */}
                <motion.div variants={cardVariants} className="bg-white border border-grey-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-grey-700">Block-level engagement</h3>
                    <span className="text-[11px] text-grey-400">all events</span>
                  </div>
                  <div className="space-y-2.5">
                    {engagementData.map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="group flex items-center gap-3"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg} text-grey-500 group-hover:scale-110 transition-transform`}>
                          {item.icon}
                        </div>
                        <span className="text-sm text-grey-700 flex-1 min-w-0">{item.label}</span>
                        <div className="w-28 h-2 bg-grey-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full origin-left"
                            style={{ backgroundColor: item.color, width: `${(item.count / maxEngagement) * 100}%` }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            whileHover={{ scaleY: 1.5 }}
                            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.5 + i * 0.06 }}
                          />
                        </div>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + i * 0.05 }}
                          className="text-sm font-semibold text-grey-600 w-6 text-right tabular-nums"
                        >
                          {item.count}
                        </motion.span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Team contributions */}
                <motion.div variants={cardVariants} className="bg-white border border-grey-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-grey-700">Team contributions</h3>
                    <span className="text-[11px] text-grey-400">by total actions</span>
                  </div>
                  <div className="space-y-3.5">
                    {teamData.map((member, i) => {
                      const total = member.blocksAdded + member.assetsAdded + member.commentsAdded + member.blocksApproved + member.blocksAssigned;
                      const segments = [
                        { value: member.blocksAdded, color: '#4F00C1' },
                        { value: member.assetsAdded, color: '#14b8a6' },
                        { value: member.commentsAdded, color: '#3b82f6' },
                        { value: member.blocksApproved, color: '#f59e0b' },
                        { value: member.blocksAssigned, color: '#9ca3af' },
                      ];
                      return (
                        <motion.div
                          key={member.name}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.08 }}
                          whileHover={{ x: 2 }}
                          className="group flex items-center gap-3"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${member.avatarBg} group-hover:scale-110 transition-transform shrink-0`}>
                            {member.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-grey-700">{member.name}</div>
                            <div className="text-xs text-grey-400">{member.role}</div>
                            {/* Stacked bar */}
                            <div className="flex h-1.5 mt-1.5 rounded-full overflow-hidden gap-px">
                              {segments.map((seg, si) => (
                                <motion.div
                                  key={si}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: seg.color, flex: seg.value }}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ delay: 0.6 + i * 0.08 + si * 0.05, duration: 0.4 }}
                                />
                              ))}
                            </div>
                          </div>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 + i * 0.08 }}
                            className="text-lg font-bold text-grey-700 tabular-nums"
                          >
                            {total}
                          </motion.span>
                        </motion.div>
                      );
                    })}
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-grey-100">
                    {[
                      { label: 'Blocks', color: '#4F00C1' },
                      { label: 'Assets', color: '#14b8a6' },
                      { label: 'Comments', color: '#3b82f6' },
                      { label: 'Approvals', color: '#f59e0b' },
                      { label: 'Assigned', color: '#9ca3af' },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                        <span className="text-[10px] text-grey-400">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ─── Per Person Tab ─── */}
          {activeTab === 'per-person' && (
            <motion.div
              key="per-person"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {teamData.map((member, mi) => {
                const stats = [
                  { label: 'Blocks added', value: member.blocksAdded, icon: <Plus size={14} />, color: '#4F00C1', bg: 'bg-purple-50' },
                  { label: 'Assets added', value: member.assetsAdded, icon: <Paperclip size={14} />, color: '#14b8a6', bg: 'bg-teal-50' },
                  { label: 'Comments', value: member.commentsAdded, icon: <MessageSquare size={14} />, color: '#3b82f6', bg: 'bg-blue-50' },
                  { label: 'Approved', value: member.blocksApproved, icon: <CheckSquare size={14} />, color: '#f59e0b', bg: 'bg-amber-50' },
                  { label: 'Assigned', value: member.blocksAssigned, icon: <UserPlus size={14} />, color: '#6b7280', bg: 'bg-grey-050' },
                ];
                const total = stats.reduce((s, x) => s + x.value, 0);
                return (
                  <motion.div
                    key={member.name}
                    variants={cardVariants}
                    whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.08)' }}
                    className="bg-white border border-grey-100 rounded-xl p-4 transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 + mi * 0.08 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${member.avatarBg}`}
                      >
                        {member.name[0]}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-grey-700">{member.name}</div>
                        <div className="text-xs text-grey-400">{member.role} &middot; {total} total actions</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      {stats.map((stat, si) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + mi * 0.08 + si * 0.06 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg bg-grey-050/50 cursor-default"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg}`}>
                            <span style={{ color: stat.color }}>{stat.icon}</span>
                          </div>
                          <AnimatedNumber
                            value={stat.value}
                            className="text-xl font-bold text-grey-900"
                          />
                          <span className="text-[10px] text-grey-400 text-center leading-tight">{stat.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
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
  passed: <CheckCircle2 size={14} className="text-emerald-500" />,
  active: <Shield size={14} className="text-amber-500" />,
  blocked: <AlertCircle size={14} className="text-red-500" />,
  locked: <Lock size={12} className="text-grey-300" />,
};
const gateStatusTextColor: Record<string, string> = {
  passed: 'text-emerald-700', active: 'text-amber-700', blocked: 'text-red-700', locked: 'text-grey-300',
};
const gateStatusBgColor: Record<string, string> = {
  passed: 'bg-emerald-50', active: 'bg-amber-50', blocked: 'bg-red-50', locked: 'bg-grey-050',
};
const gateLineColor: Record<string, string> = {
  passed: 'bg-emerald-300', active: 'bg-amber-300', blocked: 'bg-red-300', locked: 'bg-grey-200',
};

function GateTimeline({ gates }: { gates: import('../types').Gate[] }) {
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
    <div className="bg-white border border-grey-100 rounded-xl p-4 relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-grey-200 shadow-sm flex items-center justify-center hover:bg-grey-050 transition-colors"
        >
          <ChevronLeft size={14} className="text-grey-600" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-grey-200 shadow-sm flex items-center justify-center hover:bg-grey-050 transition-colors"
        >
          <ChevronRight size={14} className="text-grey-600" />
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
            <motion.div
              key={gate.id}
              className="flex items-center shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 25 }}
            >
              {i > 0 && (
                <motion.div
                  className={`w-8 h-[2px] ${gateLineColor[status]}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.08 + 0.05 }}
                />
              )}
              <motion.div
                whileHover={{ scale: 1.05, y: -1 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${gateStatusBgColor[status]}`}
              >
                {gateStatusIcon[status]}
                <span className={`text-xs font-semibold whitespace-nowrap ${gateStatusTextColor[status]}`}>
                  {gate.name}
                </span>
                {status === 'active' && gate.criteria.length > 0 && (
                  <span className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {gate.criteria.filter(c => c.completed).length}/{gate.criteria.length}
                  </span>
                )}
              </motion.div>
            </motion.div>
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
  valueSuffix,
  sub,
  color,
  icon,
  pct,
}: {
  label: string;
  value: number | string;
  valueSuffix?: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
  pct?: number;
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value as string);
  const displayValue = useAnimatedCounter(Math.round(numericValue * 10));
  const isDecimal = typeof value === 'number' && !Number.isInteger(value);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.08)' }}
      className="bg-white border border-grey-100 rounded-xl p-3.5 relative overflow-hidden group cursor-default"
    >
      {/* Gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl opacity-80"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
      />
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-medium text-grey-400 tracking-wide uppercase">{label}</div>
        <motion.div
          whileHover={{ rotate: 15 }}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </motion.div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold" style={{ color }}>
            {isDecimal ? (displayValue / 10).toFixed(1) : displayValue / 10}
            {valueSuffix && <span className="text-lg font-semibold">{valueSuffix}</span>}
          </div>
          <div className="text-xs text-grey-400 mt-0.5">{sub}</div>
        </div>
      </div>
      {pct !== undefined && (
        <div className="w-full h-1.5 bg-grey-100 rounded-full mt-3 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
      )}
    </motion.div>
  );
}
