import { Info, Cpu, Shield, Code, Heart } from 'lucide-react';
import Modal from './Modal';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="About RyanAI" icon={<Info size={16} />} maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Hero */}
        <div className="text-center py-4">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-emerald-400/10 blur-xl" />
            <div className="relative w-16 h-16 rounded-2xl bg-ink-900/80 border border-cyan-500/30 flex items-center justify-center">
              <span className="font-display font-black text-2xl text-cyan-400 glow-cyan">R</span>
            </div>
          </div>
          <h2 className="font-display font-bold text-xl text-cyan-200 glow-cyan">RYANAI</h2>
          <p className="text-xs text-ink-500 font-mono mt-1 tracking-wider uppercase">Autonomous Reasoning Engine</p>
        </div>

        {/* Dedication */}
        <div className="bg-ink-800/40 rounded-xl p-4 border border-cyan-500/15">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={14} className="text-rose-400" />
            <span className="text-xs font-mono text-ink-400 uppercase tracking-wider">Dedication</span>
          </div>
          <p className="text-sm text-ink-300 leading-relaxed">
            Named after <strong className="text-cyan-200">Mukhethwa Ryan Ganyane</strong>, son of
            Ntsiyeni Ganyane. This platform is a personal engineering legacy — built to evolve
            alongside the frontier of modern computing.
          </p>
        </div>

        {/* Architect */}
        <div>
          <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">The Architect</h3>
          <p className="text-sm text-ink-300 leading-relaxed mb-3">
            <strong className="text-cyan-200">Ntsiyeni Ganyane</strong> — known across technical, academic,
            and enterprise circles as <strong className="text-cyan-200">Sir G</strong> — is a South African
            systems architect, software developer, and technology entrepreneur. Born June 19, 1991, he
            operates at the convergence of low-level systems engineering, advanced AI orchestration, and
            sovereign digital infrastructure.
          </p>
          <p className="text-sm text-ink-400 leading-relaxed">
            Working fluently across C++, CUDA, Go, Python, and TypeScript, his engineering portfolio
            focuses on high-performance compute, machine learning compilation, and decentralized
            architectures.
          </p>
        </div>

        {/* Systems portfolio */}
        <div>
          <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2.5">Systems Portfolio</h3>
          <div className="space-y-2">
            <PortfolioItem
              icon={<Cpu size={14} />}
              name="Project Ryan (RyanAI)"
              desc="Autonomous AI reasoning agent — LangGraph state persistence, WebSocket backends"
            />
            <PortfolioItem
              icon={<Shield size={14} />}
              name="Generation X Firewall"
              desc="High-performance network security engine in Go using WinDivert for kernel-level packet inspection"
            />
            <PortfolioItem
              icon={<Shield size={14} />}
              name="VulaSovereign"
              desc="Independent decentralized identity and cryptographic platform for self-sovereign identity"
            />
            <PortfolioItem
              icon={<Code size={14} />}
              name="Nexus-UNMS"
              desc="UJ WiFi authentication system — kernel-level packet filtering for high-density environments"
            />
            <PortfolioItem
              icon={<Code size={14} />}
              name="ITSM Agent System"
              desc="Bespoke IT service management platform for focused operational intelligence"
            />
          </div>
        </div>

        {/* Architecture */}
        <div>
          <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">Architecture</h3>
          <div className="grid grid-cols-2 gap-2">
            <ArchItem label="Orchestration" value="LangGraph ReAct" />
            <ArchItem label="Observability" value="OpenTelemetry" />
            <ArchItem label="Memory" value="Persistent Graph" />
            <ArchItem label="Transport" value="WebSocket / SSE" />
            <ArchItem label="Models" value="Gemini · Claude · GPT" />
            <ArchItem label="Deployment" value="Tauri · Vercel" />
          </div>
        </div>

        <p className="text-center text-[10px] text-ink-600 font-mono pt-2 border-t border-cyan-500/10">
          Built by Ntsiyeni Ganyane (Sir G) · RMN Ganyane (Pty) Ltd · Uncle Security Services
        </p>
      </div>
    </Modal>
  );
}

function PortfolioItem({ icon, name, desc }: { icon: React.ReactNode; name: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 bg-ink-800/30 rounded-lg p-3 border border-cyan-500/10">
      <span className="text-cyan-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs font-medium text-cyan-200">{name}</p>
        <p className="text-[11px] text-ink-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ArchItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-800/30 rounded-lg p-2.5 border border-cyan-500/10">
      <p className="text-[9px] font-mono text-ink-500 uppercase tracking-wider">{label}</p>
      <p className="text-xs text-cyan-200 mt-0.5">{value}</p>
    </div>
  );
}
