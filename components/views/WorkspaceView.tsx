
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getRefactorSuggestion } from '../../services/geminiService';

const highlightCode = (text: string) => {
  const patterns = [
    { regex: /\b(const|let|var|import|from|export|default|function|return|if|else|await|async|type|interface|enum|class|extends)\b/g, class: 'text-primary' },
    { regex: /\b(useState|useEffect|useContext|useReducer|useCallback|useMemo|useRef|useLayoutEffect)\b/g, class: 'text-yellow-400' },
    { regex: /(['"`])(.*?)\1/g, class: 'text-orange-400' },
    { regex: /\/\/.*$/gm, class: 'text-gray-500 italic' },
    { regex: /\b(\d+)\b/g, class: 'text-purple-400' },
  ];

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  patterns.forEach(p => {
    html = html.replace(p.regex, (match) => `<span class="${p.class}">${match}</span>`);
  });

  return html;
};

const highlightTerminalText = (text: string) => {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Define patterns in order of specificity
  const patterns = [
    // URLs: High-visibility cyan with underline
    { 
      regex: /(https?:\/\/[^\s\)]+)/g, 
      class: 'text-cyan-400 underline underline-offset-2 cursor-pointer hover:text-primary transition-colors' 
    },
    // File Paths: Emerald green, italic for clear identification
    { 
      regex: /((?:\/|\.\/|\.\.\/|~|[\w]:\\)[\w\-._\/\\ ]+\.[a-zA-Z0-9]+)/g, 
      class: 'text-emerald-400 italic font-semibold' 
    },
    // JSON Keys: Amber/Yellow for keys in objects
    { 
      regex: /("[^"]+")(?=\s*:)/g, 
      class: 'text-amber-200 font-medium' 
    },
    // JSON String Values: Orange for string values
    { 
      regex: /(: \s*)("[^"]+")/g, 
      class: '$1<span class="text-orange-400">$2</span>' 
    },
    // Numeric constants: Purple
    { 
      regex: /\b(\d+(?:\.\d+)?)\b/g, 
      class: 'text-purple-400' 
    },
    // Booleans and Null: Indigo/Blue
    { 
      regex: /\b(true|false|null)\b/g, 
      class: 'text-indigo-400 font-bold' 
    },
    // System Tags: [INFO], [SUCCESS], etc.
    { 
      regex: /(\[[A-Z\s_-]+\])/g, 
      class: 'text-white/40 font-bold tracking-widest text-[9px]' 
    },
    // Brackets and Punctuation: Dimmed to reduce noise
    { 
      regex: /[\[\]\{\}]/g, 
      class: 'text-white/10' 
    }
  ];

  patterns.forEach(p => {
    if (p.class.includes('$')) {
      // Use capture group replacement for complex structures like JSON values
      html = html.replace(p.regex, p.class);
    } else {
      // Direct span wrapping
      html = html.replace(p.regex, `<span class="${p.class}">$1</span>`);
    }
  });

  return html;
};

const CodeBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const lines = useMemo(() => code.split('\n'), [code]);
  const highlightedHtml = useMemo(() => highlightCode(code), [code]);

  return (
    <div className="group my-4 bg-background-dark/80 rounded-lg border border-border-dark overflow-hidden shadow-lg transition-all hover:border-primary/30">
      <div className="flex justify-between items-center px-3 py-1.5 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary/40"></span>
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{lang || 'code'}</span>
        </div>
      </div>
      <div className="flex font-mono text-xs leading-relaxed overflow-x-auto custom-scrollbar">
        <div className="py-4 px-3 text-right text-white/20 select-none border-r border-white/5 bg-black/20 shrink-0 min-w-[3rem]">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="py-4 pl-4 pr-6 flex-1">
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        </pre>
      </div>
    </div>
  );
};

type TerminalMessageType = 'input' | 'output' | 'error' | 'success' | 'warning' | 'info';

interface TerminalLine {
  type: TerminalMessageType;
  content: string;
  timestamp: string;
}

interface SavedSession {
  id: string;
  name: string;
  history: TerminalLine[];
  code: string;
  timestamp: string;
}

const COMMANDS = ['ls', 'help', 'refactor', 'clear', 'git', 'audit', 'cat', 'status', 'format', 'whoami', 'version', 'date', 'forge', 'track', 'session'];
const FILES = ['Managing State.tsx', 'api.ts', 'App.tsx', 'index.tsx', 'package.json', 'styles.css', 'README.md', 'forge.config.json'];

const INITIAL_CODE = `import React, { useState, useEffect } from 'react';

const Counter = () => {
const [count,setCount]=useState(0);

useEffect(()=>{
console.log("Mounted");
},[]);

return (
<div onClick={()=>setCount(c=>c+1)}>
Count: {count}
</div>
);
};

export default Counter;`;

const WorkspaceView: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [currentCode, setCurrentCode] = useState(INITIAL_CODE);
  const [suggestion, setSuggestion] = useState<{ explanation: string, refactoredCode: string } | null>(null);
  const [terminalHeight, setTerminalHeight] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    { type: 'success', content: '[SUCCESS] Forge Shell v1.0.4 (stable) - AI Kernel Initialized', timestamp: new Date().toLocaleTimeString() },
    { type: 'info', content: '[SYSTEM] Connected to local node: 127.0.0.1:11434 at https://forge.local/api', timestamp: new Date().toLocaleTimeString() },
    { type: 'info', content: '[SYSTEM] config path: ~/.forge/config.json', timestamp: new Date().toLocaleTimeString() },
    { type: 'info', content: 'Type "help" for a list of available commands.', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [tabMatches, setTabMatches] = useState<string[]>([]);
  const [tabMatchIdx, setTabMatchIdx] = useState(0);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [showSessionMenu, setShowSessionMenu] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('forge_terminal_sessions');
    if (stored) {
      try {
        setSavedSessions(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load sessions");
      }
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const saveSession = (name: string = `Session ${new Date().toLocaleTimeString()}`) => {
    const newSession: SavedSession = {
      id: crypto.randomUUID(),
      name,
      history: terminalHistory,
      code: currentCode,
      timestamp: new Date().toISOString()
    };
    const updated = [newSession, ...savedSessions].slice(0, 10);
    setSavedSessions(updated);
    localStorage.setItem('forge_terminal_sessions', JSON.stringify(updated));
    return newSession;
  };

  const loadSession = (session: SavedSession) => {
    setTerminalHistory(session.history);
    setCurrentCode(session.code);
    setShowSessionMenu(false);
    addLog('info', `[SYSTEM] Loaded session: ${session.name}`);
  };

  const addLog = (type: TerminalMessageType, content: string) => {
    setTerminalHistory(prev => [...prev, { type, content, timestamp: new Date().toLocaleTimeString() }]);
  };

  const pushToTrackCodex = (customData?: any) => {
    const data = customData || {
      type: 'code_refactor',
      explanation: suggestion?.explanation || 'Manual push from terminal',
      code: suggestion?.refactoredCode || currentCode,
      source: 'Managing State.tsx'
    };
    const encodedData = btoa(JSON.stringify(data));
    window.open(`https://trackcodex.workspace/import?payload=${encodedData}`, '_blank');
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = terminalInput.trim();
    if (!input) return;

    const timestamp = new Date().toLocaleTimeString();
    setTerminalHistory(prev => [...prev, { type: 'input', content: input, timestamp }]);
    const parts = input.split(' ');
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case 'ls': addLog('output', FILES.join('  ')); break;
      case 'help': addLog('info', `[HELP] Available commands: ${COMMANDS.join(', ')}`); break;
      case 'clear': setTerminalHistory([]); break;
      case 'format': handleFormat(); addLog('success', '[SUCCESS] Active buffer formatted successfully.'); break;
      case 'refactor': handleRefactor(); addLog('info', '[AI] Initiating Gemini Reasoner...'); break;
      case 'track': pushToTrackCodex(); addLog('success', '[SYSTEM] Redirecting to https://trackcodex.workspace...'); break;
      case 'session':
        const sub = parts[1]?.toLowerCase();
        if (sub === 'save') {
          const name = parts.slice(2).join(' ') || undefined;
          saveSession(name);
          addLog('success', `{ "status": "ok", "action": "save", "name": "${name || 'Default'}", "path": "~/.forge/sessions/" }`);
        } else if (sub === 'list') {
          addLog('output', savedSessions.length > 0 ? savedSessions.map(s => `[${s.name}] - ${new Date(s.timestamp).toLocaleString()}`).join('\n') : 'No saved sessions found.');
        } else if (sub === 'load') {
          const name = parts.slice(2).join(' ');
          const session = savedSessions.find(s => s.name === name);
          if (session) loadSession(session); else addLog('error', `[ERROR] Session not found: ${name}`);
        } else {
          addLog('info', '[USAGE] session <save|list|load> [name]');
        }
        break;
      case 'cat':
        const fileName = parts[1];
        if (FILES.includes(fileName)) addLog('output', `[FS] Reading ./src/${fileName}...`); else addLog('error', `[FS_ERROR] File not found "${fileName || 'undefined'}"`);
        break;
      case 'whoami': addLog('output', 'forge_user_0x42'); break;
      case 'version': addLog('success', '{ "core": "2.4.0", "engine": "Ollama/0.3.1", "license": "MIT" }'); break;
      default: addLog('error', `[SHELL] Command not found: ${cmd}`);
    }
    setTerminalInput('');
    setTabMatches([]);
    setTabMatchIdx(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const input = terminalInput;
      const parts = input.split(' ');
      const lastPart = parts[parts.length - 1];

      if (tabMatches.length > 0 && lastPart === tabMatches[tabMatchIdx]) {
        const nextIdx = (tabMatchIdx + 1) % tabMatches.length;
        setTabMatchIdx(nextIdx);
        parts[parts.length - 1] = tabMatches[nextIdx];
        setTerminalInput(parts.join(' '));
        return;
      }

      let matches: string[] = [];
      if (parts.length === 1 && parts[0] !== '') {
        matches = COMMANDS.filter(c => c.startsWith(parts[0].toLowerCase()));
      } else if (parts.length > 1) {
        matches = FILES.filter(f => f.toLowerCase().startsWith(lastPart.toLowerCase()));
      }

      if (matches.length > 0) {
        setTabMatches(matches);
        setTabMatchIdx(0);
        parts[parts.length - 1] = matches[0];
        setTerminalInput(parts.join(' '));
      }
    } else if (e.key !== 'Tab') {
      if (tabMatches.length > 0) {
        setTabMatches([]);
        setTabMatchIdx(0);
      }
    }
  };

  const handleFormat = async () => {
    if (isFormatting) return;
    setIsFormatting(true);
    await new Promise(r => setTimeout(r, 600));
    const formatted = currentCode
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .map(line => {
        if (line.startsWith('return') || line.startsWith('const') || line.startsWith('useEffect')) return '  ' + line;
        if (line.startsWith('<') || line.startsWith('Count:')) return '    ' + line;
        if (line === '};' || line === '});' || line === ');') return '  ' + line;
        if (line === 'export default Counter;') return '\n' + line;
        return line;
      })
      .join('\n');
    setCurrentCode(formatted);
    setIsFormatting(false);
  };

  const handleRefactor = async () => {
    setIsAnalyzing(true);
    const result = await getRefactorSuggestion(currentCode);
    if (result) setSuggestion(result);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const getTerminalIcon = (type: TerminalMessageType) => {
    switch (type) {
      case 'error': return 'error';
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'input': return 'navigate_next';
      default: return 'radio_button_checked';
    }
  };

  const getTerminalColor = (type: TerminalMessageType) => {
    switch (type) {
      case 'input': return 'text-white/40';
      case 'error': return 'text-red-400';
      case 'success': return 'text-primary';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-slate-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary/60">description</span>
              Managing State.tsx
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded border border-white/5">
              <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Active Buffer</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isTerminalOpen && (
              <button 
                onClick={() => setIsTerminalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all mr-4"
              >
                <span className="material-symbols-outlined !text-sm">terminal</span>
                Show Shell
              </button>
            )}
            <button 
              onClick={handleFormat}
              disabled={isFormatting}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined !text-sm ${isFormatting ? 'animate-spin' : ''}`}>
                {isFormatting ? 'sync' : 'format_align_left'}
              </span>
              {isFormatting ? 'Formatting...' : 'Format File'}
            </button>
            <button 
              onClick={handleRefactor}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-lg font-bold text-[10px] uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined !text-sm ${isAnalyzing ? 'animate-spin' : ''}`}>
                {isAnalyzing ? 'sync' : 'auto_fix_high'}
              </span>
              {isAnalyzing ? 'Analyzing...' : 'Analyze & Optimize'}
            </button>
          </div>
        </div>

        <CodeBlock code={currentCode} lang="tsx" />

        {suggestion && (
          <div className="glass-panel rounded-xl p-6 border-primary/30 bg-primary/[0.02] shadow-2xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary/80">Optimization Suggestion</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/20 font-mono tracking-tighter">READY FOR EXPORT</span>
              </div>
            </div>
            <p className="text-xs text-white/60 mb-6 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/5 italic">"{suggestion.explanation}"</p>
            <CodeBlock code={suggestion.refactoredCode} lang="tsx" />
            <div className="mt-6 flex gap-3">
              <button className="flex-1 py-3 bg-primary text-background-dark rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,230,187,0.15)]">
                Apply to File
              </button>
              <button 
                onClick={() => pushToTrackCodex()}
                className="flex-1 py-3 bg-security-purple text-white rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,79,255,0.15)]"
              >
                <span className="material-symbols-outlined !text-sm">transit_enterexit</span>
                Push to TrackCodex
              </button>
            </div>
          </div>
        )}
      </div>

      {isTerminalOpen && (
        <>
          <div 
            className="h-1 bg-border-dark cursor-row-resize hover:bg-primary/50 transition-colors z-30"
            onMouseDown={() => setIsResizing(true)}
          />

          <div 
            style={{ height: `${terminalHeight}px` }} 
            className="bg-background-dark/95 backdrop-blur-xl border-t border-border-dark flex flex-col shrink-0 animate-in slide-in-from-bottom-full duration-300"
          >
            <div className="flex items-center justify-between px-4 py-1.5 bg-black/40 border-b border-white/5">
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined !text-[14px] text-primary/60">terminal</span>
                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Forge Shell</span>
              </div>
              <div className="flex items-center gap-3 relative">
                <div className="flex items-center gap-1 border border-white/5 rounded-md bg-white/[0.02] p-0.5">
                  <button onClick={() => saveSession()} className="p-1 hover:text-primary transition-colors text-white/30" title="Save Current Session">
                    <span className="material-symbols-outlined !text-[14px]">save</span>
                  </button>
                  <div className="w-[1px] h-3 bg-white/5 mx-0.5"></div>
                  <button onClick={() => setShowSessionMenu(!showSessionMenu)} className={`p-1 hover:text-primary transition-colors ${showSessionMenu ? 'text-primary' : 'text-white/30'}`} title="Load Saved Sessions">
                    <span className="material-symbols-outlined !text-[14px]">history</span>
                  </button>
                </div>

                {showSessionMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 glass-panel rounded-lg shadow-2xl z-40 border-primary/20 p-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Saved Sessions</span>
                      <button onClick={() => setShowSessionMenu(false)} className="text-white/20 hover:text-white">
                        <span className="material-symbols-outlined !text-[12px]">close</span>
                      </button>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                      {savedSessions.length > 0 ? savedSessions.map((s) => (
                        <button key={s.id} onClick={() => loadSession(s)} className="w-full text-left p-2 rounded hover:bg-white/5 flex flex-col gap-0.5 group">
                          <span className="text-[10px] font-bold text-white/70 group-hover:text-primary truncate">{s.name}</span>
                          <span className="text-[8px] text-white/20 font-mono uppercase">{new Date(s.timestamp).toLocaleString()}</span>
                        </button>
                      )) : <div className="p-4 text-center text-[9px] text-white/20 italic">No saved sessions yet.</div>}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => pushToTrackCodex()}
                  className="px-3 py-1 bg-security-purple/10 border border-security-purple/30 rounded text-security-purple text-[9px] font-bold hover:bg-security-purple/20 transition-all tracking-wider flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined !text-[12px]">transit_enterexit</span>
                  PUSH TO TRACKCODEX
                </button>
                
                <span className="text-[9px] text-white/20 font-mono">UTF-8</span>
                <div className="size-1.5 rounded-full bg-primary/40"></div>
                <div className="w-[1px] h-3 bg-white/5 mx-1"></div>
                <button 
                  onClick={() => setIsTerminalOpen(false)}
                  className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-all text-white/20"
                  title="Close Terminal (Ctrl + `)"
                >
                  <span className="material-symbols-outlined !text-[16px]">cancel</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] custom-scrollbar">
              {terminalHistory.map((line, i) => (
                <div key={i} className={`flex items-start gap-3 mb-2 group ${getTerminalColor(line.type)}`}>
                  <span className="shrink-0 text-[14px] material-symbols-outlined opacity-40 group-hover:opacity-100 transition-opacity mt-0.5">
                    {getTerminalIcon(line.type)}
                  </span>
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap leading-relaxed inline" dangerouslySetInnerHTML={{ __html: highlightTerminalText(line.content) }} />
                    <span className="text-[9px] opacity-0 group-hover:opacity-30 ml-4 font-mono transition-opacity">{line.timestamp}</span>
                  </div>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleTerminalSubmit} className="flex items-center px-4 h-10 bg-black/60 border-t border-white/5 group">
              <span className="text-primary mr-3 text-[14px] font-bold material-symbols-outlined group-focus-within:animate-pulse">navigate_next</span>
              <input 
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-[11px] font-mono text-white placeholder:text-white/10"
                placeholder="Type command... (session <save|load>, Tab to cycle, Ctrl+` to toggle)"
                spellCheck={false}
                autoComplete="off"
              />
              {tabMatches.length > 1 && (
                <div className="text-[9px] font-mono text-white/30 bg-white/5 px-2 py-1 rounded flex items-center gap-2">
                  <span className="text-primary font-bold">{tabMatchIdx + 1}</span> / {tabMatches.length} matches
                </div>
              )}
            </form>
          </div>
        </>
      )}

      {isResizing && (
        <div 
          className="fixed inset-0 cursor-row-resize z-50"
          onMouseUp={() => setIsResizing(false)}
          onMouseMove={(e) => {
            const newHeight = window.innerHeight - e.clientY;
            if (newHeight > 100 && newHeight < window.innerHeight * 0.8) {
              setTerminalHeight(newHeight);
            }
          }}
        />
      )}
    </div>
  );
};

export default WorkspaceView;
