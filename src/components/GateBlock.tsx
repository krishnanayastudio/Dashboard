import { Shield, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import type { Gate } from '../types';

interface GateBlockProps {
  gate: Gate;
  status: 'locked' | 'active' | 'passed' | 'blocked';
  isActive: boolean;
  onClick: () => void;
}

const statusStyles = {
  passed: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-300',
    icon: <CheckCircle2 size={28} className="text-green-500" />,
    text: 'text-green-500',
    sub: 'text-green-500',
  },
  active: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    border: 'border-orange-300',
    icon: <Shield size={28} className="text-orange-300" />,
    text: 'text-gray-800',
    sub: 'text-orange-300',
  },
  blocked: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    border: 'border-red-200',
    icon: <AlertCircle size={28} className="text-red-500" />,
    text: 'text-red-700',
    sub: 'text-red-500',
  },
  locked: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-150',
    border: 'border-gray-300',
    icon: <Lock size={28} className="text-gray-400" />,
    text: 'text-gray-600',
    sub: 'text-gray-400',
  },
};

export function GateBlock({ gate, status, isActive, onClick }: GateBlockProps) {
  const style = statusStyles[status];
  const completedCount = gate.criteria.filter(c => c.completed).length;
  const totalCount = gate.criteria.length;

  return (
    <button
      onClick={onClick}
      className={`relative w-[288px] h-[230px] rounded-3xl border-2 overflow-hidden shrink-0 flex flex-col items-center justify-center gap-3 transition-all text-center
        ${style.bg} ${style.border}
        ${isActive ? 'ring-2 ring-purple-700/30 shadow-lg scale-[1.02]' : 'hover:shadow-lg'}
        ${status === 'locked' ? 'opacity-60 cursor-default' : 'cursor-pointer'}
      `}
    >
      {/* Large icon */}
      <div className="opacity-80">{style.icon}</div>

      {/* Gate name */}
      <div className="px-4">
        <h3 className={`text-sm font-bold ${style.text}`}>{gate.name}</h3>
        <p className={`text-xs mt-1 ${style.sub}`}>
          {status === 'passed' && gate.decidedAt ? `Passed ${gate.decidedAt}` : ''}
          {status === 'active' && totalCount > 0 ? `${completedCount} of ${totalCount} criteria met` : ''}
          {status === 'active' && totalCount === 0 ? 'No criteria yet' : ''}
          {status === 'blocked' ? 'Blocked' : ''}
          {status === 'locked' ? 'Locked' : ''}
        </p>
      </div>


      {/* Enforcement badge */}
      <span className={`absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full border
        ${gate.enforcement === 'hard'
          ? 'bg-white/60 border-current ' + style.text
          : 'bg-white/60 border-current ' + style.sub
        }
      `}>
        {gate.enforcement === 'hard' ? 'Hard' : 'Soft'}
      </span>
    </button>
  );
}
