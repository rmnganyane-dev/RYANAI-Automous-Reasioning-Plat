import { useState } from 'react';
import { Terminal, Cpu, Database, RefreshCw, ShieldCheck } from 'lucide-react';
import { ChatStream } from '@/components/ChatStream';
import { useAgentStore } from '@/store/agentStore';
export function App() {
    const [activeTab, setActiveTab] = useState('chat');
    const { sessionId, clearSession, activeTool } = useAgentStore();
    return (<div className="flex h-screen w-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-900 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white">
              R
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm tracking-wide truncate">RyanAI Platform</h1>
              <p className="text-xs text-neutral-400 font-mono truncate">
                Session: {sessionId.slice(0, 8)}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <button onClick={() => setActiveTab('chat')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'chat'
            ? 'bg-neutral-800 text-sky-400'
            : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'}`}>
              <Terminal className="w-4 h-4"/>
              <span>Reasoning Stream</span>
            </button>
            <button onClick={() => setActiveTab('telemetry')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'telemetry'
            ? 'bg-neutral-800 text-sky-400'
            : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'}`}>
              <Cpu className="w-4 h-4"/>
              <span>CUDA & Telemetry</span>
            </button>
            <button onClick={() => setActiveTab('vector')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'vector'
            ? 'bg-neutral-800 text-sky-400'
            : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'}`}>
              <Database className="w-4 h-4"/>
              <span>Vector Memory</span>
            </button>
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-neutral-800">
          {activeTool && (<div className="px-3 py-2 bg-sky-950/40 border border-sky-800/50 rounded text-xs text-sky-300 flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 animate-pulse"/>
              <span className="truncate">Tool: {activeTool}</span>
            </div>)}
          <button onClick={clearSession} className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs font-medium transition-colors">
            <RefreshCw className="w-3.5 h-3.5"/>
            <span>Reset Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
        <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/50">
          <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
            <span>Runtime: ONLINE (Port 3000)</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-neutral-400 font-mono">
              local@ryanai.local
            </span>
            <span className="text-xs text-neutral-500 font-mono">v1.0.0-prod</span>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-hidden">
          {activeTab === 'chat' && <ChatStream />}
          {activeTab === 'telemetry' && (<div className="p-6 bg-neutral-900 rounded-lg border border-neutral-800 font-mono text-sm space-y-4">
              <h2 className="text-sky-400 font-bold">OpenTelemetry & CUDA Engine Diagnostics</h2>
              <p className="text-neutral-400">Active OpenTelemetry Collector: http://localhost:4318</p>
              <p className="text-neutral-400">CUDA Inference Core: Initialized (Device 0)</p>
            </div>)}
          {activeTab === 'vector' && (<div className="p-6 bg-neutral-900 rounded-lg border border-neutral-800 font-mono text-sm space-y-4">
              <h2 className="text-sky-400 font-bold">pgvector & Redis Semantic Cache</h2>
              <p className="text-neutral-400">HNSW Index Status: Optimized (vector_cosine_ops)</p>
            </div>)}
        </div>
      </main>
    </div>);
}
export default App;
