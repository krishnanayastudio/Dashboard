import { useState, useRef, useEffect } from 'react';
import { Shield, CheckCircle2, Lock, AlertCircle, Plus, Edit3, Trash2 } from 'lucide-react';
import type { JourneyItem } from '../types';

interface JourneyStepperProps {
  items: JourneyItem[];
  gateStatusMap: Map<string, 'locked' | 'active' | 'passed' | 'blocked'>;
  activeGateId: string | null;
  onGateClick: (gateId: string) => void;
  onAddGate: () => void;
  onDeleteGate: (gateId: string) => void;
  onRenameGate: (gateId: string, newName: string) => void;
}

const statusIcon = {
  passed: <CheckCircle2 size={14} className="text-emerald-500" />,
  active: <Shield size={14} className="text-amber-500" />,
  blocked: <AlertCircle size={14} className="text-red-500" />,
  locked: <Lock size={12} className="text-grey-300" />,
};

const statusText = {
  passed: 'text-emerald-700',
  active: 'text-amber-700',
  blocked: 'text-red-700',
  locked: 'text-grey-300',
};

const statusBg = {
  passed: 'bg-emerald-50',
  active: 'bg-amber-50',
  blocked: 'bg-red-50',
  locked: 'bg-grey-050',
};

const lineColor = {
  passed: 'bg-emerald-300',
  active: 'bg-amber-300',
  blocked: 'bg-red-300',
  locked: 'bg-grey-200',
};

export function JourneyStepper({
  items, gateStatusMap, activeGateId,
  onGateClick, onAddGate, onDeleteGate, onRenameGate,
}: JourneyStepperProps) {
  const [contextMenu, setContextMenu] = useState<{ gateId: string; x: number; y: number } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const gates = items
    .filter((it): it is { kind: 'gate'; gate: import('../types').Gate } => it.kind === 'gate')
    .map(it => it.gate);

  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    if (contextMenu) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [contextMenu]);

  const handleRenameSubmit = (gateId: string, originalName: string) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== originalName) onRenameGate(gateId, trimmed);
    setRenamingId(null);
  };

  return (
    <div className="flex items-center gap-0 px-6 py-3 border-b border-grey-080 bg-white overflow-x-auto shrink-0">
      {gates.map((gate, i) => {
        const status = gateStatusMap.get(gate.id) ?? 'locked';
        const isSelected = gate.id === activeGateId;

        return (
          <div key={gate.id} className="flex items-center shrink-0">
            {i > 0 && <div className={`w-8 h-[2px] ${lineColor[status]}`} />}

            <button
              onClick={() => onGateClick(gate.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ gateId: gate.id, x: e.clientX, y: e.clientY });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all
                ${isSelected ? 'ring-2 ring-primary-500/30' : ''}
                ${statusBg[status]} hover:shadow-sm
              `}
            >
              {statusIcon[status]}
              {renamingId === gate.id ? (
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(gate.id, gate.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(gate.id, gate.name);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium text-grey-700 bg-white border border-primary-500 rounded px-1.5 py-0.5 outline-none w-28"
                />
              ) : (
                <span className={`text-xs font-semibold whitespace-nowrap ${statusText[status]}`}>
                  {gate.name}
                </span>
              )}
              {status === 'active' && gate.criteria.length > 0 && (
                <span className="text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {gate.criteria.filter(c => c.completed).length}/{gate.criteria.length}
                </span>
              )}
            </button>
          </div>
        );
      })}

      <div className="flex items-center shrink-0 ml-2">
        <button
          onClick={onAddGate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-grey-300 hover:text-primary-500 hover:bg-primary-100 border border-dashed border-grey-200 hover:border-primary-500/30 transition-all"
        >
          <Plus size={14} />
          Add gate
        </button>
      </div>

      {/* Context menu */}
      {contextMenu && (() => {
        const gate = gates.find(g => g.id === contextMenu.gateId);
        if (!gate) return null;
        return (
          <div
            ref={menuRef}
            className="fixed z-50 w-48 bg-white border border-grey-080 rounded-xl shadow-lg py-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                setRenameValue(gate.name);
                setRenamingId(gate.id);
                setContextMenu(null);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-grey-700 hover:bg-grey-050 transition-colors"
            >
              <Edit3 size={14} className="text-grey-500" /> Rename gate
            </button>
            <div className="border-t border-grey-080 my-1" />
            <button
              onClick={() => { onDeleteGate(gate.id); setContextMenu(null); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} className="text-red-400" /> Delete gate
            </button>
          </div>
        );
      })()}
    </div>
  );
}
