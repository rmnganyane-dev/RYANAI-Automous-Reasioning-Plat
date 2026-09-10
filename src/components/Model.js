import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Cpu } from 'lucide-react';
export default function Model({ model, selected, onSelect }) {
    return (_jsxs("button", { type: "button", onClick: onSelect, className: `w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/10 last:border-0 ${selected ? 'bg-cyan-500/5' : ''}`, children: [_jsx("div", { className: "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", style: { backgroundColor: `${model.color}20`, border: `1px solid ${model.color}40` }, children: _jsx(Cpu, { size: 14, style: { color: model.color } }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs font-medium text-ink-200", children: model.label }), _jsx("p", { className: "text-[10px] text-ink-500 mt-0.5", children: model.vendor }), _jsx("p", { className: "text-[9px] text-ink-600 mt-0.5", children: model.description })] })] }));
}
