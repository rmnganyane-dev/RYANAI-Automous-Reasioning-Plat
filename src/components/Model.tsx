import { Cpu } from 'lucide-react';
import type { ModelMeta } from '@/lib/types';

interface ModelProps {
  model: ModelMeta;
  selected: boolean;
  onSelect: () => void;
}

export default function Model({ model, selected, onSelect }: ModelProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/10 last:border-0 ${selected ? 'bg-cyan-500/5' : ''}`}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${model.color}20`, border: `1px solid ${model.color}40` }}
      >
        <Cpu size={14} style={{ color: model.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-ink-200">{model.label}</p>
        <p className="text-[10px] text-ink-500 mt-0.5">{model.vendor}</p>
        <p className="text-[9px] text-ink-600 mt-0.5">{model.description}</p>
      </div>
    </button>
  );
}
