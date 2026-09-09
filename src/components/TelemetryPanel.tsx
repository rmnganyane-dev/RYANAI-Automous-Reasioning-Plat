import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Cpu, Zap, Clock, Database, Terminal,
  Search, Calculator, Brain, Code, CheckCircle2, Loader2,
} from 'lucide-react';
import type { ToolStep, SystemStatus } from '@/lib/types';
import { modelMeta } from '@/lib/models';

interface TelemetryPanelProps {
  status: SystemStatus | null;
  steps: ToolStep[];
  sending: boolean;
}

export default function TelemetryPanel({ status, steps, sending }: TelemetryPanelProps) {
  return (
    <div className="h-full glass rounded-2xl flex flex-col overflow-hidden corner-brackets">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cyan-500/15">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-cyan-400" />
          <h3 className="text-xs font-display font-bold text-cyan-300 tracking-wider uppercase">
            Telemetry
          </h3>
          <span className={`ml-auto status-dot ${sending ? 'thinking' : 'online'}`} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* System metrics */}
        <div className="px-4 py-3 border-b border-cyan-500/10">
          <p className="text-[10px] font-mono text-ink-500 uppercase tracking-wider mb-2.5">System Status</p>
          <div className="space-y-2.5">
            <Metric
              icon={<Cpu size={12} />}
              label="CPU Load"
              value={status ? `${status.cpu.toFixed(0)}%` : '—'}
              progress={status?.cpu ?? 0}
              color="cyan"
            />
            <Metric
              icon={<Database size={12} />}
              label="Memory"
              value={status ? `${status.memory.toFixed(0)}%` : '—'}
              progress={status?.memory ?? 0}
              color="emerald"
            />
            <Metric
              icon={<Zap size={12} />}
              label="Latency"
              value={status ? `${status.latency}ms` : '—'}
              progress={status ? Math.min(status.latency / 2, 100) : 0}
              color="amber"
            />
            <Metric
              icon={<Clock size={12} />}
              label="Uptime"
              value={status?.uptime ?? '—'}
              progress={75}
              color="cyan"
            />
          </div>
        </div>

        {/* Token stats */}
        <div className="px-4 py-3 border-b border-cyan-500/10 grid grid-cols-2 gap-3">
          <div className="bg-ink-800/40 rounded-lg p-2.5 border border-cyan-500/10">
            <p className="text-[9px] font-mono text-ink-500 uppercase tracking-wider">Tokens In</p>
            <p className="text-lg font-display font-bold text-cyan-300 mt-0.5">
              {status?.tokensIn?.toLocaleString() ?? '0'}
            </p>
          </div>
          <div className="bg-ink-800/40 rounded-lg p-2.5 border border-emerald-500/10">
            <p className="text-[9px] font-mono text-ink-500 uppercase tracking-wider">Tokens Out</p>
            <p className="text-lg font-display font-bold text-emerald-300 mt-0.5">
              {status?.tokensOut?.toLocaleString() ?? '0'}
            </p>
          </div>
        </div>

        {/* Active model */}
        <div className="px-4 py-3 border-b border-cyan-500/10">
          <p className="text-[10px] font-mono text-ink-500 uppercase tracking-wider mb-2">Active Model</p>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: (status ? modelMeta(status.model).color : '#22d3ee') + '20',
                border: `1px solid ${(status ? modelMeta(status.model).color : '#22d3ee')}40`,
              }}
            >
              <Cpu size={14} style={{ color: status ? modelMeta(status.model).color : '#22d3ee' }} />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-200">
                {status ? modelMeta(status.model).label : 'Claude Sonnet 4.6'}
              </p>
              <p className="text-[10px] text-ink-500">
                {status ? modelMeta(status.model).vendor : 'Anthropic'}
              </p>
            </div>
          </div>
        </div>

        {/* Reasoning trace */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Terminal size={12} className="text-cyan-400" />
            <p className="text-[10px] font-mono text-ink-500 uppercase tracking-wider">
              Reasoning Trace
            </p>
            {sending && (
              <span className="ml-auto text-[9px] text-cyan-400 font-mono animate-pulse">LIVE</span>
            )}
          </div>

          {steps.length === 0 && !sending && (
            <div className="text-center py-6">
              <Terminal size={24} className="mx-auto text-ink-700 mb-2" />
              <p className="text-[10px] text-ink-600">No trace data yet</p>
              <p className="text-[9px] text-ink-700 mt-0.5">Trace appears during reasoning</p>
            </div>
          )}

          <AnimatePresence>
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-2"
              >
                <TraceStep step={step} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>

          {sending && steps.length === 0 && (
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-mono">
              <Loader2 size={12} className="animate-spin" />
              Initializing reasoning pipeline...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon, label, value, progress, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  progress: number;
  color: 'cyan' | 'emerald' | 'amber';
}) {
  const colors = {
    cyan: { bar: 'bg-cyan-400', text: 'text-cyan-300' },
    emerald: { bar: 'bg-emerald-400', text: 'text-emerald-300' },
    amber: { bar: 'bg-amber-400', text: 'text-amber-300' },
  };
  const c = colors[color];

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-ink-500">{icon}</span>
        <span className="text-[10px] font-mono text-ink-400 flex-1">{label}</span>
        <span className={`text-[10px] font-mono font-medium ${c.text}`}>{value}</span>
      </div>
      <div className="h-1 bg-ink-800/60 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${c.bar} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function TraceStep({ step, index }: { step: ToolStep; index: number }) {
  const icons: Record<string, React.ReactNode> = {
    web_search: <Search size={12} />,
    calculator: <Calculator size={12} />,
    memory_recall: <Brain size={12} />,
    code_executor: <Code size={12} />,
  };
  const isResult = step.type === 'tool_result';

  return (
    <div className={`flex items-start gap-2 ${isResult ? 'pl-5' : ''}`}>
      <div className={`shrink-0 mt-0.5 ${isResult ? 'text-emerald-400' : 'text-cyan-400'}`}>
        {isResult ? <CheckCircle2 size={12} /> : icons[step.name] || <Terminal size={12} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-ink-500">#{index + 1}</span>
          <span className="text-[10px] font-mono text-cyan-300 capitalize">
            {step.name.replace('_', ' ')}
          </span>
          {!isResult && step.status === 'running' && (
            <Loader2 size={10} className="animate-spin text-cyan-400" />
          )}
        </div>
        {isResult && step.result && (
          <p className="text-[10px] text-ink-400 mt-0.5 leading-relaxed font-mono">
            {step.result.slice(0, 120)}
            {step.result.length > 120 ? '...' : ''}
          </p>
        )}
        {!isResult && step.args && (
          <p className="text-[9px] text-ink-600 mt-0.5 font-mono">
            args: {JSON.stringify(step.args).slice(0, 80)}
          </p>
        )}
      </div>
    </div>
  );
}
