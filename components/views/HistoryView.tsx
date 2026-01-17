
import React from 'react';

interface HistoryItem {
  id: string;
  type: 'refactor' | 'search' | 'commit' | 'security';
  title: string;
  description: string;
  time: string;
}

const HistoryView: React.FC = () => {
  const history: HistoryItem[] = [
    { id: '1', type: 'refactor', title: 'Suggested Refactor applied', description: 'Applied useReducer optimization to WorkspaceView.tsx', time: '2 mins ago' },
    { id: '2', type: 'search', title: 'Unified Search query executed', description: '"Optimize memory in local React hooks"', time: '15 mins ago' },
    { id: '3', type: 'commit', title: 'Git Commit: main', description: 'feat: integrated unified search grounding with citations', time: '1 hour ago' },
    { id: '4', type: 'security', title: 'Security Audit completed', description: 'Found 1 high vulnerability in auth_handler.py', time: '3 hours ago' }
  ];

  const pushToTrackCodex = (item: HistoryItem) => {
    const data = {
      type: 'history_export',
      origin: 'Forge IDE History',
      item: item,
      timestamp: new Date().toISOString()
    };
    const encodedData = btoa(JSON.stringify(data));
    window.open(`https://trackcodex.workspace/import?payload=${encodedData}`, '_blank');
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Session History</h2>
          <p className="text-slate-500 text-sm">Review your previous AI interactions and system changes.</p>
        </header>

        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="group glass-panel rounded-xl p-5 hover:border-primary/30 transition-all flex items-start gap-4">
              <div className="p-2 rounded bg-primary/10 text-primary">
                <span className="material-symbols-outlined">
                  {item.type === 'refactor' ? 'auto_fix_high' : item.type === 'search' ? 'public' : item.type === 'commit' ? 'account_tree' : 'shield_lock'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{item.time}</span>
                    <button 
                      onClick={() => pushToTrackCodex(item)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2 py-1 bg-security-purple/20 text-security-purple border border-security-purple/30 rounded text-[9px] font-bold uppercase transition-all hover:bg-security-purple/30"
                    >
                      <span className="material-symbols-outlined !text-[14px]">transit_enterexit</span>
                      Push
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
