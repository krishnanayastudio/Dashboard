import { useState } from 'react';
import {
  Image, FileText, Palette, Box, PenTool,
  MoreHorizontal, ChevronUp, Square, CheckCircle2,
} from 'lucide-react';
import type { JourneyItem, Block, BlockGroup } from '../types';
import { GateBlock } from './GateBlock';

interface JourneyCanvasProps {
  items: JourneyItem[];
  gateStatusMap: Map<string, 'locked' | 'active' | 'passed' | 'blocked'>;
  activeGateId: string | null;
  onGateClick: (gateId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const blockTypeIcons: Record<string, React.ReactNode> = {
  sketch: <PenTool size={14} />,
  board: <Palette size={14} />,
  doc: <FileText size={14} />,
  cad: <Box size={14} />,
  image: <Image size={14} />,
};

const thumbnailGradients: Record<string, string> = {
  sketch: 'from-blue-50 via-indigo-50 to-blue-100',
  board: 'from-rose-50 via-pink-50 to-rose-100',
  doc: 'from-slate-50 via-zinc-50 to-slate-100',
  cad: 'from-emerald-50 via-teal-50 to-emerald-100',
  image: 'from-amber-50 via-orange-50 to-amber-100',
};

function BlockCard({ block }: { block: Block }) {
  const grad = thumbnailGradients[block.type] || 'from-grey-050 to-grey-100';
  const hasApproval = block.approval && block.approval.status !== 'none';
  const isApproved = block.approval?.status === 'approved';

  return (
    <div className="relative w-[288px] h-[230px] rounded-3xl border border-grey-080 shadow-[0px_1px_2px_rgba(0,0,0,0.07),0px_2px_6px_rgba(0,0,0,0.04)] overflow-hidden bg-white shrink-0 hover:shadow-lg transition-shadow cursor-pointer">
      <div className={`absolute inset-0 bg-gradient-to-br ${grad} flex items-center justify-center`}>
        <div className="text-grey-300/20 scale-[5]">
          {blockTypeIcons[block.type]}
        </div>
      </div>

      <div className="absolute top-[9px] left-[10px] flex items-center bg-white rounded-lg shadow-[0px_4px_8px_3px_rgba(0,0,0,0.04),0px_1px_3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="w-8 h-8 flex items-center justify-center text-grey-500 shrink-0">
          {blockTypeIcons[block.type]}
        </div>
        <span className="text-xs font-medium text-grey-700 pr-3 whitespace-nowrap">{block.name}</span>
      </div>

      {hasApproval && (
        <div className="absolute bottom-[10px] left-[10px] right-[10px]">
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-[0px_1px_3px_rgba(0,0,0,0.1)] px-2.5 py-1.5">
            {isApproved ? (
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            ) : (
              <Square size={14} className="text-grey-300 shrink-0" />
            )}
            <span className={`text-xs font-medium ${isApproved ? 'text-emerald-700' : 'text-grey-600'}`}>
              {isApproved ? 'Approved' : 'Needs approval'}
            </span>
            {block.approval!.assignees.length > 0 && (
              <div className="flex items-center ml-auto">
                <div className="flex -space-x-1.5">
                  {block.approval!.assignees.slice(0, 1).map((name, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-300 to-indigo-400 border-2 border-white flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white">{name.charAt(0)}</span>
                    </div>
                  ))}
                </div>
                {block.approval!.assignees.length > 1 && (
                  <span className="text-[10px] text-grey-500 ml-1 font-medium">
                    +{block.approval!.assignees.length - 1}
                  </span>
                )}
              </div>
            )}
            {block.approval!.dueDate && (
              <span className="text-[10px] text-grey-400 font-medium whitespace-nowrap ml-1">
                {block.approval!.dueDate}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BlockGroupCard({ group }: { group: BlockGroup }) {
  const [collapsed, setCollapsed] = useState(group.collapsed ?? false);

  return (
    <div className="bg-grey-050 rounded-3xl overflow-hidden shrink-0 w-[304px]">
      <div className="flex items-center justify-between px-2 pt-2 pb-0">
        <button className="flex items-center h-8 px-2 rounded-lg hover:bg-white/60 transition-colors">
          <span className="text-sm font-medium text-grey-700 whitespace-nowrap">{group.name}</span>
        </button>
        <div className="flex items-center gap-0.5 pr-1">
          <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/60 transition-colors">
            <MoreHorizontal size={14} className="text-grey-500" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/60 transition-colors"
          >
            <ChevronUp size={14} className={`text-grey-500 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="flex flex-col items-center gap-2 p-2">
          {group.blocks.map((block, i) => (
            <div key={block.id} className="flex flex-col items-center gap-2">
              <BlockCard block={block} />
              {i < group.blocks.length - 1 && (
                <div className="w-2 h-2 rounded-full bg-grey-200" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemDot() {
  return <div className="w-2 h-2 rounded-full bg-grey-200 shrink-0 self-center" />;
}

export function JourneyCanvas({ items, gateStatusMap, activeGateId, onGateClick, onReorder }: JourneyCanvasProps) {
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto">
      <div className="flex items-center gap-2 p-8 min-w-max">
        {items.map((item, i) => (
          <div
            key={item.kind === 'block' ? item.block.id : item.kind === 'group' ? item.group.id : item.gate.id}
            className={`flex items-center gap-2 transition-all ${dragOverIdx === i ? 'scale-[1.03]' : ''}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(i));
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverIdx(i);
            }}
            onDragLeave={() => setDragOverIdx(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverIdx(null);
              const fromIndex = Number(e.dataTransfer.getData('text/plain'));
              if (fromIndex !== i) onReorder(fromIndex, i);
            }}
          >
            {item.kind === 'block' && <BlockCard block={item.block} />}
            {item.kind === 'group' && <BlockGroupCard group={item.group} />}
            {item.kind === 'gate' && (
              <GateBlock
                gate={item.gate}
                status={gateStatusMap.get(item.gate.id) ?? 'locked'}
                isActive={item.gate.id === activeGateId}
                onClick={() => onGateClick(item.gate.id)}
              />
            )}
            {i < items.length - 1 && <ItemDot />}
          </div>
        ))}
      </div>
    </div>
  );
}
