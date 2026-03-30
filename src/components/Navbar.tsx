import { Search, Cloud, ArrowUpFromLine, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  projectName: string;
  activityCount: number;
  onDashboardToggle: () => void;
  dashboardOpen: boolean;
}

export function Navbar({ projectName, activityCount, onDashboardToggle, dashboardOpen }: NavbarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-grey-080 bg-white shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
          <svg width="26" height="16" viewBox="0 0 26 16" fill="none">
            <path d="M2 14L8 2L14 14M18 2V14M22 2C24 2 25 4 25 6C25 8 24 10 22 10H20V2H22Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <button className="flex items-center gap-1 px-2 h-8 rounded-lg hover:bg-grey-050 transition-colors">
          <span className="text-sm font-medium text-grey-700">{projectName}</span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="ml-1">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#393939" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Center - Search */}
      <div className="flex items-center w-[600px] max-w-[600px] min-w-[240px] h-10 border border-grey-200 rounded-full px-4 gap-2">
        <Search size={18} className="text-grey-300 shrink-0" />
        <span className="text-sm text-grey-300 truncate">Search for assets, links, 3D files, integrations</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1 h-10 pl-2 pr-1 rounded-2xl hover:bg-grey-050 transition-colors">
          <span className="text-sm font-medium text-primary-500">Tasks</span>
          <span className="flex items-center justify-center h-8 w-10 rounded-2xl bg-primary-100 text-sm font-medium text-primary-500">12</span>
        </button>

        {/* Dashboard button */}
        <button
          onClick={onDashboardToggle}
          className={`flex items-center gap-1.5 h-10 pl-2.5 pr-1.5 rounded-2xl transition-colors ${
            dashboardOpen ? 'bg-primary-100' : 'hover:bg-grey-050'
          }`}
        >
          <LayoutDashboard size={16} className={dashboardOpen ? 'text-primary-500' : 'text-grey-600'} />
          <span className={`text-sm font-medium ${dashboardOpen ? 'text-primary-500' : 'text-grey-600'}`}>Dashboard</span>
        </button>

        <button className="flex items-center justify-center w-8 h-8 rounded-2xl hover:bg-grey-050 transition-colors">
          <Cloud size={16} className="text-grey-600" />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-2xl hover:bg-grey-050 transition-colors">
          <ArrowUpFromLine size={15} className="text-grey-600" />
        </button>
        <button className="flex items-center justify-center h-10 px-4 bg-primary-500 text-white text-sm font-medium rounded-full hover:bg-primary-500/90 transition-colors">
          Share
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 overflow-hidden ml-1">
          <div className="w-full h-full bg-grey-200 rounded-full flex items-center justify-center text-xs font-medium text-grey-600">KP</div>
        </div>
      </div>
    </header>
  );
}
