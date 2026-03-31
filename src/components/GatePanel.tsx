import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Circle, Lock, X, Shield, AlertTriangle, Clock, User, Plus, Trash2, RotateCcw, Pencil } from 'lucide-react';
import type { Gate } from '../types';

interface GatePanelProps {
  gate: Gate;
  phaseName: string;
  onClose: () => void;
  onToggleCriterion: (criterionId: string) => void;
  onDecision: (decision: 'go' | 'no-go', reason?: string) => void;
  onAddCriterion: (gateId: string, label: string) => void;
  onRemoveCriterion: (gateId: string, criterionId: string) => void;
  onRevokeCriterion: (criterionId: string) => void;
  onUpdateGate: (gateId: string, updates: { name?: string; description?: string }) => void;
}

export function GatePanel({ gate, phaseName, onClose, onToggleCriterion, onDecision, onAddCriterion, onRemoveCriterion, onRevokeCriterion, onUpdateGate }: GatePanelProps) {
  const [noGoReason, setNoGoReason] = useState('');
  const [showNoGoInput, setShowNoGoInput] = useState(false);
  const [showAddCriterion, setShowAddCriterion] = useState(false);
  const [newCriterionLabel, setNewCriterionLabel] = useState('');
  const [editingName, setEditingName] = useState(gate.name === 'New Gate');
  const [editingDesc, setEditingDesc] = useState(gate.name === 'New Gate');
  const [nameValue, setNameValue] = useState(gate.name);
  const [descValue, setDescValue] = useState(gate.description);
  const nameRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingName && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [editingName]);

  const commitName = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== gate.name) {
      onUpdateGate(gate.id, { name: trimmed });
    } else {
      setNameValue(gate.name);
    }
    setEditingName(false);
  };

  const commitDesc = () => {
    const trimmed = descValue.trim();
    if (trimmed !== gate.description) {
      onUpdateGate(gate.id, { description: trimmed });
    } else {
      setDescValue(gate.description);
    }
    setEditingDesc(false);
  };

  const completedCount = gate.criteria.filter(c => c.completed).length;
  const totalCount = gate.criteria.length;
  const allComplete = totalCount > 0 && completedCount === totalCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddCriterion = () => {
    const trimmed = newCriterionLabel.trim();
    if (trimmed) {
      onAddCriterion(gate.id, trimmed);
      setNewCriterionLabel('');
      setShowAddCriterion(false);
    }
  };

  return (
    <div className="w-[720px] bg-white border border-gray-100 rounded-2xl flex flex-col max-h-full shrink-0 shadow-xl shadow-black/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-purple-700" />
          <h2 className="text-base font-semibold text-gray-900">Toll Gate</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X size={18} className="text-gray-700" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Gate info */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{phaseName}</span>
          </div>
          {editingName ? (
            <input
              ref={nameRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') { setNameValue(gate.name); setEditingName(false); }
              }}
              className="text-lg font-semibold text-gray-900 mb-1 w-full bg-transparent border-b-2 border-purple-700 outline-none py-0.5"
              placeholder="Gate name..."
            />
          ) : (
            <h3
              className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer group/name flex items-center gap-2 hover:text-purple-700 transition-colors"
              onClick={() => { setNameValue(gate.name); setEditingName(true); }}
            >
              {gate.name}
              <Pencil size={14} className="text-gray-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
            </h3>
          )}
          {editingDesc ? (
            <textarea
              ref={descRef}
              autoFocus
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={commitDesc}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setDescValue(gate.description); setEditingDesc(false); }
              }}
              className="text-sm text-gray-700 leading-relaxed w-full bg-transparent border border-purple-700/30 rounded-lg outline-none px-2 py-1.5 resize-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700/20"
              placeholder="Add a description..."
              rows={2}
            />
          ) : (
            <p
              className="text-sm text-gray-700 leading-relaxed cursor-pointer group/desc flex items-start gap-2 hover:text-gray-800 transition-colors"
              onClick={() => { setDescValue(gate.description); setEditingDesc(true); }}
            >
              {gate.description || <span className="text-gray-400 italic">Add a description...</span>}
              <Pencil size={12} className="text-gray-400 opacity-0 group-hover/desc:opacity-100 transition-opacity mt-0.5 shrink-0" />
            </p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
              ${gate.enforcement === 'hard' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-orange-50 text-gray-800 border border-orange-100'}
            `}>
              {gate.enforcement === 'hard' ? <Lock size={12} /> : <AlertTriangle size={12} />}
              {gate.enforcement === 'hard' ? 'Hard gate' : 'Soft gate'}
            </div>
            {gate.status === 'passed' && gate.decidedBy && (
              <div className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                <User size={12} />
                {gate.decidedBy}
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        {gate.status === 'active' && totalCount > 0 && (
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Progress</span>
              <span className="text-sm font-semibold tabular-nums text-gray-900">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  allComplete ? 'bg-green-500' : 'bg-yellow-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {completedCount} of {totalCount} criteria met
            </p>
          </div>
        )}

        {/* Criteria checklist */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Criteria</h4>
            {(gate.status === 'active' || gate.status === 'locked') && (
              <button
                onClick={() => setShowAddCriterion(true)}
                className="flex items-center gap-1 text-xs font-medium text-purple-700 hover:text-purple-700/80 transition-colors"
              >
                <Plus size={12} />
                Add
              </button>
            )}
          </div>

          {/* Add criterion input */}
          {showAddCriterion && (
            <div className="flex gap-2 mb-3">
              <input
                autoFocus
                value={newCriterionLabel}
                onChange={(e) => setNewCriterionLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCriterion();
                  if (e.key === 'Escape') { setShowAddCriterion(false); setNewCriterionLabel(''); }
                }}
                placeholder="Criterion label..."
                className="flex-1 h-9 px-3 text-sm border border-gray-100 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700/20"
              />
              <button
                onClick={handleAddCriterion}
                className="h-9 px-3 text-sm font-medium text-white bg-purple-700 rounded-lg hover:bg-purple-700/90 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setShowAddCriterion(false); setNewCriterionLabel(''); }}
                className="h-9 px-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {gate.criteria.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-6">
                No criteria yet. Add one to get started.
              </div>
            )}
            {gate.criteria.map((criterion) => (
              <div
                key={criterion.id}
                className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all group relative
                  ${gate.status === 'active' ? 'hover:bg-gray-50' : ''}
                  ${criterion.completed ? 'bg-green-50/50' : ''}
                `}
              >
                {/* Checkbox area */}
                <button
                  onClick={() => {
                    if (gate.status !== 'active') return;
                    if (!criterion.completed) {
                      onToggleCriterion(criterion.id);
                    }
                  }}
                  className={`mt-0.5 shrink-0 ${gate.status === 'active' && !criterion.completed ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {criterion.completed ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : gate.status === 'locked' ? (
                    <Lock size={18} className="text-gray-300" />
                  ) : (
                    <Circle size={18} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium block ${
                    criterion.completed ? 'text-gray-900' : gate.status === 'locked' ? 'text-gray-400' : 'text-gray-800'
                  }`}>
                    {criterion.label}
                  </span>
                  {criterion.approvedBy && (
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <User size={10} />
                      {criterion.approvedBy} &middot; {criterion.approvedAt}
                    </span>
                  )}
                </div>

                {/* Action buttons on hover */}
                {(gate.status === 'active' || gate.status === 'locked') && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {criterion.completed && (
                      <button
                        onClick={() => onRevokeCriterion(criterion.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-orange-100 transition-colors"
                        title="Revoke approval"
                      >
                        <RotateCcw size={13} className="text-orange-300" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveCriterion(gate.id, criterion.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-100 transition-colors"
                      title="Remove criterion"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Decision history for passed gates */}
        {gate.status === 'passed' && (
          <div className="px-5 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
              <CheckCircle2 size={18} className="text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-500">Gate passed</p>
                <p className="text-xs text-green-500 flex items-center gap-1 mt-0.5">
                  <Clock size={10} />
                  {gate.decidedAt} by {gate.decidedBy}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Blocked state */}
        {gate.status === 'blocked' && (
          <div className="px-5 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
              <X size={18} className="text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">Gate blocked</p>
                {gate.blockReason && (
                  <p className="text-xs text-red-700 mt-0.5">{gate.blockReason}</p>
                )}
                <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                  <Clock size={10} />
                  {gate.decidedAt} by {gate.decidedBy}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Action buttons — only for active gates */}
      {gate.status === 'active' && (
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          {showNoGoInput ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={noGoReason}
                onChange={(e) => setNoGoReason(e.target.value)}
                placeholder="Reason for blocking this gate..."
                className="w-full h-20 px-3 py-2 text-sm border border-gray-100 rounded-xl resize-none focus:outline-none focus:border-purple-700 focus:ring-1 focus:ring-purple-700/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowNoGoInput(false); setNoGoReason(''); }}
                  className="flex-1 h-10 text-sm font-medium text-gray-800 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onDecision('no-go', noGoReason); setShowNoGoInput(false); }}
                  className="flex-1 h-10 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Confirm No-Go
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowNoGoInput(true)}
                className="flex-1 h-11 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
              >
                No-Go
              </button>
              <button
                onClick={() => onDecision('go')}
                disabled={!allComplete}
                className={`flex-1 h-11 text-sm font-medium rounded-xl transition-all ${
                  allComplete
                    ? 'text-white bg-green-500 hover:bg-green-500/85 shadow-sm hover:shadow-md'
                    : 'text-gray-400 bg-gray-50 border border-gray-100 cursor-not-allowed'
                }`}
              >
                {allComplete ? 'Go — Pass Gate' : `Go (${completedCount}/${totalCount})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
