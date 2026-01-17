
import React from 'react';
import { SystemStats } from '../types';

interface StatusBarProps {
  stats: SystemStats;
}

const StatusBar: React.FC<StatusBarProps> = ({ stats }) => {
  return (
    <footer className="h-8 border-t border-border-dark bg-background-dark flex items-center px-4 justify-between shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary shadow-[0_0_5px_#00e6bb] animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Engine: Ollama v0.3.1 (Active)</span>
        </div>
        <div className="h-3 w-px bg-border-dark"></div>
        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-4">
          <span>CPU: {Math.round(stats.cpu)}%</span>
          <span>RAM: {stats.ram}</span>
          <span>TEMP: {Math.round(stats.temp)}°C</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="material-symbols-outlined text-xs">lan</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Local Only</span>
        </div>
        <div className="h-3 w-px bg-border-dark"></div>
        <div className="flex items-center gap-1 text-primary">
          <span className="material-symbols-outlined text-xs">verified_user</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Forge-Secure Enabled</span>
        </div>
        <div className="h-3 w-px bg-border-dark"></div>
        <div className="text-[10px] font-bold text-primary uppercase tracking-wider">UTF-8</div>
      </div>
    </footer>
  );
};

export default StatusBar;
