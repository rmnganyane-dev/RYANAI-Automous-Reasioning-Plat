import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal as TerminalIcon, Folder, Play, ShieldCheck, Cpu, Activity,
  CheckCircle2, AlertTriangle, X, RefreshCw, Layers, Code2, Sparkles,
  Trash2, RotateCcw, Server, LogOut, Wifi, Hash, ChevronRight, ChevronDown
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

// ==========================================
// MOCK DATA & CONSTANTS
// ==========================================
const INITIAL_PROJECTS = [
  {
    id: 'proj-1', name: 'ryan-ai-core', type: 'folder',
    children: [
      {
        id: 'p1-f1', name: 'voice', type: 'folder',
        children: [
          { id: 'elevenlabs_ws.ts', name: 'elevenlabs_ws.ts', type: 'file', language: 'typescript' },
          { id: 'twilio_voice_sip.py', name: 'twilio_voice_sip.py', type: 'file', language: 'python' }
        ]
      },
      {
        id: 'p1-f2', name: 'agents', type: 'folder',
        children: [
          { id: 'transcend_guard.rs', name: 'transcend_guard.rs', type: 'file', language: 'rust' },
          { id: 'decision_graph.py', name: 'decision_graph.py', type: 'file', language: 'python' }
        ]
      },
      { id: 'main.py', name: 'main.py', type: 'file', language: 'python' }
    ]
  },
  {
    id: 'proj-2', name: 'fastify-gateway', type: 'folder',
    children: [
      { id: 'server.ts', name: 'server.ts', type: 'file', language: 'typescript' },
      { id: 'whatsapp_notify.ts', name: 'whatsapp_notify.ts', type: 'file', language: 'typescript' }
    ]
  },
  {
    id: 'proj-3', name: 'ebpf-sentinel', type: 'folder',
    children: [
      { id: 'trace_kernel.c', name: 'trace_kernel.c', type: 'file', language: 'c' },
      { id: 'policy.yaml', name: 'policy.yaml', type: 'file', language: 'yaml' }
    ]
  }
];

const INITIAL_FILE_CONTENTS: Record<string, string> = {
  'elevenlabs_ws.ts': `// RyanAI Realtime Voice Engine & WebRTC Bridge
import { WebSocketServer } from 'ws';
import { TranscendPolicyGuard } from '../agents/transcend_guard';

export class RyanVoiceServer {
  private wss: WebSocketServer;
  private voiceId: string = "ryan-jarvis-matrix-v4";
  
  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({ port });
    console.log(\`[RYAN-VOICE] Socket server active on port \${port}\`);
  }

  public async initiateOutboundCall(targetPhone: string): Promise<boolean> {
    const isAllowed = await TranscendPolicyGuard.evalRule({
      action: "TELEPHONY_OUTBOUND_CALL",
      target: targetPhone,
      requester: "RyanAI_Kernel"
    });
    return isAllowed;
  }
}`,
  'transcend_guard.rs': `// Transcend Policy & Governance Engine (Rust eBPF Guard)
pub struct PolicyRule {
    pub rule_id: &'static str,
    pub action_type: &'static str,
    pub enforce_strict: bool,
}

impl PolicyRule {
    pub fn verify_execution(&self, command: &str) -> Result<bool, &'static str> {
        if command.contains("rm -rf /") || command.contains("drop database") {
            return Err("TRANSCEND_POLICY_VIOLATION: Destructive command intercepted");
        }
        Ok(true)
    }
}`,
  'main.py': `"""
RyanAI Master Orchestration Core
Coordinates Architecture -> Dev -> Build -> Test -> Ship pipeline
"""
import time

class RyanCore:
    def run_pipeline(self):
        print("[RyanAI] Initiating 5-Phase Deployment Sequence...")
        return {"status": "SUCCESS", "version": "v4.5.0-matrix"}

if __name__ == "__main__":
    RyanCore().run_pipeline()`,
  'server.ts': `import Fastify from 'fastify';
const server = Fastify({ logger: true });
server.post('/api/ryan/pipeline', async () => ({ status: 'SUCCESS' }));
server.listen({ port: 3000 });`,
  'whatsapp_notify.ts': `export async function sendWhatsAppNotification(to: string, message: string) {
  console.log(\`[WHATSAPP DISPATCH] Alert sent to \${to}\`);
  return { success: true };
}`,
  'trace_kernel.c': `// eBPF Sentinel Kernel Trace - RyanAI Runtime Protection
#include <uapi/linux/ptrace.h>
SEC("kprobe/sys_execve")
int trace_ryan_exec(struct pt_regs *ctx) {
    bpf_trace_printk("eBPF Sentinel Intercepted execve\\n");
    return 0;
}`,
  'policy.yaml': `version: "1.0"
name: transcend-kernel-policy
rules:
  - id: RYAN-RULE-01
    action: DENY`
};

const INITIAL_GOVERNANCE_ERRORS = [
  {
    id: 'ERR-EBPF-901', ruleId: 'TRANSCEND-SEC-01', severity: 'CRITICAL',
    category: 'eBPF Intercept', target: 'sys_execve("/usr/bin/raw_disk_wipe")',
    timestamp: '17:42:01.082', fixed: false
  },
  {
    id: 'ERR-GOV-404', ruleId: 'RULE-VOICE-04', severity: 'HIGH',
    category: 'Policy Violation', target: 'Twilio Outbound SIP Call without JWT Expiry',
    timestamp: '17:39:12.441', fixed: false
  },
  {
    id: 'ERR-ALIGN-108', ruleId: 'PERF-ALIGN-09', severity: 'WARN',
    category: 'Memory Alignment', target: 'Rust transcend_guard buffer overflow risk',
    timestamp: '17:28:55.912', fixed: false
  }
];

const INITIAL_RECYCLED_ITEMS = [
  { id: 'REC-001', name: 'prompt_v3_deprecated_refactor.json', type: 'Prompt State', size: '14.2 KB' },
  { id: 'REC-002', name: 'legacy_telemetry_collector.rs', type: 'Code Artifact', size: '42.8 KB' },
  { id: 'REC-003', name: 'agent_snapshot_2026-09-10_crash.bin', type: 'Agent Snapshot', size: '128.4 MB' }
];

// ==========================================
// VISUAL COMPONENTS
// ==========================================
const MatrixRainCanvas = ({ opacity = 0.25 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const characters = 'アカサタナハマヤラワイウエオ0123456789ABCDEF⚡🛡️<>[]{}/=+-*';
    const fontSize = 13;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const isCyan = (i % 6 === 0);
        
        ctx.fillStyle = isCyan ? '#00f3ff' : '#00ff66';
        ctx.shadowBlur = isCyan ? 6 : 4;
        ctx.shadowColor = isCyan ? '#00f3ff' : '#00ff66';

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ opacity }}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
    />
  );
};

const JarvisArcReactor = ({ isActive = false }) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <motion.div
        animate={{ rotate: isActive ? 360 : 0 }}
        transition={{ duration: isActive ? 2 : 10, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 border-b-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.4)]"
      >
        <motion.div
          animate={{ rotate: isActive ? -360 : 0 }}
          transition={{ duration: isActive ? 3 : 8, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-2 border-emerald-500/50 border-l-emerald-400 border-r-emerald-400 flex items-center justify-center"
        >
          <div className={`w-8 h-8 rounded-full ${isActive ? 'bg-cyan-300 shadow-[0_0_20px_#00f3ff] animate-pulse' : 'bg-cyan-900/50'}`} />
        </motion.div>
      </motion.div>
      <div className="absolute top-0 font-mono text-[10px] text-cyan-400 tracking-widest mt-2">RYAN CORE</div>
    </div>
  );
};

// ==========================================
// AUTH PAGE COMPONENT
// ==========================================
interface AuthPageProps {
  onSignIn: (email: string, name: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full bg-slate-950/80 backdrop-blur-sm">
      <div className="p-8 rounded-xl border border-cyan-900/50 bg-slate-900/90 shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Cpu className="w-12 h-12 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-mono font-bold text-center text-cyan-50 mb-8">RyanAI Kernel Access</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1">IDENTIFIER (EMAIL)</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="sysadmin@ryan.ai"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-cyan-500 mb-1">OPERATOR NAME</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="Operator Alias"
            />
          </div>
          <button 
            onClick={() => onSignIn(email, name)}
            disabled={!email}
            className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-3 rounded transition-colors disabled:opacity-50"
          >
            INITIALIZE SESSION
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMMAND CENTER (MAIN UI)
// ==========================================
interface CommandCenterProps {
  onSignOut: () => void;
  userEmail: string;
  userFullName: string;
}

const CommandCenter: React.FC<CommandCenterProps> = ({ onSignOut, userEmail, userFullName }) => {
  const [activeTab, setActiveTab] = useState('deploy');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deploy State - FIXED: Typed with Record<string, string> to resolve TS7053 index signature error
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineState, setPipelineState] = useState<Record<string, string>>({
    arch: 'ready',
    dev: 'ready',
    build: 'ready',
    test: 'ready',
    ship: 'ready'
  });
  const [pipelineLogs, setPipelineLogs] = useState<string[]>(['[ORCHESTRATOR] RyanAI v4.5.0 Matrix Kernel initialized.']);
  const [targetEnv, setTargetEnv] = useState('production');
  
  // Governance State
  const [governanceErrors, setGovernanceErrors] = useState(INITIAL_GOVERNANCE_ERRORS);
  const [isShieldActive, setIsShieldActive] = useState(true);
  const [errorFilter, setErrorFilter] = useState('ALL');
  
  // Recycling State
  const [recycledItems, setRecycledItems] = useState(INITIAL_RECYCLED_ITEMS);
  
  // Workspace State
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['proj-1', 'p1-f1', 'p1-f2']));
  const [activeFileId, setActiveFileId] = useState('main.py');
  
  // Telemetry & Sweep State
  const [telemetry, setTelemetry] = useState({ cpu: 14.2, ram: 4.1, gpu: 62.0, sysCallCount: 149200, networkLatency: 12, activeThreads: 42 });
  const [isSweeping, setIsSweeping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        cpu: +(12 + Math.random() * 8).toFixed(1),
        ram: +(4.0 + Math.random() * 0.3).toFixed(2),
        gpu: +(58 + Math.random() * 10).toFixed(1),
        sysCallCount: prev.sysCallCount + Math.floor(Math.random() * 50) + 10,
        networkLatency: +(10 + Math.random() * 8).toFixed(0),
        activeThreads: Math.max(30, prev.activeThreads + (Math.random() > 0.5 ? 1 : -1))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const trigger5PhasePipeline = () => {
    if (isPipelineRunning) return;
    setIsPipelineRunning(true);
    setPipelineState({ arch: 'running', dev: 'ready', build: 'ready', test: 'ready', ship: 'ready' });
    setPipelineLogs(prev => [`[${new Date().toLocaleTimeString()}] [PHASE 1/5: ARCH] Validating multi-repo dependency graph...`, ...prev]);

    const phases = [
      { key: 'arch', label: 'Architecture', delay: 1200 },
      { key: 'dev', label: 'Development', delay: 2500 },
      { key: 'build', label: 'Build', delay: 3800 },
      { key: 'test', label: 'Testing', delay: 5000 },
      { key: 'ship', label: 'Ship', delay: 6200 }
    ];

    phases.forEach((phase, idx) => {
      setTimeout(() => {
        setPipelineState(p => ({ ...p, [phase.key]: 'success' }));
        if (idx < phases.length - 1) {
          const nextPhase = phases[idx + 1];
          setPipelineState(p => ({ ...p, [nextPhase.key]: 'running' }));
          setPipelineLogs(prev => [`[${new Date().toLocaleTimeString()}] [PHASE ${idx + 2}/5: ${nextPhase.label.toUpperCase()}]...`, ...prev]);
        }
      }, phase.delay);
    });

    setTimeout(() => {
      setIsPipelineRunning(false);
      showToast(`✅ Successfully shipped v4.5.0 to ${targetEnv.toUpperCase()}`);
    }, 6500);
  };

  const handleApplyAutoFix = (errorId: string) => {
    setGovernanceErrors(prev => prev.map(err => err.id === errorId ? { ...err, fixed: true } : err));
    showToast(`✨ AI Auto-Fix applied for ${errorId}`);
  };

  const handleDiagnosticSweep = () => {
    setIsSweeping(true);
    showToast(`🔍 Diagnostic sweep initiated...`);
    setTimeout(() => {
      setIsSweeping(false);
      showToast(`✅ Diagnostics complete. Systems optimal.`);
    }, 2500);
  };

  const handleRestoreItem = (id: string) => {
    setRecycledItems(prev => prev.filter(i => i.id !== id));
    showToast(`🔄 Item restored to workspace`);
  };

  const handleConfirmPurge = (id: string) => {
    setRecycledItems(prev => prev.filter(i => i.id !== id));
    showToast(`🗑️ Item permanently purged`);
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderProjectTree = (items: any[]) => (
    <div className="pl-4 space-y-1">
      {items.map(item => (
        <div key={item.id}>
          {item.type === 'folder' ? (
            <>
              <button
                onClick={() => toggleFolder(item.id)}
                className="flex items-center space-x-2 text-slate-300 hover:text-slate-100 text-sm font-mono w-full py-1"
              >
                {expandedFolders.has(item.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <Folder className="w-4 h-4 text-cyan-600" />
                <span>{item.name}</span>
              </button>
              {expandedFolders.has(item.id) && item.children && renderProjectTree(item.children)}
            </>
          ) : (
            <button 
              onClick={() => setActiveFileId(item.id)}
              className={`w-full text-left text-xs font-mono flex items-center space-x-2 px-2 py-1 rounded transition-colors ${activeFileId === item.id ? 'bg-cyan-900/40 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Code2 className="w-3 h-3" />
              <span>{item.name}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const filteredErrors = errorFilter === 'ALL' ? governanceErrors : governanceErrors.filter(e => e.severity === errorFilter || (errorFilter === 'FIXED' && e.fixed));

  return (
    <div className="relative z-10 flex h-full bg-slate-950/80 backdrop-blur-sm text-slate-300 font-sans overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-500/30">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-mono font-bold text-cyan-50 tracking-wider text-sm">RYAN COMMAND</h2>
            <div className="text-[10px] font-mono text-cyan-500">v4.5.0 Matrix</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 font-mono text-sm">
          {[
            { id: 'deploy', icon: Play, label: 'Orchestrator' },
            { id: 'workspace', icon: Code2, label: 'Workspace' },
            { id: 'governance', icon: ShieldCheck, label: 'Governance' },
            { id: 'telemetry', icon: Activity, label: 'Telemetry' },
            { id: 'recycling', icon: Trash2, label: 'Recycle Bin' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded border transition-colors ${
                activeTab === tab.id 
                  ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-300' 
                  : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4">
            <div className="text-xs font-mono text-slate-400 truncate">{userFullName || 'Operator'}</div>
            <div className="text-[10px] font-mono text-cyan-600 truncate">{userEmail}</div>
          </div>
          <button 
            onClick={onSignOut}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>DISCONNECT</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/40">
          <div className="font-mono text-sm text-cyan-400 flex items-center space-x-2">
            <TerminalIcon className="w-4 h-4" />
            <span className="uppercase">{activeTab} MODULE</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {/* DEPLOY TAB */}
              {activeTab === 'deploy' && (
                <div className="grid grid-cols-3 gap-6 h-full">
                  <div className="col-span-2 space-y-6 flex flex-col h-full">
                    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-mono text-lg text-slate-200">5-Phase Pipeline</h3>
                          <p className="text-xs text-slate-500 mt-1">Arch → Dev → Build → Test → Ship</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <select value={targetEnv} onChange={(e) => setTargetEnv(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300">
                            <option>staging</option>
                            <option>canary</option>
                            <option>production</option>
                          </select>
                          <button 
                            onClick={trigger5PhasePipeline}
                            disabled={isPipelineRunning}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-mono rounded text-sm flex items-center space-x-2 transition-colors"
                          >
                            {isPipelineRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            <span>{isPipelineRunning ? 'EXECUTING...' : 'INITIATE'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between gap-2 mb-4">
                        {['arch', 'dev', 'build', 'test', 'ship'].map((phase) => (
                          <div key={phase} className="flex-1">
                            <div className={`h-1 rounded transition-colors ${
                              pipelineState[phase] === 'success' ? 'bg-emerald-500' : 
                              pipelineState[phase] === 'running' ? 'bg-cyan-500' :
                              'bg-slate-800'
                            }`} />
                            <div className="text-[10px] font-mono text-slate-500 mt-1 text-center capitalize">{phase}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-y-auto">
                      {pipelineLogs.map((log, i) => (
                        <div key={i} className={`mb-2 ${i === 0 ? 'text-cyan-400' : 'text-slate-500'}`}>{log}</div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1 bg-slate-900/40 border border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center">
                    <JarvisArcReactor isActive={isPipelineRunning} />
                  </div>
                </div>
              )}

              {/* WORKSPACE TAB */}
              {activeTab === 'workspace' && (
                <div className="flex h-full border border-slate-800 rounded-lg bg-slate-900/40 overflow-hidden">
                  <div className="w-72 border-r border-slate-800 p-4 overflow-y-auto">
                    <div className="font-mono text-xs text-cyan-400 mb-3 uppercase tracking-wider">Project Explorer</div>
                    {renderProjectTree(INITIAL_PROJECTS)}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-2 font-mono text-xs text-cyan-300 flex items-center justify-between">
                      <span>{activeFileId}</span>
                      <span className="text-[10px] text-slate-500">Read/Write Active</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs bg-slate-950 text-slate-300 overflow-y-auto whitespace-pre">
                      {INITIAL_FILE_CONTENTS[activeFileId] || '// Select a file to inspect'}
                    </div>
                  </div>
                </div>
              )}

              {/* GOVERNANCE TAB */}
              {activeTab === 'governance' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-slate-900/60 p-4 border border-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShieldCheck className={`w-6 h-6 ${isShieldActive ? 'text-emerald-400' : 'text-rose-400'}`} />
                      <div>
                        <div className="font-mono text-sm text-slate-200">Transcend Policy Guard</div>
                        <div className="text-xs text-slate-500">eBPF Real-time Threat & Rule Enforcement</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsShieldActive(!isShieldActive);
                        showToast(isShieldActive ? '⚠️ Shield deactivated' : '🛡️ Shield activated');
                      }}
                      className={`px-4 py-2 rounded font-mono text-xs transition-colors ${isShieldActive ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/50' : 'bg-rose-900/40 text-rose-300 border border-rose-500/50'}`}
                    >
                      {isShieldActive ? 'SHIELD ACTIVE' : 'SHIELD DISABLED'}
                    </button>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
                    <div className="font-mono text-sm text-slate-200 mb-4">Interception & Compliance Log</div>
                    <div className="space-y-3">
                      {governanceErrors.map(err => (
                        <div key={err.id} className="p-4 bg-slate-950 border border-slate-800 rounded flex items-center justify-between font-mono text-xs">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${err.severity === 'CRITICAL' ? 'bg-rose-900/50 text-rose-300' : err.severity === 'HIGH' ? 'bg-amber-900/50 text-amber-300' : 'bg-blue-900/50 text-blue-300'}`}>{err.severity}</span>
                              <span className="text-cyan-400">{err.ruleId}</span>
                              <span className="text-slate-500">({err.id})</span>
                            </div>
                            <div className="text-slate-300">{err.target}</div>
                          </div>
                          <div>
                            {err.fixed ? (
                              <span className="text-emerald-400 flex items-center space-x-1"><CheckCircle2 className="w-4 h-4" /><span>RESOLVED</span></span>
                            ) : (
                              <button 
                                onClick={() => handleApplyAutoFix(err.id)}
                                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
                              >
                                AUTO-FIX
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TELEMETRY TAB */}
              {activeTab === 'telemetry' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 font-mono">
                      <div className="text-xs text-slate-500 mb-1">CPU USAGE</div>
                      <div className="text-2xl text-cyan-400 font-bold">{telemetry.cpu}%</div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 font-mono">
                      <div className="text-xs text-slate-500 mb-1">RAM ALLOCATED</div>
                      <div className="text-2xl text-emerald-400 font-bold">{telemetry.ram} GB</div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 font-mono">
                      <div className="text-xs text-slate-500 mb-1">GPU ACCELERATION</div>
                      <div className="text-2xl text-purple-400 font-bold">{telemetry.gpu}%</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm text-slate-200 mb-1">Deep Diagnostic Sweep</div>
                      <div className="text-xs text-slate-500">Scan kernel modules, check memory fragmentation and socket health.</div>
                    </div>
                    <button
                      onClick={handleDiagnosticSweep}
                      disabled={isSweeping}
                      className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-mono text-xs rounded transition-colors flex items-center space-x-2"
                    >
                      {isSweeping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                      <span>{isSweeping ? 'SWEEPING...' : 'RUN SWEEP'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* RECYCLING TAB */}
              {activeTab === 'recycling' && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
                  <div className="font-mono text-sm text-slate-200 mb-4">Recycled Artifacts & Snapshots</div>
                  <div className="space-y-3">
                    {recycledItems.length === 0 ? (
                      <div className="text-center py-8 font-mono text-xs text-slate-500">Recycle bin is clean.</div>
                    ) : (
                      recycledItems.map(item => (
                        <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded flex items-center justify-between font-mono text-xs">
                          <div>
                            <div className="text-slate-200 mb-1">{item.name}</div>
                            <div className="text-slate-500 text-[10px]">{item.type} • {item.size}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleRestoreItem(item.id)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                            >
                              RESTORE
                            </button>
                            <button 
                              onClick={() => handleConfirmPurge(item.id)}
                              className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded transition-colors"
                            >
                              PURGE
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-lg shadow-2xl font-mono text-xs flex items-center space-x-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// ROOT APP COMPONENT
// ==========================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');

  const handleSignIn = (email: string, name: string) => {
    setUserEmail(email);
    setUserFullName(name || 'Operator');
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setUserFullName('');
  };

  return (
    <div className="relative h-screen w-screen bg-slate-950 overflow-hidden flex flex-col">
      <MatrixRainCanvas />
      {isAuthenticated ? (
        <CommandCenter 
          onSignOut={handleSignOut} 
          userEmail={userEmail} 
          userFullName={userFullName} 
        />
      ) : (
        <AuthPage onSignIn={handleSignIn} />
      )}
      <Analytics />
    </div>
  );
}
