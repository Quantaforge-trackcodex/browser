
import React, { useState } from 'react';
import { SystemStats } from '../../types';
import { analyzeSecurity } from '../../services/geminiService';

interface LocalForgeViewProps {
  stats: SystemStats;
}

const LocalForgeView: React.FC<LocalForgeViewProps> = ({ stats }) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [vulns, setVulns] = useState<any[]>([]);

  const sampleCode = `import os\n\ndef login():\n    secret_key = "sk_live_51M..." # Line 42\n    return secret_key`;

  const runAudit = async () => {
    setIsAuditing(true);
    setVulns([]); // Clear previous results
    const result = await analyzeSecurity('main.py', sampleCode);
    if (result) setVulns(result.vulnerabilities || []);
    setIsAuditing(false);
  };

  const pushToTrackCodex = (v: any) => {
    const data = {
      type: 'security_vulnerability',
      file: 'main.py',
      finding: v,
      timestamp: new Date().toISOString()
    };
    const encodedData = btoa(JSON.stringify(data));
    window.open(`https://trackcodex.workspace/import?payload=${encodedData}`, '_blank');
  };

  return (
    <div className="flex-1 flex overflow-hidden p-6 gap-6">
      {/* Sidebar Explorer */}
      <aside className="w-64 border-r border-border-dark flex flex-col gap-6 pr-6">
        <div className="p-4 bg-surface-dark border border-border-dark rounded-xl">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-background-dark flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined">folder_managed</span>
            </div>
            <div>
              <p className="text-sm font-bold truncate">Project-Centauri</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Local Repository</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 text-xs custom-scrollbar">
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Explorer</p>
          {['src', 'auth_handler.py', 'main.py', 'utils.py', 'tests', 'config.json'].map(file => (
            <div 
              key={file} 
              className={`group flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors ${file === 'main.py' ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <span className="material-symbols-outlined text-sm">{file.includes('.') ? 'description' : 'folder'}</span>
              <span className="flex-1">{file}</span>
              {file === 'main.py' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); runAudit(); }}
                  title="Run Security Audit"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-primary/20 rounded"
                >
                  <span className="material-symbols-outlined !text-[14px]">shield_lock</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Terminal View */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex border-b border-border-dark gap-8">
            <button className="flex items-center gap-2 border-b-2 border-primary text-primary pb-3 px-1 transition-all">
              <span className="material-symbols-outlined text-sm font-bold">security</span>
              <span className="text-sm font-bold">Security Analysis</span>
            </button>
            <button className="flex items-center gap-2 border-b-2 border-transparent text-slate-500 hover:text-slate-300 pb-3 px-1 transition-all">
              <span className="material-symbols-outlined text-sm">bug_report</span>
              <span className="text-sm font-bold">Debug Engine</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
            <span className="material-symbols-outlined text-xs">location_on</span> Localhost:11434 (Encrypted)
          </div>
        </div>

        <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col shadow-2xl relative">
          <div className="p-4 border-b border-border-dark bg-background-dark/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/50"></div>
                <div className="size-3 rounded-full bg-yellow-500/50"></div>
                <div className="size-3 rounded-full bg-green-500/50"></div>
              </div>
              <div className="h-4 w-px bg-border-dark mx-2"></div>
              <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-xs text-primary">terminal</span>
                ollama_exec --model llama3.1-8b --target ./src/main.py
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">GPU-ACCELERATED</span>
              <button 
                onClick={runAudit} 
                disabled={isAuditing}
                className={`px-3 py-1 rounded text-[10px] font-bold border transition-all ${
                  isAuditing 
                  ? 'bg-primary/10 text-primary/50 border-primary/10 cursor-not-allowed' 
                  : 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/30'
                }`}
              >
                {isAuditing ? 'RUNNING AUDIT...' : 'RE-RUN AUDIT'}
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar space-y-4">
            <div className="text-slate-500 flex gap-4"><span className="w-12 text-right shrink-0 opacity-30">001</span><p>[INFO] Initializing Secure Context</p></div>
            <div className="text-slate-500 flex gap-4"><span className="w-12 text-right shrink-0 opacity-30">002</span><p>[SYSTEM] Network status: <span className="text-red-400">DISCONNECTED</span> (Air-gap enforced)</p></div>
            <div className="text-primary flex gap-4 font-bold"><span className="w-12 text-right shrink-0 opacity-30 italic">003</span><p>&gt;&gt;&gt; STARTING SECURITY AUDIT: ./src/main.py</p></div>
            
            {isAuditing ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                <span className="material-symbols-outlined text-5xl text-primary animate-spin">shield_lock</span>
                <p className="text-primary font-bold animate-pulse tracking-widest text-xs uppercase">Analyzing source for threat vectors...</p>
              </div>
            ) : vulns.length > 0 ? (
              vulns.map((v, i) => (
                <div key={i} className="text-slate-200 flex gap-4 bg-primary/5 p-4 rounded-lg border-l-2 border-primary animate-in fade-in slide-in-from-left-4">
                  <span className="w-12 text-right shrink-0 opacity-30">00{4+i}</span>
                  <div className="flex-1">
                    <p className="mb-2 font-bold text-primary uppercase text-xs tracking-tight">Potential Vulnerability - {v.type}</p>
                    <p className="text-xs text-white/70 leading-relaxed mb-4">{v.description}</p>
                    <div className="mt-4 flex gap-3">
                      <button className="px-4 py-1.5 bg-primary text-background-dark text-[10px] font-bold rounded uppercase tracking-wider hover:brightness-110 transition-all">Apply Fix</button>
                      <button 
                        onClick={() => pushToTrackCodex(v)}
                        className="px-4 py-1.5 bg-security-purple text-white text-[10px] font-bold rounded uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_15px_rgba(163,79,255,0.2)]"
                      >
                        Push to TrackCodex
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="relative">
                  <span className="material-symbols-outlined text-6xl text-white/10">verified_user</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-primary/20">lock</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white/40 italic text-sm mb-4">No audit results in current session buffer.</p>
                  <button 
                    onClick={runAudit}
                    className="group relative inline-flex items-center gap-2 bg-primary text-background-dark px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-[0.1em] hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,230,187,0.3)]"
                  >
                    <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">shield_lock</span>
                    Run Security Audit
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-30 pointer-events-none">
            <span className="text-[10px] font-mono">ENCRYPTION: AES-256</span>
            <span className="material-symbols-outlined text-xs">lock</span>
          </div>
        </div>
      </div>

      {/* Telemetry Sidebar */}
      <aside className="w-72 flex flex-col gap-6">
        <div className="bg-surface-dark rounded-xl border border-border-dark p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hardware Telemetry</h3>
          <div className="space-y-4">
            {[
              { label: 'GPU (RTX 4090)', val: stats.gpu, unit: '%' },
              { label: 'NPU (Neural Engine)', val: stats.npu, unit: '%' },
              { label: 'VRAM Allocation', val: 23, unit: 'GB', text: stats.vram }
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-[10px] mb-1 font-bold">
                  <span>{item.label}</span>
                  <span className="text-primary">{item.text || `${Math.round(item.val)}${item.unit}`}</span>
                </div>
                <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${item.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-surface-dark rounded-xl border border-border-dark p-5 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Code Sandbox Stats</h3>
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded bg-background-dark flex items-center justify-center text-primary"><span className="material-symbols-outlined">block</span></div>
              <div><p className="text-xs font-bold">0 Connections</p><p className="text-[10px] text-slate-500">Outgoing traffic blocked</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="size-10 rounded bg-background-dark flex items-center justify-center text-primary"><span className="material-symbols-outlined">description</span></div>
              <div><p className="text-xs font-bold">14 Files Loaded</p><p className="text-[10px] text-slate-500">Context: 32k tokens</p></div>
            </div>
          </div>
          <button className="w-full mt-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-all">Purge Cache & Re-Init</button>
        </div>
      </aside>
    </div>
  );
};

export default LocalForgeView;
