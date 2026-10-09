'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Activity, ShieldAlert, Send } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  source: 'SYSTEM' | 'AGENT' | 'eBPF' | 'USER';
  message: string;
}

export default function RyanAIWorkspace() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [socketStatus, setSocketStatus] = useState<'CONNECTING' | 'CONNECTED' | 'OFFLINE'>('CONNECTING');
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the terminal to the latest log
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Establish real-time WebSocket connection to the local Fastify Gateway
  useEffect(() => {
    const wssUrl = process.env.NEXT_PUBLIC_TELEMETRY_WSS || 'ws://localhost:8080/api/telemetry/stream';
    const ws = new WebSocket(wssUrl);

    ws.onopen = () => {
      setSocketStatus('CONNECTED');
      appendLog('SYSTEM', 'Secure tunnel established. Awaiting telemetry...');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Map LangGraph and eBPF events to the console
        const source = data.type === 'eBPF_alert' ? 'eBPF' : 'AGENT';
        appendLog(source, JSON.stringify(data.payload || data));
      } catch (e) {
        appendLog('SYSTEM', event.data);
      }
    };

    ws.onclose = () => setSocketStatus('OFFLINE');
    ws.onerror = () => setSocketStatus('OFFLINE');

    return () => ws.close(); // Cleanup on unmount
  }, []);

  const appendLog = (source: LogEntry['source'], message: string) => {
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString('en-ZA', { hour12: false }),
      source,
      message
    }]);
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const command = input.trim();
    setInput('');
    appendLog('USER', command);
    setIsProcessing(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_INFERENCE_URL || 'http://localhost:8080/api/inference/execute';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: command, agentId: 'supervisor-01' })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gateway timeout');
      
      // Success is handled silently here; the actual reasoning steps 
      // will stream back through the WebSocket connection automatically.
    } catch (error: any) {
      appendLog('SYSTEM', `[ERR] Command failed to dispatch: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-8 flex flex-col">
      {/* Header / HUD Status */}
      <header className="flex items-center justify-between border-b border-cyan-900/50 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Cpu className="text-cyan-400 w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold text-cyan-50 tracking-wider uppercase">RyanAI Core</h1>
            <p className="text-xs text-cyan-500/70">Autonomous Reasoning Platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400">Gateway:</span>
            <span className={socketStatus === 'CONNECTED' ? 'text-cyan-400 shadow-cyan-400/50 drop-shadow-md' : 'text-red-500'}>
              {socketStatus}
            </span>
          </div>
        </div>
      </header>

      {/* Main Terminal Area */}
      <main className="flex-1 flex flex-col bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.05)] relative">
        
        {/* Logs Output */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 text-sm leading-relaxed">
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
              <span className={`shrink-0 font-bold w-16 ${
                log.source === 'USER' ? 'text-blue-400' :
                log.source === 'eBPF' ? 'text-red-400' :
                log.source === 'SYSTEM' ? 'text-slate-400' :
                'text-cyan-400'
              }`}>
                {log.source}
              </span>
              <span className={log.source === 'USER' ? 'text-slate-200' : 'text-slate-400'}>
                {log.message}
              </span>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-4 text-sm text-cyan-400/70 animate-pulse">
              <span className="w-16"></span>
              <span>Supervisor computing next routing edge...</span>
            </div>
          )}
          <div ref={consoleEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleCommandSubmit} className="border-t border-slate-800 bg-slate-950 p-4">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-cyan-500 font-bold">❯</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={socketStatus !== 'CONNECTED'}
              placeholder={socketStatus === 'CONNECTED' ? "Enter architecture command or query telemetry..." : "Waiting for gateway connection..."}
              className="w-full bg-slate-900 border border-slate-700 rounded text-slate-200 pl-10 pr-12 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isProcessing || socketStatus !== 'CONNECTED'}
              className="absolute right-3 text-slate-400 hover:text-cyan-400 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
