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
    <div className="w-[720px] bg-white border border-grey-080 rounded-2xl flex flex-col max-h-full shrink-0 shadow-xl shadow-black/8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-grey-080">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-primary-500" />
          <h2 className="text-base font-semibold text-grey-700">Toll Gate</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-grey-050 transition-colors"
        >
          <X size={18} className="text-grey-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Gate info */}
        <div className="px-5 py-4 border-b border-grey-080">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-grey-300 uppercase tracking-wider">{phaseName}</span>
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
              className="text-lg font-semibold text-grey-700 mb-1 w-full bg-transparent border-b-2 border-primary-500 outline-none py-0.5"
              placeholder="Gate name..."
            />
          ) : (
            <h3
              className="text-lg font-semibold text-grey-700 mb-1 cursor-pointer group/name flex items-center gap-2 hover:text-primary-500 transition-colors"
              onClick={() => { setNameValue(gate.name); setEditingName(true); }}
            >
              {gate.name}
              <Pencil size={14} className="text-grey-300 opacity-0 group-hover/name:opacity-100 transition-opacity" />
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
              className="text-sm text-grey-500 leading-relaxed w-full bg-transparent border border-primary-500/30 rounded-lg outline-none px-2 py-1.5 resize-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
              placeholder="Add a description..."
              rows={2}
            />
          ) : (
            <p
              className="text-sm text-grey-500 leading-relaxed cursor-pointer group/desc flex items-start gap-2 hover:text-grey-600 transition-colors"
              onClick={() => { setDescValue(gate.description); setEditingDesc(true); }}
            >
              {gate.description || <span className="text-grey-300 italic">Add a description...</span>}
              <Pencil size={12} className="text-grey-300 opacity-0 group-hover/desc:opacity-100 transition-opacity mt-0.5 shrink-0" />
            </p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
              ${gate.enforcement === 'hard' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}
            `}>
              {gate.enforcement === 'hard' ? <Lock size={12} /> : <AlertTriangle size={12} />}
              {gate.enforcement === 'hard' ? 'Hard gate' : 'Soft gate'}
            </div>
            {gate.status === 'passed' && gate.decidedBy && (
              <div className="inline-flex items-center gap-1.5 text-xs text-grey-500">
                <User size={12} />
                {gate.decidedBy}
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        {gate.status === 'active' && totalCount > 0 && (
          <div className="px-5 py-4 border-b border-grey-080">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-grey-700">Progress</span>
              <span className="text-sm font-semibold tabular-nums text-grey-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-grey-080 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  allComplete ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-grey-300 mt-1.5">
              {completedCount} of {totalCount} criteria met
            </p>
          </div>
        )}

        {/* Criteria checklist */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-grey-700">Criteria</h4>
            {(gate.status === 'active' || gate.status === 'locked') && (
              <button
                onClick={() => setShowAddCriterion(true)}
                className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-500/80 transition-colors"
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
                className="flex-1 h-9 px-3 text-sm border border-grey-080 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
              />
              <button
                onClick={handleAddCriterion}
                className="h-9 px-3 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-500/90 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setShowAddCriterion(false); setNewCriterionLabel(''); }}
                className="h-9 px-2 text-sm text-grey-500 hover:text-grey-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {gate.criteria.length === 0 && (
              <div className="text-sm text-grey-300 text-center py-6">
                No criteria yet. Add one to get started.
              </div>
            )}
            {gate.criteria.map((criterion) => (
              <div
                key={criterion.id}
                className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all group relative
                  ${gate.status === 'active' ? 'hover:bg-grey-050' : ''}
                  ${criterion.completed ? 'bg-emerald-50/50' : ''}
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
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : gate.status === 'locked' ? (
                    <Lock size={18} className="text-grey-200" />
                  ) : (
                    <Circle size={18} className="text-grey-200 group-hover:text-grey-300 transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium block ${
                    criterion.completed ? 'text-grey-700' : gate.status === 'locked' ? 'text-grey-300' : 'text-grey-600'
                  }`}>
                    {criterion.label}
                  </span>
                  {criterion.approvedBy && (
                    <span className="text-xs text-grey-300 flex items-center gap-1 mt-0.5">
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
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-amber-100 transition-colors"
                        title="Revoke approval"
                      >
                        <RotateCcw size={13} className="text-amber-600" />
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
          <div className="px-5 py-4 border-t border-grey-080">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-700">Gate passed</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                  <Clock size={10} />
                  {gate.decidedAt} by {gate.decidedBy}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Blocked state */}
        {gate.status === 'blocked' && (
          <div className="px-5 py-4 border-t border-grey-080">
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl">
              <X size={18} className="text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">Gate blocked</p>
                {gate.blockReason && (
                  <p className="text-xs text-red-600 mt-0.5">{gate.blockReason}</p>
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
        <div className="px-5 py-4 border-t border-grey-080 bg-white">
          {showNoGoInput ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={noGoReason}
                onChange={(e) => setNoGoReason(e.target.value)}
                placeholder="Reason for blocking this gate..."
                className="w-full h-20 px-3 py-2 text-sm border border-grey-080 rounded-xl resize-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowNoGoInput(false); setNoGoReason(''); }}
                  className="flex-1 h-10 text-sm font-medium text-grey-600 bg-grey-050 rounded-xl hover:bg-grey-080 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onDecision('no-go', noGoReason); setShowNoGoInput(false); }}
                  className="flex-1 h-10 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
                >
                  Confirm No-Go
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowNoGoInput(true)}
                className="flex-1 h-11 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
              >
                No-Go
              </button>
              <button
                onClick={() => onDecision('go')}
                disabled={!allComplete}
                className={`flex-1 h-11 text-sm font-medium rounded-xl transition-all ${
                  allComplete
                    ? 'text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm hover:shadow-md'
                    : 'text-grey-300 bg-grey-050 border border-grey-080 cursor-not-allowed'
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
