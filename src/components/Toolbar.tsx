import { HelpCircle, Rocket, Square, Upload, FileText, Image, Presentation, Table2, Wrench, MessageCircle, Layers, BarChart3, ZoomIn, ShieldCheck } from 'lucide-react';

interface ToolbarProps {
  onAddGate: () => void;
}

export function Toolbar({ onAddGate }: ToolbarProps) {
  const mainTools = [
    { icon: <Square size={18} />, label: 'Block' },
    { icon: <Upload size={18} />, label: 'Upload' },
    { icon: <FileText size={18} />, label: 'Doc' },
    { icon: <Image size={18} />, label: 'Image' },
    { icon: <Presentation size={18} />, label: 'Slides' },
    { icon: <Table2 size={18} />, label: 'Sheet' },
    { icon: <Wrench size={18} />, label: 'CAD' },
  ];

  return (
    <div className="h-[108px] relative shrink-0 w-full">
      {/* Left island */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 h-14 px-2 bg-white border border-grey-100 rounded-full shadow-[0px_8px_12px_6px_rgba(0,0,0,0.04),0px_4px_4px_rgba(0,0,0,0.07)]">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-grey-050 transition-colors">
          <HelpCircle size={20} className="text-grey-500" />
        </button>
        <div className="w-px h-6 bg-grey-100" />
        <button className="flex items-center gap-1.5 h-10 pl-2 pr-3 bg-[#e2e1ff] rounded-full hover:bg-[#d4d2ff] transition-colors">
          <Rocket size={18} className="text-primary-500" />
          <span className="text-sm font-medium text-primary-500">Quick start</span>
        </button>
      </div>

      {/* Center toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 h-14 px-3 py-2 bg-white border border-grey-100 rounded-full shadow-[0px_4px_8px_rgba(0,0,0,0.04),0px_1px_3px_rgba(0,0,0,0.07)]">
        {mainTools.map((tool) => (
          <button
            key={tool.label}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-grey-050 transition-colors text-grey-600"
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
        <div className="w-px h-8 bg-grey-100 mx-1 self-center" />
        <button
          onClick={onAddGate}
          className="flex items-center gap-1.5 h-10 pl-2 pr-3 rounded-lg hover:bg-primary-050 transition-colors text-primary-500"
          title="Add Gate"
        >
          <ShieldCheck size={18} />
          <span className="text-sm font-medium">Gate</span>
        </button>
        <div className="w-px h-8 bg-grey-100 mx-1 self-center" />
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-grey-050 transition-colors text-grey-600">
          <MessageCircle size={18} />
        </button>
      </div>

      {/* Right island */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 h-14 px-2 bg-white border border-grey-100 rounded-full shadow-[0px_8px_12px_rgba(0,0,0,0.04),0px_4px_4px_rgba(0,0,0,0.07)]">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-grey-050 transition-colors">
          <Layers size={18} className="text-grey-500" />
        </button>
        <div className="w-px h-6 bg-grey-100" />
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-grey-050 transition-colors">
          <BarChart3 size={18} className="text-grey-500" />
        </button>
        <div className="w-px h-6 bg-grey-100" />
        <button className="flex items-center gap-1.5 h-10 px-3 rounded-full hover:bg-grey-050 transition-colors">
          <ZoomIn size={18} className="text-grey-500" />
          <span className="text-sm font-medium text-grey-600">100%</span>
        </button>
      </div>
    </div>
  );
}
