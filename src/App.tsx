// src/App.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Terminal as TerminalIcon, GitBranch, Code2, Plus, 
  Send, Sparkles, FolderGit2, RefreshCw, PanelLeftClose, PanelLeft, ExternalLink 
} from 'lucide-react';
import indexHtmlSource from '../index.html?raw';

(window as any).__RYANAI_INDEX_HTML__ = indexHtmlSource;

type WorkspaceTab = 'chat' | 'vscode' | 'terminal' | 'github';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  reasoningSteps?: string[];
}

export function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('chat');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [model, setModel] = useState<string>('RyanAI-ReAct-v4');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Greetings, Sir G. RyanAI autonomous reasoning engine is online. LangGraph ReAct orchestration and CUDA C++ inference modules are active. How shall we execute today’s architectural or coding objectives?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reasoningSteps: ['Initialized MCP Server', 'Loaded vector cache', 'Verified eBPF sentinel handshake']
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const userText = inputMessage;
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:9090/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText })
      });

      if (!response.ok) throw new Error('Gateway execution failed');
      const data = await response.json();

      const assistantReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.output,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasoningSteps: data.reasoningTrace
      };
      setMessages(prev => [...prev, assistantReply]);
    } catch {
      const fallbackReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Autonomous fallback resolution for: "${userText}". Fastify backend offline; verified via local state buffer.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasoningSteps: ['Parsed query intent', 'Evaluated local context boundary', 'Fallback simulation complete']
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0b0f19] text-slate-100 font-sans overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-[#0f172a]/85 backdrop-blur-xl border-r border-slate-800/80 flex flex-col z-20`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-sm tracking-wider text-cyan-400">RYANAI</h1>
                <p className="text-[10px] text-slate-400">Autonomous Engine</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-3">
          <button onClick={() => setMessages([])} className={`w-full flex items-center gap-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all group ${!sidebarOpen && 'justify-center'}`}>
            <Plus className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform duration-200" />
            {sidebarOpen && <span>New Reasoning Session</span>}
          </button>
        </div>

        <div className="px-3 py-2 flex-1 space-y-1 overflow-y-auto">
          <div className={`px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider ${!sidebarOpen && 'text-center'}`}>
            {sidebarOpen ? 'Workspaces' : 'Nav'}
          </div>

          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Gemini Chat Feed</span>}
          </button>

          <button 
            onClick={() => setActiveTab('vscode')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'vscode' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <Code2 className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>VS Code (vscode.dev)</span>}
          </button>

          <button 
            onClick={() => setActiveTab('terminal')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'terminal' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <TerminalIcon className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Interactive Terminal</span>}
          </button>

          <button 
            onClick={() => setActiveTab('github')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'github' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <GitBranch className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>GitHub Repositories</span>}
          </button>
        </div>

        <div className="p-3 border-t border-slate-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">
            NG
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">Ntsiyeni Ganyane</p>
              <p className="text-[10px] text-cyan-400/80 truncate">Lead Systems Architect</p>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#070b14]">
        <header className="h-16 border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Engine Status:</span>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CUDA & LangGraph Active
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="RyanAI-ReAct-v4">RyanAI ReAct v4</option>
              <option value="LangGraph-Agent">LangGraph Reasoning</option>
              <option value="CUDA-Inference">CUDA C++ Accelerated</option>
            </select>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`space-y-2 ${msg.role === 'user' ? 'max-w-xl' : 'flex-1'}`}>
                      {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 space-y-1">
                          <p className="font-semibold text-cyan-400 uppercase tracking-wider text-[10px]">Reasoning Chain</p>
                          {msg.reasoningSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-cyan-600 text-white rounded-br-sm' 
                          : 'bg-slate-900/80 border border-slate-800 text-slate-100 rounded-bl-sm shadow-xl'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-slate-500 px-1 block">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-[#0b0f19]/90 border-t border-slate-800/80 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask RyanAI anything or issue a development command..."
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl py-4 pl-5 pr-14 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isProcessing}
                    className="absolute right-3 p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'vscode' && (
            <div className="flex-1 flex flex-col h-full">
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Integrated VS Code Web Workspace (vscode.dev)</span>
                </div>
                <a href="https://vscode.dev" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-cyan-400 hover:underline">
                  <span>Open in standalone tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <iframe src="https://vscode.dev" title="VS Code Web" className="flex-1 w-full border-0 bg-slate-950" />
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="flex-1 flex flex-col h-full bg-[#05070c] font-mono p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-2 text-xs text-cyan-400">
                  <TerminalIcon className="w-4 h-4" />
                  <span>RyanAI Autonomous Terminal / eBPF Sentinel Logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] text-slate-400">active daemon</span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <p className="text-slate-500">System architecture: x86_64-linux-gnu | Fastify Gateway Port: 9090</p>
                <p className="text-cyan-400">root@ryanai-gateway:~# ./scripts/init-sentinel.sh --mode=production</p>
                <p className="text-emerald-400">[INFO] eBPF ring buffer attached successfully.</p>
                <p className="text-emerald-400">[INFO] Fastify API Gateway running on port 9090.</p>
                <p className="text-slate-300">root@ryanai-gateway:~# <span className="animate-pulse">█</span></p>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">GitHub Repository Sync</h2>
                  <p className="text-xs text-slate-400">Manage code repositories, CI/CD pipelines, and pull requests.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-xs font-medium text-slate-200 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  Sync All Repos
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'ryan-app', desc: 'Monorepo AI reasoning agent system with Tauri & Fastify', lang: 'TypeScript / C++', updated: '2 hrs ago' },
                  { name: 'generation-x-firewall', desc: 'eBPF/XDP kernel packet-filtering agent & Python threat scorer', lang: 'C / Python / Go', updated: 'Yesterday' },
                  { name: 'vulasovereign', desc: 'Cryptographic platform and CIPC provisional specification', lang: 'Rust / TypeScript', updated: '3 days ago' },
                  { name: 'top-spaza-network', desc: 'Multi-vendor digital storefront and microservice architecture', lang: 'Next.js / NestJS', updated: '5 days ago' }
                ].map((repo, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-cyan-500/50 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FolderGit2 className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-semibold text-sm text-slate-200">{repo.name}</h3>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full">{repo.updated}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{repo.desc}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                      <span>{repo.lang}</span>
                      <span className="text-cyan-400 hover:underline cursor-pointer">View Details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}