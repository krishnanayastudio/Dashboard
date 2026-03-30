import { useState, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { JourneyStepper } from './components/JourneyStepper';
import { JourneyCanvas } from './components/JourneyCanvas';
import { GatePanel } from './components/GatePanel';
import { Dashboard } from './components/Dashboard';
import { Toolbar } from './components/Toolbar';
import { initialProject, initialActivity } from './data';
import type { Project, ActivityEntry, Gate, JourneyItem } from './types';
import { getGates, deriveGateStatus } from './types';

let idCounter = 100;
const uid = (prefix: string) => `${prefix}-${++idCounter}`;
const now = () => 'Mar 30';

function App() {
  const [project, setProject] = useState<Project>(initialProject);
  const [activity, setActivity] = useState<ActivityEntry[]>(initialActivity);
  const [activeGateId, setActiveGateId] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const allGates = useMemo(() => getGates(project.items), [project.items]);
  const gateStatusMap = useMemo(() => {
    const map = new Map<string, 'locked' | 'active' | 'passed' | 'blocked'>();
    allGates.forEach(g => map.set(g.id, deriveGateStatus(g, allGates)));
    return map;
  }, [allGates]);

  const activeGate = allGates.find(g => g.id === activeGateId) ?? null;

  const log = useCallback((entry: Omit<ActivityEntry, 'id'>) => {
    setActivity(prev => [...prev, { ...entry, id: uid('a') }]);
  }, []);

  // ─── Journey item reorder ───

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setProject(prev => {
      const items = [...prev.items];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return { ...prev, items };
    });
  }, []);

  // ─── Gate CRUD ───

  const handleAddGate = useCallback(() => {
    const gate: Gate = {
      id: uid('gate'),
      name: 'New Gate',
      description: '',
      criteria: [],
      status: 'locked',
      enforcement: 'hard',
    };
    const item: JourneyItem = { kind: 'gate', gate };
    setProject(prev => ({ ...prev, items: [...prev.items, item] }));
    setShowDashboard(false);
    setActiveGateId(gate.id);
    log({ action: 'gate_added', actor: 'You', timestamp: now(), gateName: gate.name, detail: 'Added new toll gate' });
  }, [log]);

  const handleDeleteGate = useCallback((gateId: string) => {
    setProject(prev => {
      const gateItem = prev.items.find(it => it.kind === 'gate' && it.gate.id === gateId);
      if (!gateItem || gateItem.kind !== 'gate') return prev;
      log({ action: 'gate_removed', actor: 'You', timestamp: now(), gateName: gateItem.gate.name, detail: `Removed gate "${gateItem.gate.name}"` });
      if (activeGateId === gateId) setActiveGateId(null);
      return { ...prev, items: prev.items.filter(it => !(it.kind === 'gate' && it.gate.id === gateId)) };
    });
  }, [activeGateId, log]);

  const handleRenameGate = useCallback((gateId: string, newName: string) => {
    setProject(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.kind !== 'gate' || it.gate.id !== gateId) return it;
        log({ action: 'gate_renamed', actor: 'You', timestamp: now(), gateName: newName, detail: `Renamed "${it.gate.name}" → "${newName}"` });
        return { ...it, gate: { ...it.gate, name: newName } };
      }),
    }));
  }, [log]);

  // ─── Criteria CRUD ───

  const updateGate = useCallback((gateId: string, updater: (g: Gate) => Gate) => {
    setProject(prev => ({
      ...prev,
      items: prev.items.map(it =>
        it.kind === 'gate' && it.gate.id === gateId
          ? { ...it, gate: updater(it.gate) }
          : it
      ),
    }));
  }, []);

  const handleUpdateGate = useCallback((gateId: string, updates: { name?: string; description?: string }) => {
    updateGate(gateId, g => ({ ...g, ...updates }));
  }, [updateGate]);

  const handleAddCriterion = useCallback((gateId: string, label: string) => {
    updateGate(gateId, g => {
      log({ action: 'criterion_added', actor: 'You', timestamp: now(), gateName: g.name, detail: `Added "${label}"` });
      return { ...g, criteria: [...g.criteria, { id: uid('c'), label, completed: false }] };
    });
  }, [updateGate, log]);

  const handleRemoveCriterion = useCallback((gateId: string, criterionId: string) => {
    updateGate(gateId, g => {
      const c = g.criteria.find(c => c.id === criterionId);
      log({ action: 'criterion_removed', actor: 'You', timestamp: now(), gateName: g.name, detail: `Removed "${c?.label}"` });
      return { ...g, criteria: g.criteria.filter(c => c.id !== criterionId) };
    });
  }, [updateGate, log]);

  const handleToggleCriterion = useCallback((criterionId: string) => {
    setProject(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.kind !== 'gate') return it;
        const c = it.gate.criteria.find(c => c.id === criterionId);
        if (!c || c.completed) return it;
        log({ action: 'criterion_checked', actor: 'You', timestamp: now(), gateName: it.gate.name, detail: `Checked "${c.label}"` });
        return {
          ...it,
          gate: {
            ...it.gate,
            criteria: it.gate.criteria.map(c =>
              c.id === criterionId ? { ...c, completed: true, approvedBy: 'You', approvedAt: 'Just now' } : c
            ),
          },
        };
      }),
    }));
  }, [log]);

  const handleRevokeCriterion = useCallback((criterionId: string) => {
    setProject(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.kind !== 'gate') return it;
        const c = it.gate.criteria.find(c => c.id === criterionId);
        if (!c || !c.completed) return it;
        log({ action: 'criterion_revoked', actor: 'You', timestamp: now(), gateName: it.gate.name, detail: `Revoked "${c.label}"` });
        return {
          ...it,
          gate: {
            ...it.gate,
            criteria: it.gate.criteria.map(c =>
              c.id === criterionId ? { ...c, completed: false, approvedBy: undefined, approvedAt: undefined } : c
            ),
          },
        };
      }),
    }));
  }, [log]);

  // ─── Gate decisions ───

  const handleGateClick = useCallback((gateId: string) => {
    setShowDashboard(false);
    setActiveGateId(prev => prev === gateId ? null : gateId);
  }, []);

  const handleDecision = useCallback((decision: 'go' | 'no-go', reason?: string) => {
    setProject(prev => {
      const items = prev.items.map(it => {
        if (it.kind !== 'gate' || it.gate.id !== activeGateId) return it;
        const gate = { ...it.gate };
        if (decision === 'go') {
          gate.status = 'passed';
          gate.decision = 'go';
          gate.decidedBy = 'You';
          gate.decidedAt = 'Mar 30, 2026';
          log({ action: 'gate_go', actor: 'You', timestamp: now(), gateName: gate.name, detail: 'Passed gate — Go decision' });
        } else {
          gate.status = 'blocked';
          gate.decision = 'no-go';
          gate.blockReason = reason || 'Blocked — requires revision';
          gate.decidedBy = 'You';
          gate.decidedAt = 'Mar 30, 2026';
          log({ action: 'gate_no_go', actor: 'You', timestamp: now(), gateName: gate.name, detail: reason ? `No-Go: ${reason}` : 'Blocked gate — No-Go decision' });
        }
        return { ...it, gate };
      });

      // If go, unlock the next locked gate
      if (decision === 'go') {
        const gates = items.filter((it): it is { kind: 'gate'; gate: Gate } => it.kind === 'gate');
        const idx = gates.findIndex(it => it.gate.id === activeGateId);
        if (idx >= 0 && idx + 1 < gates.length && gates[idx + 1].gate.status === 'locked') {
          const nextGateId = gates[idx + 1].gate.id;
          return {
            ...prev,
            items: items.map(it =>
              it.kind === 'gate' && it.gate.id === nextGateId
                ? { ...it, gate: { ...it.gate, status: 'active' as const } }
                : it
            ),
          };
        }
      }

      return { ...prev, items };
    });
  }, [activeGateId, log]);

  const handleDashboardToggle = () => {
    setActiveGateId(null);
    setShowDashboard(prev => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <Navbar
        projectName={project.name}
        activityCount={activity.length}
        onDashboardToggle={handleDashboardToggle}
        dashboardOpen={showDashboard}
      />
      <JourneyStepper
        items={project.items}
        gateStatusMap={gateStatusMap}
        activeGateId={activeGateId}
        onGateClick={handleGateClick}
        onAddGate={handleAddGate}
        onDeleteGate={handleDeleteGate}
        onRenameGate={handleRenameGate}
      />

      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        <JourneyCanvas
          items={project.items}
          gateStatusMap={gateStatusMap}
          activeGateId={activeGateId}
          onGateClick={handleGateClick}
          onReorder={handleReorder}
        />

        {/* Centered gate panel modal */}
        {activeGate && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="relative max-h-[calc(100%-48px)] flex pointer-events-auto">
              <GatePanel
                gate={activeGate}
                phaseName={activeGate.name}
                onClose={() => setActiveGateId(null)}
                onToggleCriterion={handleToggleCriterion}
                onDecision={handleDecision}
                onAddCriterion={handleAddCriterion}
                onRemoveCriterion={handleRemoveCriterion}
                onRevokeCriterion={handleRevokeCriterion}
                onUpdateGate={handleUpdateGate}
              />
            </div>
          </div>
        )}

      </div>

      <Toolbar onAddGate={handleAddGate} />

      {showDashboard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDashboard(false)} />
          <div className="relative flex">
            <Dashboard
              project={project}
              activity={activity}
              onClose={() => setShowDashboard(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
