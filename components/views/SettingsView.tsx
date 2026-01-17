
import React from 'react';
import { SystemStats } from '../../types';

interface SettingsViewProps {
  stats: SystemStats;
}

const SettingsView: React.FC<SettingsViewProps> = ({ stats }) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-slate-500 text-sm">Configure your Forge IDE environment and AI preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="glass-panel rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">General</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-save</p>
                <p className="text-[10px] text-slate-500">Automatically save changes to local disk</p>
              </div>
              <div className="w-10 h-5 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 size-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Hardware Acceleration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">GPU Offloading</span>
              <span className="text-xs font-mono text-primary">Active ({stats.gpu}%)</span>
            </div>
            <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${stats.gpu}%` }}></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
