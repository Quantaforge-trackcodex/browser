
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: ViewType.WORKSPACE, icon: 'house', label: 'Home' },
    { id: ViewType.COMMAND, icon: 'public', label: 'Browser' },
    { id: ViewType.LOCAL_FORGE, icon: 'extension', label: 'Forge' },
    { id: ViewType.HISTORY, icon: 'history', label: 'History' },
    { id: ViewType.GIT, icon: 'account_tree', label: 'Git' },
  ];

  return (
    <aside className="w-16 border-r border-border-dark flex flex-col items-center py-6 gap-6 bg-background-dark shrink-0">
      <div 
        className="p-2 bg-primary rounded-lg text-background-dark cursor-pointer transform hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,230,187,0.4)]"
        onClick={() => onViewChange(ViewType.WORKSPACE)}
      >
        <span className="material-symbols-outlined !text-2xl font-bold">fort</span>
      </div>
      
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`p-2 rounded-xl transition-all group relative flex items-center justify-center size-10 ${
                isActive 
                  ? 'text-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(0,230,187,0.2)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
              title={item.label}
            >
              <span className={`material-symbols-outlined !text-[22px] ${isActive ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              
              {/* Tooltip */}
              <span className="absolute left-14 bg-surface-dark border border-border-dark px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                {item.label}
              </span>

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute -left-[18px] w-1 h-6 bg-primary rounded-r-full shadow-[0_0_8px_#00e6bb]"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <button 
          onClick={() => onViewChange(ViewType.SETTINGS)}
          className={`p-2 transition-colors flex items-center justify-center size-10 rounded-xl ${
            activeView === ViewType.SETTINGS 
              ? 'text-primary bg-primary/10' 
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="material-symbols-outlined !text-[22px]">settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
