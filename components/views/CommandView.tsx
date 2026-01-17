
import React, { useState, useEffect } from 'react';
import { performUnifiedSearch } from '../../services/geminiService';

const CommandView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ synthesis: string, citations: any[] } | null>(null);
  const [savedQueries, setSavedQueries] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('forge_saved_queries');
    if (stored) {
      try {
        setSavedQueries(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved queries");
      }
    }
  }, []);

  const updateSavedQueries = (newQueries: string[]) => {
    setSavedQueries(newQueries);
    localStorage.setItem('forge_saved_queries', JSON.stringify(newQueries));
  };

  const handleSearch = async (searchQuery?: string) => {
    const activeQuery = searchQuery || query;
    if (!activeQuery.trim()) return;
    
    setQuery(activeQuery);
    setIsSearching(true);
    setResults(null);
    
    const data = await performUnifiedSearch(activeQuery);
    if (data) setResults(data);
    setIsSearching(false);
  };

  const handleSaveQuery = () => {
    if (!query.trim() || savedQueries.includes(query.trim())) return;
    updateSavedQueries([query.trim(), ...savedQueries]);
  };

  const handleDeleteQuery = (e: React.MouseEvent, qToDelete: string) => {
    e.stopPropagation();
    updateSavedQueries(savedQueries.filter(q => q !== qToDelete));
  };

  const clearHistory = () => {
    updateSavedQueries([]);
  };

  const pushToTrackCodex = () => {
    if (!results) return;
    const data = {
      type: 'search_result',
      query: query,
      content: results.synthesis,
      sources: results.citations,
      timestamp: new Date().toISOString()
    };
    const encodedData = btoa(JSON.stringify(data));
    window.open(`https://trackcodex.workspace/import?payload=${encodedData}`, '_blank');
  };

  const isCurrentQuerySaved = savedQueries.includes(query.trim());

  return (
    <div className="flex-1 flex flex-col h-full bg-background-dark relative overflow-hidden">
      {/* Search Header */}
      <div className="z-10 px-8 pt-8 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-xl p-1 neon-glow shadow-2xl bg-surface-dark/40 border-border-dark">
            <div className="flex items-center gap-3 px-4 h-14">
              <span className="material-symbols-outlined text-primary group-focus-within:animate-pulse">search</span>
              <input 
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg placeholder:text-white/10 font-medium text-white" 
                placeholder="Ask anything or query local repo..." 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSaveQuery}
                  disabled={!query.trim()}
                  className={`p-2 rounded-lg transition-all ${isCurrentQuerySaved ? 'text-primary bg-primary/10' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                >
                  <span className={`material-symbols-outlined !text-[20px] ${isCurrentQuerySaved ? 'fill-1' : ''}`}>
                    {isCurrentQuerySaved ? 'bookmark_added' : 'bookmark_add'}
                  </span>
                </button>
                <div className="h-6 w-px bg-border-dark mx-1"></div>
                <button 
                  onClick={() => handleSearch()}
                  disabled={isSearching || !query.trim()}
                  className="bg-primary text-background-dark px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isSearching ? (
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  )}
                  {isSearching ? 'EXEC' : 'EXECUTE'}
                </button>
              </div>
            </div>
            <div className="border-t border-border-dark/30 flex items-center justify-between px-4 py-2 bg-black/10">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary shadow-[0_0_5px_#00e6bb]"></span>
                  <span className="text-[9px] uppercase font-bold text-white/40">Web Grounding</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-security-purple shadow-[0_0_5px_#a34fff]"></span>
                  <span className="text-[9px] uppercase font-bold text-white/40">Local Intel</span>
                </div>
              </div>
              <div className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">
                Gemini-3-Pro-Grounding-V2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
          
          {/* Left Column: Results */}
          <div className="col-span-12 lg:col-span-8">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <div className="relative">
                  <div className="size-20 rounded-full border-2 border-primary/10 border-t-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary/40 text-3xl">bolt</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-primary font-bold text-sm uppercase tracking-[0.3em] animate-pulse">Grounding Pipeline Active</p>
                  <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest font-mono">Synthesizing multi-source intelligence...</p>
                </div>
              </div>
            ) : results ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="glass-panel rounded-xl p-8 bg-surface-dark/20 border-border-dark/50 shadow-2xl">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <h3 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                      <span className="material-symbols-outlined !text-[20px] text-primary">auto_awesome</span>
                      System Synthesis
                    </h3>
                    <button 
                      onClick={pushToTrackCodex}
                      className="group flex items-center gap-2 px-4 py-2 bg-security-purple text-white rounded-lg text-[10px] font-bold hover:brightness-110 transition-all tracking-[0.1em] shadow-[0_0_20px_rgba(163,79,255,0.2)]"
                    >
                      <span className="material-symbols-outlined !text-[14px]">transit_enterexit</span>
                      PUSH TO TRACKCODEX
                    </button>
                  </div>
                  
                  <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed font-sans">
                    <p className="whitespace-pre-wrap">{results.synthesis}</p>
                  </div>

                  <div className="mt-12 flex items-center gap-4">
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                    <span className="text-[9px] font-bold text-white/10 uppercase tracking-[0.5em]">End of Result</span>
                    <div className="h-[1px] flex-1 bg-white/5"></div>
                  </div>
                </div>
              </div>
            ) : (
              /* Idle State Mockup Match */
              <div className="flex flex-col items-center justify-center py-20 opacity-60">
                <div className="flex items-center gap-6 mb-4">
                  <span className="material-symbols-outlined text-[80px] text-white/10 font-light">search</span>
                  <div className="flex items-center text-[80px] font-display font-light text-white/20 tracking-[-0.1em] select-none">
                    <span className="mr-4">_</span>
                    <span className="material-symbols-outlined !text-[60px] text-primary/30">eco</span>
                    <span>RK</span>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xl font-medium text-white/40">System Ready</p>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-primary/40 font-bold">Unified Grounding Pipeline Active</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* SAVED SEARCHES CARD - Matches Mockup */}
            <div className="glass-panel rounded-xl border-white/5 bg-black/40 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary !text-[20px]">bookmark</span>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Saved Searches</h3>
                </div>
                {savedQueries.length > 0 && (
                  <button onClick={clearHistory} className="text-[9px] text-white/20 hover:text-red-400 uppercase font-bold transition-colors">
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="p-4">
                {savedQueries.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {savedQueries.map((q, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleSearch(q)}
                        className="group flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer relative"
                      >
                        <span className="material-symbols-outlined !text-sm text-white/10 group-hover:text-primary transition-colors">history</span>
                        <p className="text-[11px] font-medium text-white/40 group-hover:text-white truncate flex-1">{q}</p>
                        <button 
                          onClick={(e) => handleDeleteQuery(e, q)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all ml-2"
                        >
                          <span className="material-symbols-outlined !text-xs">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 px-2 text-center">
                    <p className="text-[11px] text-white/20 italic font-medium">No history buffer.</p>
                  </div>
                )}
              </div>
            </div>

            {/* GROUNDING SOURCES CARD */}
            {results && results.citations.length > 0 && (
              <div className="glass-panel rounded-xl p-5 animate-in fade-in slide-in-from-right-4 duration-700 bg-surface-dark/20 border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">link</span> Grounding Sources
                </h3>
                <div className="space-y-3">
                  {results.citations.map((citation, i) => (
                    <a 
                      key={i} 
                      href={citation.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block group p-3 rounded-lg bg-black/40 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded uppercase tracking-tighter">Source {i+1}</span>
                        <span className="material-symbols-outlined !text-xs text-white/10 group-hover:text-primary transition-colors">open_in_new</span>
                      </div>
                      <p className="text-xs font-semibold text-white/60 group-hover:text-white truncate">{citation.title}</p>
                      <p className="text-[9px] text-white/20 mt-1 truncate italic">{citation.url}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* System Info */}
            <div className="p-5 rounded-xl border border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">
                <span className="material-symbols-outlined !text-sm">verified</span>
                Node Compliance
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/30 uppercase">Grounding Confidence</span>
                  <span className="text-primary font-mono">98.4%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/40 w-[98.4%]"></div>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/30 uppercase">Token Latency</span>
                  <span className="text-primary font-mono">22ms</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandView;
