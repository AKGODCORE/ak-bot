import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Play, Layers, Code, Eye, 
  Settings, RefreshCw, Zap, 
  LayoutTemplate, Activity, 
  CheckCircle2, Maximize2, Minimize2, Save, Download
} from 'lucide-react';

// --- Styles for Orbital Animations ---
const globalStyles = `
  @keyframes orbit-1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes orbit-2 { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  .animate-orbit-slow { animation: orbit-1 20s linear infinite; }
  .animate-orbit-medium { animation: orbit-2 12s linear infinite; }
  .animate-orbit-fast { animation: orbit-1 4s linear infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  /* Hide Scrollbar */
  .scrollbar-none::-webkit-scrollbar { display: none; }
  .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Mock "AI" Generation Templates ---
const GENERATOR_TEMPLATES = {
  dashboard: `
    <div class="min-h-screen bg-[#0B0F19] text-white p-4 md:p-8 font-sans relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>
      <header class="relative z-10 flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div><h1 class="text-4xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">CyberDash v2.0</h1></div>
        <div class="flex gap-4"><button class="p-3 bg-white/5 rounded-full">🔔</button><div class="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full"></div></div>
      </header>
      <div class="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"><h3 class="text-gray-400">Users</h3><span class="text-3xl font-bold">24.5k</span></div>
        <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"><h3 class="text-gray-400">Revenue</h3><span class="text-3xl font-bold">$84k</span></div>
        <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"><h3 class="text-gray-400">Active</h3><span class="text-3xl font-bold">1.2k</span></div>
        <div class="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"><h3 class="text-gray-400">Health</h3><span class="text-3xl font-bold text-green-400">99%</span></div>
      </div>
    </div>
  `,
  landing: `
    <div class="min-h-screen bg-black text-white font-sans overflow-hidden relative">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 rounded-[100%] blur-[120px] pointer-events-none"></div>
      <nav class="fixed w-full z-50 bg-black/10 backdrop-blur-xl border-b border-white/5 px-6 h-20 flex items-center justify-between">
        <span class="text-2xl font-bold">AETHER</span>
        <button class="px-6 py-2 bg-white text-black rounded-full font-bold">Get Access</button>
      </nav>
      <main class="pt-40 px-6 text-center relative z-10">
        <h1 class="text-6xl md:text-8xl font-bold tracking-tight mb-8">Build the <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Impossible.</span></h1>
        <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-12">The next generation of digital architecture.</p>
        <div class="flex justify-center gap-4">
          <button class="px-8 py-4 bg-white text-black text-lg font-bold rounded-xl">Start Building</button>
          <button class="px-8 py-4 bg-white/5 border border-white/10 text-lg font-bold rounded-xl">Docs</button>
        </div>
      </main>
    </div>
  `
};

const OrbitalLogo = () => (
  <div className="relative w-10 h-10 flex items-center justify-center">
    <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-orbit-slow" style={{borderRightColor: 'transparent', borderBottomColor: 'transparent'}}/>
    <div className="absolute inset-1 border-2 border-purple-500/40 rounded-full animate-orbit-medium" style={{borderLeftColor: 'transparent', borderTopColor: 'transparent'}}/>
    <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />
  </div>
);

const AgentStep = ({ status, label, active }) => {
  const getIcon = () => {
    if (status === 'completed') return <CheckCircle2 className="text-emerald-400" size={18} />;
    if (status === 'active') return <Activity className="text-blue-400 animate-pulse" size={18} />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-800 bg-gray-900" />;
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${active ? 'bg-blue-500/5 border-blue-500/30 translate-x-2' : 'bg-transparent border-transparent opacity-50'}`}>
      {getIcon()}
      <span className={`text-sm font-medium ${active ? 'text-blue-200' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
};

const TerminalLine = ({ text, type = 'info' }) => {
  const colors = { info: 'text-gray-400', success: 'text-emerald-400', warning: 'text-amber-400', error: 'text-red-400', cmd: 'text-blue-400 font-bold' };
  return <div className={`font-mono text-xs mb-1.5 ${colors[type]}`}>{text}</div>;
};

export default function NexusBuilder() {
  const [activeTab, setActiveTab] = useState('editor');
  const [input, setInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('<!-- Waiting for Orbital Agent Input... -->');
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentState, setAgentState] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const terminalRef = useRef(null);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = globalStyles;
    document.head.appendChild(styleTag);
    const handleResize = () => setShowSidebar(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      document.head.removeChild(styleTag);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => { if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight; }, [logs]);

  const addLog = (text, type = 'info') => setLogs(prev => [...prev, { text, type, id: Date.now() + Math.random() }]);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setAgentState('planning');
    setLogs([]);
    
    addLog(`> ak_bot --init`, 'cmd');
    addLog('Establishing secure uplink...', 'info');
    await new Promise(r => setTimeout(r, 800));
    addLog(`INPUT: "${input}"`, 'info');

    await new Promise(r => setTimeout(r, 1200));
    setAgentState('architecting');
    addLog('Generating topology...', 'warning');

    await new Promise(r => setTimeout(r, 1500));
    setAgentState('coding');
    addLog('Writing codebase...', 'cmd');
    
    let targetCode = GENERATOR_TEMPLATES.dashboard;
    if (input.toLowerCase().includes('land') || input.toLowerCase().includes('page')) targetCode = GENERATOR_TEMPLATES.landing;
    setGeneratedCode(targetCode);
    
    await new Promise(r => setTimeout(r, 1000));
    setAgentState('reviewing');
    addLog('Verifying responsiveness...', 'success');
    
    setAgentState('done');
    setIsGenerating(false);
    setActiveTab('preview');
    addLog('Deployed.', 'success');
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-blue-500 selection:text-white relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-20 animate-orbit-slow"></div>
      </div>

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-30 ${showSidebar ? 'w-[85vw] sm:w-80 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'} bg-[#0A0A0A]/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-500 ease-in-out flex-shrink-0 shadow-2xl lg:shadow-none overflow-hidden`}>
        <div className="p-6 border-b border-white/5 flex items-center gap-4 min-w-[320px]">
          <OrbitalLogo />
          <div>
            <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">AK BOt</h1>
            <p className="text-[10px] text-blue-400 font-mono uppercase tracking-widest">Orbital Engine v2.0</p>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-10 min-w-[320px]">
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Settings size={12} /> Core Config</h3>
            <div className="bg-white/5 p-1 rounded-xl border border-white/5"><div className="text-sm p-2 text-gray-300">Llama-3-70b-Orbital</div></div>
          </section>
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Layers size={12} /> Sequence</h3>
            <div className="space-y-1">
              <AgentStep status={agentState === 'planning' ? 'active' : agentState !== 'idle' ? 'completed' : 'idle'} label="Analysis" active={agentState === 'planning'} />
              <AgentStep status={agentState === 'architecting' ? 'active' : (['coding','reviewing','done'].includes(agentState)) ? 'completed' : 'idle'} label="Architecture" active={agentState === 'architecting'} />
              <AgentStep status={agentState === 'coding' ? 'active' : (['reviewing','done'].includes(agentState)) ? 'completed' : 'idle'} label="Fabrication" active={agentState === 'coding'} />
              <AgentStep status={agentState === 'reviewing' ? 'active' : agentState === 'done' ? 'completed' : 'idle'} label="Deployment" active={agentState === 'reviewing'} />
            </div>
          </section>
        </div>
        <div className="p-4 border-t border-white/5 bg-[#080808] min-w-[320px]"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 ring-2 ring-black"></div><div className="text-sm font-bold text-gray-200">Commander</div></div></div>
      </div>

      {showSidebar && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-20 lg:hidden" onClick={() => setShowSidebar(false)}></div>}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative z-10">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><Maximize2 size={20} /></button>
            <div className="h-8 w-px bg-white/5 mx-1"></div>
            <div className="bg-white/5 p-1 rounded-xl flex">
              <button onClick={() => setActiveTab('editor')} className={`px-5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'editor' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><Code size={14} /> Code</button>
              <button onClick={() => setActiveTab('preview')} className={`px-5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><Eye size={14} /> View</button>
            </div>
          </div>
          <div className="flex items-center gap-2"><button className="px-4 py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white flex items-center gap-2"><Download size={16} /> Deploy</button></div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          <div className="flex-1 flex flex-col min-h-0 border-r border-white/5 relative">
            {activeTab === 'editor' ? (
              <div className="flex-1 bg-[#0A0C10] overflow-hidden flex flex-col"><textarea value={generatedCode} onChange={(e) => setGeneratedCode(e.target.value)} className="flex-1 w-full bg-transparent text-gray-300 font-mono p-6 resize-none focus:outline-none text-sm" spellCheck="false" /></div>
            ) : (
              <div className="flex-1 bg-white overflow-hidden relative">
                {generatedCode.includes('div') ? (
                  <iframe className="w-full h-full border-none" srcDoc={`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://cdn.tailwindcss.com"></script><style>.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style></head><body>${generatedCode}</body></html>`} title="Preview" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-6"><LayoutTemplate size={64} className="opacity-20" /><p className="font-mono text-sm opacity-50">Awaiting Output...</p></div>
                )}
              </div>
            )}
          </div>

          <div className="h-[40vh] lg:h-auto lg:w-[400px] bg-[#080808] flex flex-col border-t lg:border-t-0 border-white/5 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20">
            <div className="flex-1 flex flex-col min-h-0 border-b border-white/5">
              <div className="px-4 py-3 bg-[#0A0A0A] border-b border-white/5 flex justify-between"><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Terminal size={12} /> Logs</span><RefreshCw size={12} className="text-gray-600"/></div>
              <div ref={terminalRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 text-gray-400 scrollbar-none">{logs.map((l) => <TerminalLine key={l.id} text={l.text} type={l.type} />)}</div>
            </div>
            <div className="p-4 bg-[#0A0A0A]">
              <div className="mb-3 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 blur"></div>
                <div className="relative">
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Initiate build..." className="w-full bg-[#050505] rounded-xl p-4 pr-12 text-sm focus:outline-none text-white placeholder-gray-600" />
                  <button onClick={handleGenerate} disabled={isGenerating || !input.trim()} className="absolute bottom-3 right-3 p-2.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500"><Play size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
