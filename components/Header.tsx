
import React, { useState } from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onPushToTrackCodex?: () => void;
}

interface TabItem {
  id: ViewType | string;
  label: string;
  ext: string;
  isModified: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeView, onViewChange, onPushToTrackCodex }) => {
  const [tabs, setTabs] = useState<TabItem[]>([
    { 
      id: ViewType.WORKSPACE, 
      label: 'Managing State', 
      ext: 'tsx', 
      isModified: true 
    },
    { 
      id: ViewType.COMMAND, 
      label: 'Unified Search', 
      ext: 'sh', 
      isModified: false 
    },
    { 
      id: ViewType.SETTINGS, 
      label: 'forge.config', 
      ext: 'json', 
      isModified: false 
    },
  ]);

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const getIconInfo = (ext: string) => {
    switch (ext) {
      case 'tsx': 
        return { name: 'code', color: 'text-blue-400' };
      case 'sh': 
        return { name: 'terminal', color: 'text-primary' };
      case 'json': 
        return { name: 'data_object', color: 'text-yellow-500' };
      default: 
        return { name: 'description', color: 'text-white/40' };
    }
  };

  const handleTabClick = (tabId: ViewType | string) => {
    // In this app, we map specific tab IDs to global ViewTypes
    if (Object.values(ViewType).includes(tabId as ViewType)) {
      onViewChange(tabId as ViewType);
    }
  };

  const closeTab = (e: React.MouseEvent, tabId: ViewType | string) => {
    e.stopPropagation();
    const newTabs = tabs.filter(t => t.id !== tabId);
    if (newTabs.length > 0) {
      setTabs(newTabs);
      // If we closed the active tab, switch to the last one
      if (activeView === tabId) {
        const lastTab = newTabs[newTabs.length - 1];
        handleTabClick(lastTab.id);
      }
    }
  };

  const addTab = () => {
    const newTab: TabItem = {
      id: `new-${Date.now()}`,
      label: 'Untitled',
      ext: 'tsx',
      isModified: false
    };
    setTabs([...tabs, newTab]);
    onViewChange(ViewType.WORKSPACE);
  };

  const handleDragStart = (idx: number) => setDraggedIdx(idx);

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newTabs = [...tabs];
    const draggedItem = newTabs[draggedIdx];
    newTabs.splice(draggedIdx, 1);
    newTabs.splice(idx, 0, draggedItem);
    setDraggedIdx(idx);
    setTabs(newTabs);
  };

  return (
    <header className="flex flex-col border-b border-border-dark bg-background-dark z-20 shrink-0">
      <div className="flex items-center justify-between px-4 py-2 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/10"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/10"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/10"></div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <button className="p-1.5 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined !text-sm">arrow_back_ios</span>
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined !text-sm">arrow_forward_ios</span>
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors" onClick={() => window.location.reload()}>
              <span className="material-symbols-outlined !text-sm">refresh</span>
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/60">
              <span className="material-symbols-outlined !text-[14px]">lock</span>
            </div>
            <input 
              className="w-full bg-surface-dark border border-border-dark rounded-lg py-1.5 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-white/10 text-white/70" 
              type="text" 
              placeholder="Search or enter URL..."
              defaultValue="forge://workspace/react/managing-state"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onPushToTrackCodex}
            className="flex items-center gap-2 px-3 py-1.5 bg-security-purple/10 border border-security-purple/30 rounded-lg text-security-purple text-[10px] font-bold hover:bg-security-purple/20 transition-all tracking-wider active:scale-95"
          >
            <span className="material-symbols-outlined !text-[14px]">transit_enterexit</span>
            PUSH TO TRACKCODEX
          </button>
          <div className="h-6 w-[1px] bg-border-dark"></div>
          <div 
            className="size-7 rounded-full bg-cover bg-center border border-border-dark cursor-pointer ring-1 ring-white/5 hover:ring-primary/50 transition-all"
            style={{ backgroundImage: `url('https://picsum.photos/seed/forge/100/100')` }}
          />
        </div>
      </div>

      <div className="flex items-center px-1 overflow-x-auto custom-scrollbar no-scrollbar select-none bg-black/20">
        {tabs.map((tab, idx) => {
          const iconInfo = getIconInfo(tab.ext);
          const isActive = activeView === tab.id;
          const isDragging = draggedIdx === idx;

          return (
            <div 
              key={tab.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={() => setDraggedIdx(null)}
              onClick={() => handleTabClick(tab.id)}
              className={`group relative flex items-center h-10 px-4 gap-2 min-w-[150px] max-w-[220px] cursor-pointer transition-all border-r border-border-dark/30 ${
                isActive 
                  ? 'bg-surface-dark text-white' 
                  : 'bg-transparent text-white/40 hover:bg-white/5 hover:text-white/60'
              } ${isDragging ? 'opacity-30' : 'opacity-100'}`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_#00e6bb]"></div>
              )}
              
              <span className={`material-symbols-outlined !text-[18px] ${iconInfo.color}`}>
                {iconInfo.name}
              </span>
              
              <span className="text-[12px] font-medium truncate flex-1 tracking-tight">
                {tab.label}<span className="opacity-30">.{tab.ext}</span>
              </span>

              <div className="flex items-center gap-1.5">
                {tab.isModified && (
                  <div className="size-2 rounded-full bg-primary shadow-[0_0_4px_#00e6bb] transition-opacity group-hover:opacity-0"></div>
                )}
                <button 
                  onClick={(e) => closeTab(e, tab.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined !text-[14px]">close</span>
                </button>
              </div>
            </div>
          );
        })}
        
        <button 
          onClick={addTab}
          className="p-2 ml-1 text-white/20 hover:text-primary transition-all hover:bg-white/5 rounded-md group"
          title="New Tab"
        >
          <span className="material-symbols-outlined !text-xl">add</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
