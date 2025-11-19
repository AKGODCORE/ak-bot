import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Layers, Code, Eye, Settings, RefreshCw, Zap, LayoutTemplate, Activity, CheckCircle2, Maximize2, Minimize2, Save, Download } from 'lucide-react';

const globalStyles = `
  @keyframes orbit-1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes orbit-2 { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  .animate-orbit-slow { animation: orbit-1 20s linear infinite; }
  .animate-orbit-medium { animation: orbit-2 12s linear infinite; }
`;

const OrbitalLogo = () => (
  <div className="relative w-10 h-10 flex items-center justify-center">
    <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-orbit-slow" style={{borderRightColor: 'transparent'}}/>
    <div className="absolute inset-1 border-2 border-purple-500/40 rounded-full animate-orbit-medium" style={{borderLeftColor: 'transparent'}}/>
    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
  </div>
);

export default function NexusBuilder() {
  const [activeTab, setActiveTab] = useState('editor');
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState([]);
  const [generatedCode, setGeneratedCode] = useState('<!-- AI Agent Ready -->');
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = globalStyles;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setLogs(prev => [...prev, { text: `> Processing: ${input}`, type: 'cmd' }]);
    
    setTimeout(() => {
      setGeneratedCode(`
        <div class="min-h-screen bg-[#050505] text-white flex items-center justify-center font-sans">
          <div class="text-center p-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
            <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">AK BOt Live</h1>
            <p class="text-gray-400 text-lg">System generated successfully.</p>
            <div class="mt-8 grid grid-cols-3 gap-4">
               <div class="p-4 bg-black/40 rounded-xl border border-white/5">Fast</div>
               <div class="p-4 bg-black/40 rounded-xl border border-white/5">Secure</div>
               <div class="p-4 bg-black/40 rounded-xl border border-white/5">Orbital</div>
            </div>
          </div>
        </div>
      `);
      setIsGenerating(false);
      setActiveTab('preview');
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-80 bg-[#0A0A0A] border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/5 flex items-center gap-4">
          <OrbitalLogo />
          <div><h1 className="font-bold text-xl">AK BOt</h1><p className="text-[10px] text-blue-400">Orbital Engine</p></div>
        </div>
        <div className="p-6 text-gray-400 text-sm">System Online</div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col relative z-10">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur-xl">
          <div className="flex bg-white/5 rounded-lg p-1">
             <button onClick={() => setActiveTab('editor')} className={`px-4 py-1 rounded ${activeTab === 'editor' ? 'bg-blue-600' : ''}`}>Code</button>
             <button onClick={() => setActiveTab('preview')} className={`px-4 py-1 rounded ${activeTab === 'preview' ? 'bg-blue-600' : ''}`}>View</button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row">
           {activeTab === 'editor' ? (
             <textarea className="flex-1 bg-[#0A0C10] text-gray-300 p-6 font-mono text-sm resize-none focus:outline-none" value={generatedCode} readOnly />
           ) : (
             <iframe className="flex-1 bg-white" srcDoc={`<html><head><script src="https://cdn.tailwindcss.com"></script></head><body>${generatedCode}</body></html>`} />
           )}
           
           <div className="h-64 lg:h-auto lg:w-96 bg-[#080808] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col">
             <div className="flex-1 p-4 font-mono text-xs text-green-400 overflow-y-auto">
               {logs.map((l, i) => <div key={i}>{l.text}</div>)}
               {isGenerating && <div className="animate-pulse">Generating...</div>}
             </div>
             <div className="p-4 bg-[#0A0A0A]">
               <div className="relative">
                 <input value={input} onChange={e => setInput(e.target.value)} placeholder="Command..." className="w-full bg-[#050505] rounded-xl p-3 pr-12 text-sm text-white outline-none border border-white/10 focus:border-blue-500 transition" />
                 <button onClick={handleGenerate} className="absolute right-2 top-2 p-1 bg-blue-600 rounded-lg"><Play size={16} /></button>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
