
import React, { useState, useEffect } from 'react';
import { ViewType, SystemStats } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WorkspaceView from './components/views/WorkspaceView';
import CommandView from './components/views/CommandView';
import LocalForgeView from './components/views/LocalForgeView';
import GitView from './components/views/GitView';
import HistoryView from './components/views/HistoryView';
import SettingsView from './components/views/SettingsView';
import StatusBar from './components/StatusBar';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.WORKSPACE);
  const [stats, setStats] = useState<SystemStats>({
    gpu: 42,
    npu: 18,
    vram: '6.2/8GB',
    cpu: 12,
    ram: '3.2GB',
    temp: 54
  });

  // Simulate hardware telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        gpu: Math.min(100, Math.max(0, prev.gpu + (Math.random() - 0.5) * 5)),
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() - 0.5) * 3)),
        temp: Math.min(90, Math.max(40, prev.temp + (Math.random() - 0.5) * 2))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTrackCodexPush = () => {
    // This captures generic context based on active view. 
    // Individual views have specialized push buttons for detailed payloads.
    const context = {
      type: 'global_context_push',
      active_view: activeView,
      timestamp: new Date().toISOString(),
      source: 'Forge IDE Header'
    };
    const encodedData = btoa(JSON.stringify(context));
    window.open(`https://trackcodex.workspace/import?payload=${encodedData}`, '_blank');
  };

  const renderView = () => {
    switch (activeView) {
      case ViewType.WORKSPACE:
        return <WorkspaceView />;
      case ViewType.COMMAND:
        return <CommandView />;
      case ViewType.LOCAL_FORGE:
        return <LocalForgeView stats={stats} />;
      case ViewType.GIT:
        return <GitView />;
      case ViewType.HISTORY:
        return <HistoryView />;
      case ViewType.SETTINGS:
        return <SettingsView stats={stats} />;
      default:
        return <WorkspaceView />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-dark font-display">
      <Header 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onPushToTrackCodex={handleTrackCodexPush} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {renderView()}
        </main>
      </div>
      
      <StatusBar stats={stats} />
    </div>
  );
};

export default App;
