
import React, { useState, useMemo } from 'react';

interface GitFile {
  name: string;
  path: string;
  status: 'M' | 'A' | 'D';
  staged: boolean;
}

interface Commit {
  id: string;
  message: string;
  author: string;
  time: string;
  branch: string;
}

interface Branch {
  name: string;
  color: string;
  commits: Commit[];
}

const GitView: React.FC = () => {
  const [activeBranch, setActiveBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommiting, setIsCommiting] = useState(false);

  const [files, setFiles] = useState<GitFile[]>([
    { name: 'App.tsx', path: 'src/components', status: 'M', staged: false },
    { name: 'global.css', path: 'src', status: 'M', staged: false },
    { name: 'utils.ts', path: 'src/lib', status: 'D', staged: false },
    { name: 'WorkspaceView.tsx', path: 'src/components/views', status: 'M', staged: true },
    { name: 'geminiService.ts', path: 'src/services', status: 'M', staged: true },
  ]);

  const [history, setHistory] = useState<Branch[]>([
    {
      name: 'main',
      color: '#00e6bb',
      commits: [
        { id: 'e5f6g7h', message: 'Initial commit', author: 'forge_dev', time: '2 days ago', branch: 'main' },
        { id: 'a1b2c3d', message: 'Setup project structure', author: 'forge_dev', time: '1 day ago', branch: 'main' },
        { id: 'z9y8x7w', message: 'feat: add core components', author: 'forge_dev', time: '4 hours ago', branch: 'main' },
      ]
    },
    {
      name: 'feature/auth-hooks',
      color: '#a34fff',
      commits: [
        { id: 'b9d8c7a', message: 'feat: implement useAuth hook', author: 'forge_dev', time: '2 hours ago', branch: 'feature/auth-hooks' },
        { id: 'k2j1i0h', message: 'fix: auth context provider', author: 'forge_dev', time: '1 hour ago', branch: 'feature/auth-hooks' },
      ]
    },
    {
      name: 'develop',
      color: '#3b82f6',
      commits: [
        { id: 'v5u4t3s', message: 'chore: update dependencies', author: 'forge_dev', time: '5 hours ago', branch: 'develop' },
      ]
    }
  ]);

  // Fix: Added useMemo to calculate allCommits from history branches
  const allCommits = useMemo(() => {
    return history.flatMap(branch => branch.commits);
  }, [history]);

  const toggleStage = (index: number) => {
    const newFiles = [...files];
    newFiles[index].staged = !newFiles[index].staged;
    setFiles(newFiles);
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setIsCommiting(true);
    await new Promise(r => setTimeout(r, 600));

    const newCommit: Commit = {
      id: Math.random().toString(16).slice(2, 9),
      message: commitMessage,
      author: 'forge_user',
      time: 'Just now',
      branch: activeBranch
    };

    setHistory(prev => prev.map(b => {
      if (b.name === activeBranch) return { ...b, commits: [...b.commits, newCommit] };
      return b;
    }));

    setFiles(prev => prev.filter(f => !f.staged));
    setCommitMessage('');
    setIsCommiting(false);
  };

  const pushToTrackCodex = () => {
    const data = {
      type: 'git_sync',
      branch: activeBranch,
      staged: files.filter(f => f.staged),
      timestamp: new Date().toISOString()
    };
    const encodedData = btoa(JSON.stringify(data));
    window.open(`https://trackcodex.workspace/import?payload=${encodedData}`, '_blank');
  };

  const stagedFiles = files.filter(f => f.staged);
  const unstagedFiles = files.filter(f => !f.staged);

  return (
    <div className="flex-1 flex overflow-hidden bg-background-dark/80">
      {/* Sidebar: IDE Style Source Control */}
      <aside className="w-[320px] border-r border-border-dark flex flex-col bg-[#0d1312]">
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <h2 className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Source Control</h2>
          <div className="flex items-center gap-2 text-white/40">
            <button className="hover:text-white transition-colors"><span className="material-symbols-outlined !text-[18px]">view_list</span></button>
            <button className="hover:text-white transition-colors"><span className="material-symbols-outlined !text-[18px]">more_horiz</span></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {/* Commit Box */}
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Message (Enter to commit)"
                className="w-full bg-[#1a2423] border border-border-dark rounded-md p-3 text-[12px] outline-none min-h-[100px] focus:border-primary/50 transition-all resize-none placeholder:text-white/10 text-white/80"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleCommit}
                disabled={!commitMessage.trim() || isCommiting}
                className="flex-1 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded text-[12px] font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span className={`material-symbols-outlined !text-[16px] ${isCommiting ? 'animate-spin' : ''}`}>
                  {isCommiting ? 'sync' : 'check'}
                </span>
                Commit
              </button>
              <button className="px-3 py-2 bg-[#1a2423] hover:bg-white/5 border border-border-dark rounded text-white/60 transition-all">
                <span className="material-symbols-outlined !text-[16px]">refresh</span>
              </button>
            </div>
          </div>

          {/* Changes Section */}
          {unstagedFiles.length > 0 && (
            <div className="space-y-1">
              <button className="flex items-center gap-2 w-full text-left text-[11px] font-bold text-white/40 uppercase mb-2 group">
                <span className="material-symbols-outlined !text-[14px] transition-transform group-hover:rotate-90">expand_more</span>
                Changes <span className="bg-white/5 px-1.5 rounded ml-1">{unstagedFiles.length}</span>
              </button>
              {unstagedFiles.map((file, i) => (
                <div key={file.name} className="flex items-center gap-3 px-2 py-1.5 hover:bg-white/5 rounded-md group cursor-pointer transition-colors" onClick={() => toggleStage(files.indexOf(file))}>
                  <span className={`material-symbols-outlined !text-[18px] ${file.status === 'M' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {file.name.endsWith('.tsx') ? 'code' : file.name.endsWith('.css') ? 'css' : 'description'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white/70 truncate">{file.name}</p>
                    <p className="text-[10px] text-white/20 truncate">{file.path}</p>
                  </div>
                  <span className={`text-[11px] font-bold ${file.status === 'M' ? 'text-yellow-500' : 'text-red-500'}`}>{file.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Staged Section */}
          {stagedFiles.length > 0 && (
            <div className="space-y-1">
              <button className="flex items-center gap-2 w-full text-left text-[11px] font-bold text-white/40 uppercase mb-2 group">
                <span className="material-symbols-outlined !text-[14px] transition-transform group-hover:rotate-90">expand_more</span>
                Staged Changes <span className="bg-white/5 px-1.5 rounded ml-1">{stagedFiles.length}</span>
              </button>
              {stagedFiles.map((file, i) => (
                <div key={file.name} className="flex items-center gap-3 px-2 py-1.5 hover:bg-white/5 rounded-md group cursor-pointer transition-colors" onClick={() => toggleStage(files.indexOf(file))}>
                  <span className="material-symbols-outlined !text-[18px] text-primary">description</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white/70 truncate">{file.name}</p>
                    <p className="text-[10px] text-white/20 truncate">{file.path}</p>
                  </div>
                  <span className="text-[11px] font-bold text-primary">M</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Footer Action */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={pushToTrackCodex}
            className="w-full py-4 bg-security-purple text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-[0_0_30px_rgba(163,79,255,0.3)] flex items-center justify-center gap-3 active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="material-symbols-outlined !text-[16px] rotate-[-45deg]">transit_enterexit</span>
            Push to TrackCodex
          </button>
        </div>
      </aside>

      {/* Main Graph Content */}
      <main className="flex-1 relative flex flex-col bg-[#101817]">
        <header className="p-4 border-b border-border-dark flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_#00e6bb] animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{activeBranch.toUpperCase()}</span>
            </div>
            <button className="text-[10px] text-white/20 hover:text-white transition-colors uppercase font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined !text-sm">add</span>
              New Branch
            </button>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-white/10 font-mono">
            <span>FETCH: 42ms</span>
            <div className="h-3 w-px bg-white/5"></div>
            <span>OLLAMA_GIT_BACKEND</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar relative bg-[radial-gradient(#1a2423_1px,transparent_1px)] [background-size:20px_20px]">
          <div className="min-h-full p-16 flex gap-20 items-start relative">
            <svg className="absolute inset-0 pointer-events-none w-full h-full">
              {history.map((branch, bIdx) => {
                const x = 160 + bIdx * 240;
                return (
                  <path 
                    key={branch.name}
                    d={`M ${x} 0 L ${x} 1000`} 
                    stroke={branch.color} 
                    strokeWidth="2" 
                    strokeDasharray="4 4" 
                    className="opacity-20"
                  />
                );
              })}
            </svg>

            {history.map((branch, bIdx) => (
              <div key={branch.name} className="relative z-10 flex flex-col items-center gap-12 w-48">
                <div 
                  onClick={() => setActiveBranch(branch.name)}
                  className={`group cursor-pointer transition-all ${activeBranch === branch.name ? 'scale-105' : 'opacity-30 hover:opacity-100'}`}
                >
                  <div 
                    className="size-16 rounded-2xl border-2 flex items-center justify-center transition-all group-hover:shadow-2xl mb-4 relative overflow-hidden" 
                    style={{ 
                      borderColor: branch.color, 
                      backgroundColor: activeBranch === branch.name ? `${branch.color}15` : '#1a2423',
                      boxShadow: activeBranch === branch.name ? `0 0 30px ${branch.color}20` : 'none'
                    }}
                  >
                    <div className="absolute inset-0 opacity-10" style={{ background: branch.color }}></div>
                    <span className="material-symbols-outlined !text-3xl" style={{ color: branch.color }}>
                      {activeBranch === branch.name ? 'radio_button_checked' : 'account_tree'}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-center" style={{ color: branch.color }}>{branch.name}</p>
                </div>

                <div className="flex flex-col gap-10 w-full items-center">
                  {branch.commits.map((commit, cIdx) => (
                    <div key={commit.id} className="group relative flex flex-col items-center">
                      <div 
                        className="size-4 rounded-full border-2 border-white/10 bg-[#101817] group-hover:scale-125 transition-all cursor-pointer relative z-20"
                        style={{ borderColor: activeBranch === branch.name ? branch.color : undefined }}
                      >
                         <div className="absolute inset-0 rounded-full scale-50 group-hover:scale-100 transition-transform" style={{ backgroundColor: branch.color }}></div>
                      </div>
                      
                      <div className="absolute top-[-4px] left-full ml-6 w-56 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none z-50">
                        <div className="glass-panel p-4 rounded-xl border-white/10 bg-[#1a2423] shadow-2xl">
                          <p className="text-[10px] font-mono text-primary mb-1 uppercase tracking-tighter">#{commit.id}</p>
                          <p className="text-xs font-bold text-white mb-3 leading-snug">{commit.message}</p>
                          <div className="flex items-center justify-between text-[8px] text-white/30 uppercase font-bold border-t border-white/5 pt-2">
                            <span>{commit.author}</span>
                            <span>{commit.time}</span>
                          </div>
                        </div>
                      </div>

                      {cIdx < branch.commits.length - 1 && (
                        <div className="h-10 w-[2px] bg-white/5 mt-1"></div>
                      )}
                    </div>
                  ))}
                  <div className="size-4 rounded-full border-2 border-dashed border-white/5 bg-transparent"></div>
                </div>

                {activeBranch !== branch.name && branch.commits.length > 0 && (
                  <button className="mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-white/30 hover:text-primary hover:border-primary/40 transition-all uppercase tracking-widest hover:bg-primary/5">
                    Merge to HEAD
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <footer className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
               <span className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">Status:</span>
               <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Repository Clean</span>
             </div>
             <div className="h-3 w-px bg-white/10"></div>
             <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
               <span className="material-symbols-outlined !text-[14px]">history</span>
               <span>{allCommits.length} COMMITS</span>
             </div>
          </div>
          <p className="text-[9px] text-white/10 font-mono uppercase tracking-[0.3em] font-medium italic">Integrated Forge Environment</p>
        </footer>
      </main>
    </div>
  );
};

export default GitView;
